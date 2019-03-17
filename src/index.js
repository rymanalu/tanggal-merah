const {Command, flags} = require('@oclif/command')
const {cli} = require('cli-ux')
const moment = require('moment')

const api = require('./api')
const {configExists, createConfig, getApiKey, readConfig} = require('./helpers')

const today = moment().format('YYYY-MM-DD')

class TanggalMerahCommand extends Command {
  async run() {
    try {
      await this._bootstrap()

      // cli.action.start('starting', {stdout: true})

      await this._runCommand()
    } catch (error) {
      if (error.message !== 'SIGINT' && error.code !== 'EEXIT') {
        if (error.response) {
          const {status} = error.response

          if (status === 400) {
            await this._errorResponse('Something went wrong, please check your configuration')
          } else if (status === 401) {
            await this._errorResponse('API key is incorrect')
          } else if (status === 402) {
            await this._errorResponse('Free plans are limited to today\'s date and earlier, non-commercial use only')
          } else if (status === 429) {
            await this._errorResponse('Rate limit exceeded')
          } else if (status === 500) {
            await this._errorResponse('Holiday API is error')
          } else {
            await this._errorResponse(error.message)
          }
        } else {
          await this._errorResponse(error.message)
        }
      }
    }

    // cli.action.stop('stop')
  }

  async _bootstrap() {
    this._flags = this.parse(TanggalMerahCommand).flags

    if (!this._flags.init) {
      await getApiKey(this.config.configDir)
    }
  }

  async _errorResponse(errorMessage) {
    this.error(errorMessage)
  }

  async _runCommand() {
    if (this._flags.init) {
      await this._runInitCommand()
    } else {
      await this._runTanggalMerahCommand()
    }
  }

  async _runInitCommand() {
    const {configDir} = this.config

    if (await configExists(configDir)) {
      const stillContinue =
        await cli.confirm('Config file already exists. Want to rewrite?')

      if (!stillContinue) {
        this.exit()
      }
    }

    const apiKey = await cli.prompt('What is your API key?', {type: 'mask'})

    const country = await cli.prompt('What is your country in ISO 3166-2 format?')

    if (await createConfig(configDir, {apiKey, country})) {
      this.log('Config saved')
    } else {
      this.error('Failed to save config')
    }
  }

  async _runTanggalMerahCommand() {
    const {date, previous, public: onlyPublic, upcoming} = this._flags

    const [year, month, day] = date.split('-')

    const {apiKey, country} = await readConfig(this.config.configDir)

    const {data: {holidays}} = await api({
      key: apiKey,
      country,
      year: parseInt(year, 10),
      month: parseInt(month, 10),
      day: parseInt(day, 10),
      public: onlyPublic,
      previous,
      upcoming,
    })

    if (holidays.length > 0) {
      cli.table(holidays, {
        date: {
          get: row => moment(row.date).format('dddd, MMMM Do YYYY'),
        },
        name: {},
        public: {
          get: row => row.public ? 'Yes' : 'No',
          header: 'Public Holiday?',
        },
      })
    } else {
      this.log('There are no holidays')
    }
  }
}

TanggalMerahCommand.description = 'tanggal-merah: Show public holidays and observances information (Holiday API Implementation)'

TanggalMerahCommand.flags = {
  date: flags.build({description: 'show holidays in specified date', default: today})(),
  help: flags.help(),
  init: flags.boolean({default: false, description: 'set tanggal-merah configuration'}),
  previous: flags.boolean({default: false, description: 'show previous holidays based on date'}),
  public: flags.boolean({default: false, description: 'show public holidays only'}),
  upcoming: flags.boolean({default: false, description: 'show upcoming holidays based on date'}),
  version: flags.version(),
}

module.exports = TanggalMerahCommand
