const express = require.main.require('express')
const path = require('path')
const fs = require('fs')
const cheerio = require('cheerio')
const AssParse = require('./assparse.js')

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

let asses = {}
for (let fname of fs.readdirSync(path.join(__dirname, 'asses'))) {
  if (!fname.endsWith('.ass')) {
    continue
  }
  let videoId = fname.replace(/\.ass$/, '')
  let fContent = fs.readFileSync(path.join(__dirname, 'asses', fname), {encoding: 'utf8'})
  let parsed = AssParse(fContent)
  asses[videoId] = parsed
}

module.exports = () => {
  let rMain = express.Router()
  rMain.get('/:videoId/', function (req, res, next) {
    let videoId = req.params.videoId
    let ass = asses[videoId]
    if (!ass) {
      next()
      return
    }
    res.type('html')
    let $ = cheerio.load(indexHtml)
    let ele = $('.react-root')
    ele.attr('data-videoid', videoId)
    ele.attr('data-ass', JSON.stringify(ass))
    res.send($.html())
  })
  rMain.use('/resources', express.static(path.join(__dirname, 'dist')))

  return rMain
}
