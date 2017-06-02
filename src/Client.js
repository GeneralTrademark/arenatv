import React from 'react'
import YouTube from 'react-youtube'
import base from './helpers/base'

class Client extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      details: {},
      loaded: false,
      users: {},
      userKey: null,
      alive: false,
      allTime: null,
      name: '',
      player: null,
      muted: false,
    }
  }

  componentWillMount() {
    base.bindToState('arenatv', {
      context: this,
      state: 'details',
      asArray: false,
      then() {
        this.setState({
          loaded: true,
        })
        this.addUser()
      },
    })
  }

  componentWillUnmount() {
    base.removeBinding(this.ref)
  }

  onReady = (event) => {
    console.log(`YouTube Player object for videoId: "${this.state.details.id}" has been saved to state.`) // eslint-disable-line
    this.setState({
      player: event.target,
    })

    this.state.player.playVideo()
    this.state.player.seekTo(this.state.details.time, true)
    this.state.player.mute()

    base.listenTo('users', {
      context: this,
      asArray: true,
      then(data) {
        this.checkData(data)
      },
    })
    base.listenTo('arenatv/time', {
      context: this,
      asArray: false,
      then(data) {
        data > Math.round(this.state.player.getCurrentTime()) + 10 ? this.seekTo(data) : null
      },
    })
  }

  onMuteVideo = () => {
    this.state.muted ? this.state.player.unMute() : this.state.player.mute()
    this.setState({
      muted: !this.state.muted,
    })
  }

  setTime = (time) => {
    base.update('arenatv', {
      data: { time: time }
    })
  }

  seekTo = (time) => {
    this.state.player.playVideo()
    this.state.player.seekTo(time, true)
    base.update(`users/${this.state.userKey}`, {
      data: { time: Math.round(this.state.player.getCurrentTime()) }
    })
  }

  checkData = (data) => {
    if (this.state.player.getPlayerState() === 1) {
      base.update(`users/${this.state.userKey}`, {
        data: { time: Math.round(this.state.player.getCurrentTime()) },
      })
    }
    data.forEach((user) => {
      if (user.time > this.state.player.getCurrentTime()) {
        this.setTime(user.time)
      }
    })
  }

  addUser = () => {
    const ref = base.push('users', {
      data: {
        time: this.state.details.time,
      },
    })
    ref.onDisconnect().remove()
    const generatedKey = ref.key
    this.setState({ userKey: generatedKey, alive: true })
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
      this.state.loaded
      ? <div>
        <YouTube
          videoId={this.state.details.id}
          onReady={this.onReady}
          opts={opts}
          className="video"
        />
        <button className="button" onClick={this.onMuteVideo}>Mute</button>
      </div>
      : <div> {'Not loaded'}</div>
    )
  }
}

export default Client
