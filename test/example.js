const kicktock = require('../kicktock')
const fs = require('fs')
const fse = require('fs-extra')
const walk = require('./walk')

var dir = process.env.HOME + "/Code"
var K = kicktock(1000), size = 0
K.on('error', err => console.log(err))
K.on('progress', () => {
  console.log(`${size} bytes so far (${K.at}/${K.total})`)
})
walk(dir, K.errorFirst((path, stats) => {
  fs.stat(path, K.errorFirst((stat) => {
    if (stat)
      size += stat.size
  }))
}), K())
K.go(() => {
  console.log(`Total HOME directory size is: ${size} bytes`)

  // Promises
  K = kicktock(1000)
  size = 0
  K.on('error', err => console.log(err))
  K.on('progress', () => {
    console.log(`${size} bytes so far (${K.at}/${K.total})`)
  })
  walk(dir, K((err, path, stats) => {
    K(fse.stat(path).then(stat => {
      size += stat.size
    }))
  }), K(err => {
    if (err)
      console.log(err)
  }))
  K.go(() => {
    console.log(`Total HOME directory size is: ${size} bytes`)
  })
})
