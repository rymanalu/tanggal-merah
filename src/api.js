const axios = require('axios')
const {merge} = require('lodash')
const moment = require('moment')

module.exports = async params => {
  const today = moment()

  params = merge({
    country: 'ID',
    year: today.year(),
    month: today.month() + 1,
    day: today.date(),
  }, params)

  return axios('https://holidayapi.com/v1/holidays', {params})
}
