'use strict'
const React = require('react')
const ReactDOM = require('react-dom')
const FancyLyric = require('./fancylyric.jsx')

require('babel-polyfill')

window.onYouTubeIframeAPIReady = function () {
  let reactRoot = document.getElementsByClassName('react-root')[0]
  let videoId = reactRoot.dataset.videoid
  let ass = null
  if (videoId) {
    ass = JSON.parse(reactRoot.dataset.ass)
  } else {
    videoId = null
  }
  let ui = ReactDOM.render(
    <FancyLyric ass={ass} videoId={videoId} />,
    reactRoot
  )

  window.addEventListener('resize', evt => {
    setTimeout(() => ui.forceUpdate(), 1)
  })
}
