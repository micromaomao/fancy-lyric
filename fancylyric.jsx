const React = require('react')

const fadeTime = 0.5

class FancyLyric extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      contentWidth: null,
      contentHeight: null,
      videoTime: null,
      matchLines: []
    }
    this.youtubePlayer = null
    this.renderRequestAnimationFrame = null
    this.handlePlayerStateChange = this.handlePlayerStateChange.bind(this)
    this.handlePlayerReady = this.handlePlayerReady.bind(this)
    this.renderFrame = this.renderFrame.bind(this)
  }
  render () {
    return (
      <div className={'fancylyric' + (this.state.matchLines.length > 0 ? ' lyricshown' : '')} ref={f => this.measureTarget = f}>
        <div className='youtube' id='youtube-player'></div>
        {this.state.matchLines.map(matchLine => {
          let offset = this.state.videoTime - matchLine.begin + 0.2
          let lastK = matchLine.content[matchLine.content.length - 1]
          let yOffset = 0
          if (lastK) {
            yOffset = -75 * Math.max(0, Math.min(1, (offset - lastK.start) / (lastK.end - lastK.start)))
          }
          let evenOffset = 0
          if (matchLine.i % 2 === 0) {
            evenOffset = 30
          }
          return (
            <div className='lyric' key={matchLine.i} style={{
              transform: `translate(0, ${yOffset + evenOffset}px)`
            }}>
              {matchLine.content.map((k, ii) => {
                let fadeInProgress = Math.min(Math.max(0, offset + fadeTime + 0.5 - ii * 0.05) / fadeTime, 1)
                let fadeOutProgress = Math.max(0,
                  Math.min(1, (matchLine.end + fadeTime / 2 - matchLine.content.length * 0.05 - this.state.videoTime + ii * 0.05) / fadeTime))
                let fadeP = Math.min(fadeInProgress, fadeOutProgress)
                let kProg = Math.min(1, Math.max(0, (offset - k.start) / (k.end - k.start)))
                let current = k.start <= offset && offset < k.end
                let dropHeight = Math.min(25, 10 / (k.end - k.start))
                let dropEffectProg = 1 - Math.min(0.25, 1 - Math.abs(kProg - 0.5) * 2) * 4
                return (
                  <span className={'k'} style={{
                    transform: `translate(0, ${(1 - fadeP) * 40 * Math.sign(fadeInProgress - fadeOutProgress)}px) scale(1, ${2 - fadeP})`,
                    opacity: Math.min(fadeP, 1 - dropEffectProg * 0.3)
                  }} key={ii}>
                    {k.text}
                    <div className='dotcontain'>
                      {current ? <div className='fill' style={{
                        left: (kProg * 100) + '%',
                        top: (-4 * Math.pow(kProg - 0.5, 2) * dropHeight) + 'px'
                      }} /> : null}
                    </div>
                    <div className='underlinecontain'>
                      {current ? <div className='fill' style={{
                        marginLeft: (kProg * 50) + '%',
                        width: ((1 - kProg) * 100) + '%'
                      }} /> : null}
                    </div>
                  </span>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }
  measureViewDim () {
    if (!this.measureTarget) {
      this.setState({contentWidth: null, contentHeight: null})
      return
    }
    let cs = window.getComputedStyle(this.measureTarget)
    let nState = {contentWidth: parseFloat(cs.width) || 0, contentHeight: parseFloat(cs.height) || 0}
    if (Math.abs(this.state.contentWidth - nState.contentWidth) < 1
      && Math.abs(this.state.contentHeight - nState.contentHeight) < 1) return
    this.setState(nState)
  }
  componentDidMount () {
    this.ensurePlayerPlaced()
    this.measureViewDim()
  }
  componentWillUnmount () {
    this.ensureNoPlayer()
  }
  componentDidUpdate (prevProps, prevState) {
    this.ensurePlayerPlaced()
    if (prevProps.videoId !== this.props.videoId) {
      if (this.props.videoId) {
        this.youtubePlayer.loadVideoById(this.props.videoId, 0, 'highres')
      } else {
        this.youtubePlayer.stopVideo()
      }
    }
    this.measureViewDim()
    if (this.youtubePlayer && this.state.contentWidth !== null && this.state.contentHeight !== null) {
      this.youtubePlayer.setSize(this.state.contentWidth, this.state.contentHeight)
    }
  }
  ensurePlayerPlaced () {
    if (this.youtubePlayer) return null
    if (!this.props.videoId) return null
    this.youtubePlayer = new window.YT.Player('youtube-player', {
      videoId: this.props.videoId,
      events: {
        onStateChange: this.handlePlayerStateChange,
        onReady: this.handlePlayerReady
      },
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        disablekb: 0,
        loop: 1,
        showinfo: 1,
        rel: 0
      }
    })
    this.youtubePlayer.getIframe().removeAttribute('allowfullscreen')
  }

  ensureNoPlayer () {
    if (this.youtubePlayer === null) return
    this.youtubePlayer.destroy()
    this.youtubePlayer = null
    if (this.renderRequestAnimationFrame !== null) {
      window.cancelAnimationFrame(this.renderRequestAnimationFrame)
      this.renderRequestAnimationFrame = null
    }
  }

  handlePlayerReady (evt) {
    let player = this.youtubePlayer
    player.setPlaybackQuality('highres')
    if (this.renderRequestAnimationFrame === null) {
      this.renderRequestAnimationFrame = window.requestAnimationFrame(this.renderFrame)
    }
  }

  handlePlayerStateChange (evt) {
  }

  renderFrame () {
    if (this.youtubePlayer === null) {
      this.renderRequestAnimationFrame = null
      return
    }
    this.renderRequestAnimationFrame = requestAnimationFrame(this.renderFrame)
    let time = this.youtubePlayer.getCurrentTime()
    this.setState({
      videoTime: time
    })
    if (!this.props.ass) return
    let matchLines = this.props.ass.map((x, i) => Object.assign(x, {i})).filter(line => line.begin - fadeTime - 0.5 <= time && time < line.end + fadeTime)
    this.setState({
      matchLines
    })
  }
}

module.exports = FancyLyric
