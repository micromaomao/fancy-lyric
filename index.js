const express = require.main.require('express')
const path = require('path')
const fs = require('fs')

let indexPath = path.join(__dirname, 'dist/index.html')
let indexHtml = fs.readFileSync(indexPath)
if (process.env.NODE_ENV !== 'production') {
  fs.watch(indexPath, list => {
    fs.readFile(indexPath, { encoding: 'utf8' }, (err, data) => {
      if (err) {
        console.error(err)
        process.exit(1)
      } else {
        indexHtml = data
      }
    })
  })
}

module.exports = () => {
  let rMain = express.Router()

  rMain.get('/', function (req, res) {
    res.type('html')
    res.send(indexHtml)
  })
  rMain.use('/resources', express.static(path.join(__dirname, 'dist')))

  return rMain
}
