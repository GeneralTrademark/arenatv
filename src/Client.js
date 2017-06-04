import React from 'react'
import YouTube from 'react-youtube'
import base from './helpers/base'

class Client extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentChannel: '',
      currentVideoId: "",
      currentVideoIndex: 0,
      channelState: {},
      currentVideosArray: [],
      loaded: false,
      users: {},
      userKey: null,
      player: null,
      muted: false,
    }
  }

  syncChannel = (slug) => {
    base.fetch(`channels/${slug}`, {
      context: this,
      asArray: false,
      then(data) {
        this.setState({
          loaded: true,
          channelState: data,
          currentChannel: slug,
          currentVideoIndex: data.currentVideoIndex,
          currentVideoId: data.videos[data.currentVideoIndex],
        })
      },
    })
  }

  componentWillMount() {
    // Get channel state and update internal state with the data
    // Then make a new user in the channel
    // When loaded, the react-youtube will make a video w/the channel's current youtube url and time
    // See onReady for next steps
    this.syncChannel(this.props.currentChannel)
    this.addUser(this.props.currentChannel)
  }

  // componentWillUnmount() {
  //   base.removeBinding(this.ref)
  // }

  componentWillReceiveProps(nextProps) {
    if (this.state.loaded === true && nextProps.currentChannel !== this.state.currentChannel) {
      this.changeChannel(nextProps.currentChannel)
    }
  }

  changeChannel = (slug) =>{
    // this.removeUser()
    // this.setState({
    //   currentChannel: slug,
    // })
    this.setTimestamp(Math.round(this.state.player.getCurrentTime()))
    this.removeUser(slug)
    this.syncChannel(slug)
    this.addUser(slug)
  }

  onStateChange = (event) => {
    // console.log(event)
    if (event.data === 3){
      console.log('new video cued')
    } else if (event.data === 1){
      console.log('new video playing')
    }
  }

  setListeners = () => {
    // Update the the user on firebase with the current video time
    base.update(`channels/${this.state.currentChannel}/users/${this.state.userKey}`, {
      data: { time: this.state.channelState.time },
    })

    // If there are changes in users
    base.listenTo(`channels/${this.state.currentChannel}/users`, {
      context: this,
      asArray: true,
      then(users) {
        // Check everyone's timeStamp
        this.props.handleChangeUsers(users.length)
        this.checkTimestamps(users)
      },
    })

    // If there are changes to the channel's state
    base.listenTo(`channels/${this.state.currentChannel}/time`, {
      context: this,
      asArray: false,
      then(time) {
        // See if you need to catch up
        this.seekTo(time)
      },
    })

    base.listenTo(`channels/${this.state.currentChannel}/currentVideoIndex`, {
      context: this,
      asArray: false,
      then(index) {
        if (index > this.state.currentVideoIndex && index < this.state.currentVideoIndex + 2) {
          this.skipToNext(index)
        }
      },
    })
  }

  onReady = (event) => {
    // When the youtube video is loaded - set up listeners and play the video
    this.setState({
      player: event.target,
    })

    this.state.player.playVideo()
    this.state.player.seekTo(this.state.channelState.time, true)
    // this.state.player.setVolume(50)

    this.setListeners()
  }

  onEnd = (event) => {
    base.fetch(`channels/${this.state.currentChannel}/currentVideoIndex`, {
      context: this,
      asArray: false,
      then(index) {
        this.incrementVideoIndex(index)
      },
    })
  }

  skipToNext = (index) => {
    this.setState({
      currentVideoIndex: index,
      currentVideoId: this.state.channelState.videos[index],
    })
    base.update(`channels/${this.state.currentChannel}`, {
      data: { time: 0 },
    })
  }

  incrementVideoIndex = (index) => {
    if (index === this.state.currentVideoIndex) {
      let newIndex = index
      if (index >= (this.state.channelState.videos.length - 1)) {
        newIndex = -1
      }
      base.update(`channels/${this.state.currentChannel}/`, {
        data: { currentVideoIndex: newIndex+1},
      })
      this.skipToNext(newIndex+1)
    }
  }

  onMuteVideo = () => {
    this.state.muted ? this.state.player.unMute() : this.state.player.mute()
    this.setState({
      muted: !this.state.muted,
    })
  }

  setTimestamp = (timeStamp) => {
    // Only set the channel state if you are ahead of everyone else
    if (timeStamp < Math.round(this.state.player.getCurrentTime())) {
      base.update(`channels/${this.state.currentChannel}`, {
        data: { time: Math.round(this.state.player.getCurrentTime()) },
      })
    }
  }

  seekTo = (time) => {
    // If you are more than 5 seconds behind the channel state seekTo
    if ((time + 5) > Math.round(this.state.player.getCurrentTime())) {
      this.state.player.playVideo()
      this.state.player.seekTo(time, true)
    }
  }

  checkTimestamps = (users) => {
    // If your video is actually playing update your user timeStamp with the currentTime
    if (this.state.player.getPlayerState() === 1) {
      const that = this
      base.update(`channels/${this.state.currentChannel}/users/${this.state.userKey}`, {
        data: { time: Math.round(this.state.player.getCurrentTime()) },
        then() {
          const timeStamps = []
          let counter = 0
          // Look through active users and store their timeStamps in an array
          users.forEach((user) => {
            counter++
            timeStamps.push(user.time)
            // Once done - pick the largest indexue from that array and set channel state
            if (counter === users.length) {
              that.setTimestamp(Math.max(...timeStamps))
            }
          })
        },
      })
    }
  }

  removeUser = (slug) => {
    base.remove(`channels/${slug}/users/${this.state.userKey}`)
  }

  addUser = (slug) => {
    // Add user and set listener for onDisconnect
    const ref = base.push(`channels/${slug}/users`, {
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
          videoId={this.state.currentVideoId}
          onReady={this.onReady}
          onStateChange={this.onStateChange}
          onEnd={this.onEnd}
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
