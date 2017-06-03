import React from 'react'
import YouTube from 'react-youtube'
import base from './helpers/base'

class Client extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      channelState: {},
      loaded: false,
      users: {},
      userKey: null,
      player: null,
      muted: false,
    }
  }

  componentWillMount() {
    // Get channel state and update internal state with the data
    // Then make a new user in the channel
    // When loaded, the react-youtube will make a video w/the channel's current youtube url and time
    // See onReady for next steps
    base.listenTo('arena-tv', {
      context: this,
      asArray: false,
      then(data) {
        this.setState({
          loaded: true,
          channelState: data,
        })
      },
    })
    this.addUser()
  }

  componentWillUnmount() {
    base.removeBinding(this.ref)
  }

  onReady = (event) => {
    // When the youtube video is loaded - set up listeners and play the video
    this.setState({
      player: event.target,
    })

    this.state.player.playVideo()
    this.state.player.seekTo(this.state.channelState.time, true)
    this.state.player.mute()

    // Update the the user on firebase with the current video time
    base.update(`users/${this.state.userKey}`, {
      data: { time: this.state.channelState.time },
    })

    // If there are changes in users
    base.listenTo('users', {
      context: this,
      asArray: true,
      then(users) {
        // Check everyone's timeStamp
        this.checkTimestamps(users)
      },
    })

    // If there are changes to the channel's state
    base.listenTo('arenatv/time', {
      context: this,
      asArray: false,
      then(time) {
        // See if you need to catch up
        this.seekTo(time)
      },
    })
  }

  onMuteVideo = () => {
    const muted = this.state.muted ? this.state.player.unMute() : this.state.player.mute()
    this.setState({
      muted: !muted,
    })
  }

  setTimestamp = (timeStamp) => {
    // Only set the channel state if you are ahead of everyone else
    if (timeStamp < Math.round(this.state.player.getCurrentTime())) {
      base.update('arenatv', {
        data: { time: Math.round(this.state.player.getCurrentTime()) },
      })
    }
  }

  seekTo = (time) => {
    // If you are more than 5 seconds behind the channel state seekTo
    if ((time + 5) > Math.round(this.state.player.getCurrentTime())) {
      this.state.player.playVideo()
      this.state.player.seekTo(time, true)
      this.state.player.mute()
    }
  }

  checkTimestamps = (users) => {
    // If your video is actually playing update your user timeStamp with the currentTime
    if (this.state.player.getPlayerState() === 1) {
      const that = this
      base.update(`users/${this.state.userKey}`, {
        data: { time: Math.round(this.state.player.getCurrentTime()) },
        then() {
          const timeStamps = []
          let counter = 0
          // Look through active users and store their timeStamps in an array
          users.forEach((user) => {
            counter++
            timeStamps.push(user.time)
            // Once done - pick the largest value from that array and set channel state
            if (counter === users.length) {
              that.setTimestamp(Math.max(...timeStamps))
            }
          })
        },
      })
    }
  }

  addUser = () => {
    // Add user and set listener for onDisconnect
    const ref = base.push('users', {
      data: { time: 0 },
    })
    ref.onDisconnect().remove()
    const generatedKey = ref.key
    this.setState({ userKey: generatedKey })
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
          videoId={this.state.channelState.id}
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
