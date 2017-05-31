import React from 'react'
import YouTube from 'react-youtube'

class VideoPlayer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      videoId: props.videoId,
      player: null,
      muted: false,
      width: '0',
      height: '0',
    }
  }

  componentDidMount() {
    this.updateWindowDimensions()
    window.addEventListener('resize', this.updateWindowDimensions)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions)
  }

  onReady = (event) => {
    console.log(`YouTube Player object for videoId: "${this.state.videoId}" has been saved to state.`) // eslint-disable-line
    this.setState({
      player: event.target,
    })
    this.state.player.playVideo()
    this.state.player.removeEventListener('click', 'pause')
    this.state.player.seekTo(this.props.seekTime, true)
    this.state.player.mute()
  }

  onMuteVideo = () => {
    this.state.muted ? this.state.player.unMute() : this.state.player.mute()
    this.setState({
      muted: !this.state.muted,
    })
  }

  updateWindowDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight })
  }

  render() {
    const opts = {
      height: window.innerHeight,
      width: window.innerWidth,
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 1,
        theme: 'dark',
        fs: 0,
        rel: 0,
        controls: 0,
        modestbranding: 1,
        autohide: 1,
        showinfo: 0,
      },
    }

    return (
      <div>
        <YouTube
          videoId={this.state.videoId}
          onReady={this.onReady}
          opts={opts}
          className="video"
        />
        <button className="button" onClick={this.onMuteVideo}>Mute</button>
      </div>
    )
  }
}

export default VideoPlayer
