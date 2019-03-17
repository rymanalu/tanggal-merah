const fs = require('fs')

async function fileExists(path) {
  return new Promise(resolve => {
    fs.access(path, err => {
      if (err) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

async function isDir(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        if (err.code === 'ENOENT') {
          resolve(false)
        } else {
          reject(err)
        }
      } else {
        resolve(stats.isDirectory())
      }
    })
  })
}

async function mkdir(path, mode = 0o777, recursive = false) {
  return new Promise(resolve => {
    fs.mkdir(path, {mode, recursive}, err => {
      if (err) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

async function readJSON(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else if (data) {
        resolve(JSON.parse(data))
      } else {
        resolve(false)
      }
    })
  })
}

async function writeJSON(file, data, mode = 0o666) {
  return new Promise(resolve => {
    fs.writeFile(file, JSON.stringify(data), {mode}, err => {
      if (err) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

module.exports = {fileExists, isDir, mkdir, readJSON, writeJSON}
