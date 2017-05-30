import React from 'react'
// import ReactDOM from 'react-dom'
import YouTube from 'react-youtube'

class VideoPlayer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      videoId: props.videoUrl,
      player: null,
      muted: false,
    }
  }

  onReady = (event) => {
    console.log(`YouTube Player object for videoId: "${this.state.videoId}" has been saved to state.`) // eslint-disable-line
    this.setState({
      player: event.target,
    })
    this.state.player.playVideo()
    this.state.player.removeEventListener('click', 'pause')
    // console.log(this.state.player.getDuration())
    this.state.player.seekTo(this.props.seekTime, true)
  }

  onMuteVideo = () => {
    this.state.muted ? this.state.player.unMute() : this.state.player.mute()
    this.setState({
      muted: !this.state.muted,
    })
  }

  preventPause = (event) => {
    console.log('hi')
    event.preventDefault()
  }

  render() {
    const opts = {
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
          onClick={this.preventPause}
          opts={opts}
        />
        <button onClick={this.onMuteVideo}>Mute</button>
        {/* <button onClick={this.onPlayVideo}>Play</button> */}
        {/* <button onClick={this.onPauseVideo}>Pause</button> */}
        {/* <button onClick={this.onChangeVideo}>Change Video</button> */}
        {/* <button onClick={this.onChangeTime}>time</button> */}
      </div>
    )
  }
}

export default VideoPlayer
