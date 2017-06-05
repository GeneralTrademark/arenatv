import React from 'react'
import YouTube from 'react-youtube'
import base from './helpers/base'

class Client extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      channelState: {},
      currentVideoIndex: '',
      currentVideoId: '',
      lastChannel: '',
      loaded: false,
      users: {},
      userKey: '',
      lastUserKey: '',
      player: null,
    }
  }

  componentWillMount() {
    base.fetch(`/channels/${this.props.currentChannel}`, {
      context: this,
      then(data){
        this.setState({
          channelState: data,
          currentVideoIndex: data.currentVideoIndex,
          currentVideoId: data.videos[data.currentVideoIndex],
          loaded: true,
        })
        this.addUser(this.props.currentChannel, data.time)
      },
    })
  }

  componentWillUpdate(nextProps, nextState){
    this.props.currentChannel !== nextProps.currentChannel ? this.changeChannel(nextProps.currentChannel) : console.log('same channel')
  }

  componentWillReceiveProps = (nextProps) => {
    this.props.muted !== nextProps.muted ? this.muteAudio(nextProps.muted) : null
  }

  muteAudio(muteState){
    muteState ? this.state.player.mute() : this.state.player.unMute()
  }

  changeChannel(newChannel) {
    this.setState({
      lastChannel: this.props.currentChannel,
    })
    base.fetch(`/channels/${newChannel}`, {
      context: this,
      then(data){
        this.setState({
          channelState: data,
          currentVideoIndex: data.currentVideoIndex,
          currentVideoId: data.videos[data.currentVideoIndex],
          loaded: true,
        })
        this.removeUser(this.state.userKey)
        this.setListeners(newChannel)
        this.addUser(newChannel, data.time)
      },
    })
  }

  setListeners = (channel) => {
    // If there are changes in users
    base.listenTo(`channels/${channel}/users`, {
      context: this,
      asArray: true,
      then(users) {
        // Check everyone's timeStamp
        this.props.handleChangeUsers(users.length)
        this.getChannelTime(users)
      },
    })

    // If there are changes to the channel's state
    base.listenTo(`channels/${channel}/time`, {
      context: this,
      asArray: false,
      then(time) {
        // See if you need to catch up
        this.seekToTime(time)
      },
    })

    base.listenTo(`channels/${channel}/currentVideoIndex`, {
      context: this,
      asArray: false,
      then(index) {
        if (index > this.state.currentVideoIndex && index < this.state.currentVideoIndex + 2) {
          this.skipToNext(index)
        }
      },
    })
  }

  seekToTime = (time) => {
    // If you are more than 5 seconds behind the channel state seekTo
    if ((time + 5) > Math.round(this.state.player.getCurrentTime())) {
      this.state.player.playVideo()
      this.state.player.seekTo(time, true)
      base.update(`channels/${this.props.channels}/users/${this.state.userKey}`, {
        data: { time: time },
      })
    }
  }

  setChannelTime(timeStamp, channel) {
    if (timeStamp < Math.round(this.state.player.getCurrentTime())) {
      base.update(`channels/${channel}`, {
        data: { time: Math.round(this.state.player.getCurrentTime()) },
      })
    }
  }

  setUserTime = (users) => {
    const timeStamps = []
    let counter = 0
    // Look through active users and store their timeStamps in an array
    users.forEach((user) => {
      counter++
      timeStamps.push(user.time)
      // Once done - pick the largest indexue from that array and set channel state
      if (counter === users.length) {
        this.setChannelTime(Math.max(...timeStamps), this.props.currentChannel)
      }
    })
  }

  getChannelTime = () => {
    base.fetch(`/channels/${this.props.currentChannel}/users`, {
      context: this,
      asArray: true,
      then(users){
        this.setUserTime(users)
      },
    })
  }

  removeUser = (user) => {
    this.getChannelTime()
    base.remove(`channels/${this.state.lastChannel}/users/${user}`)
  }

  addUser(channel, timeStamp){
    const ref = base.push(`channels/${channel}/users`, {
      data: { time: timeStamp },
    })
    ref.onDisconnect().remove()
    const generatedKey = ref.key
    this.setState({ userKey: generatedKey })
  }

  skipToNext = (index) => {
    this.setState({
      currentVideoIndex: index,
      currentVideoId: this.state.channelState.videos[index],
    })
    base.update(`channels/${this.props.currentChannel}`, {
      data: { time: 0 },
    })
  }

  incrementVideoIndex = (index) => {
    if (index === this.state.currentVideoIndex) {
      let newIndex = index
      if (index >= (this.state.channelState.videos.length - 1)) {
        newIndex = -1
      }
      base.update(`channels/${this.props.currentChannel}/`, {
        data: { currentVideoIndex: newIndex+1},
      })
      this.skipToNext(newIndex+1)
    }
  }

  onReady = (event) => {
    this.setState({
      player: event.target,
    })

    this.state.player.playVideo()
    this.state.player.seekTo(this.state.channelState.time, false)

    this.setListeners(this.props.currentChannel)
  }

  onEnd = (event) => {
    base.fetch(`channels/${this.props.currentChannel}/currentVideoIndex`, {
      context: this,
      asArray: false,
      then(index) {
        this.incrementVideoIndex(index)
      },
    })
  }

  onStateChange = (event) => {
    this.props.getVideoStatus(event.data)
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
      ? <div className='videoWrapper'>
        <YouTube
          videoId={this.state.currentVideoId}
          onReady={this.onReady}
          onStateChange={this.onStateChange}
          onEnd={this.onEnd}
          opts={opts}
          className="video"
        />
      </div>
      : <div> {'Not loaded'}</div>
    )
  }
}

export default Client
