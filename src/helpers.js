const {join} = require('path')
const {fileExists, isDir, mkdir, readJSON, writeJSON} = require('./fs')

function configFilePath(configDir) {
  return join(configDir, 'config.json')
}

async function configExists(configDir) {
  const filename = configFilePath(configDir)

  const isExists = await fileExists(filename)

  return isExists
}

async function createConfig(configDir, config) {
  const filename = configFilePath(configDir)

  if (!await isDir(configDir)) {
    await mkdir(configDir)
  }

  const isCreated = await writeJSON(filename, config)

  return isCreated
}

async function readConfig(configDir) {
  if (!await configExists(configDir)) {
    throw new Error('Config file is not exists')
  }

  const filename = configFilePath(configDir)

  const configData = await readJSON(filename)

  if (configData === false) {
    throw new Error('Config file is empty')
  }

  return configData
}

async function getApiKey(configDir) {
  const {apiKey} = await readConfig(configDir)

  if (apiKey) {
    return apiKey
  }

  throw new Error('API key is not set')
}

module.exports = {configExists, createConfig, getApiKey, readConfig}
