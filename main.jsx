'use strict'
const React = require('react')
const ReactDOM = require('react-dom')
const FancyLyric = require('./fancylyric.jsx')
const AssParse = require('./assparse.js')

require('babel-polyfill')

window.onYouTubeIframeAPIReady = function () {
  let ui = ReactDOM.render(
    <FancyLyric ass={AssParse(require('raw-loader!./test.ass'))} videoId='_mTRvJ9fugM' />,
    document.getElementsByClassName('react-root')[0]
  )

  window.addEventListener('resize', evt => {
    setTimeout(() => ui.forceUpdate(), 1)
  })
}
