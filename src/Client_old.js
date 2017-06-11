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
      currentVideoTitle: '',
      lastChannel: '',
      loaded: false,
      users: {},
      userKey: '',
      timeKey: '',
      player: null,
      lastTimeKey: '',
      lastUserKey: '',
    }
  }

  syncChannel = (channel) => {
    base.fetch(`/channels/${channel}`, {
      context: this,
      then(data){
        if (data.videos === undefined){
          console.log('error page')
        } else {
          this.setState({
            channelState: data,
            currentVideoIndex: data.currentVideoIndex,
            currentVideoId: data.videos[data.currentVideoIndex].url,
            currentVideoTitle: data.videos[data.currentVideoIndex].title,
            loaded: true,
          })
          this.addUser(channel, data.time)
        }
      },
    })
  }

  componentWillMount() {
    this.syncChannel(this.props.currentChannel)
  }

  componentWillUpdate(nextProps, nextState){
    this.props.currentChannel !== nextProps.currentChannel ? this.changeChannel(nextProps.currentChannel) : null
  }

  componentWillReceiveProps = (nextProps) => {
    this.props.muted !== nextProps.muted ? this.muteAudio(nextProps.muted) : null
  }

  muteAudio(muteState){
    muteState ? this.state.player.mute() : this.state.player.unMute()
  }

  changeChannel(newChannel) {
    this.syncChannel(newChannel)
    this.setState({
      lastChannel: this.props.currentChannel,
    })
    this.updateTime()
    //need to find a way to update channel time before this
    this.removeUser()
  }


  updateTime = () => {
    console.log('updating my own time')
    const that = this
    base.update(`/channels/${this.props.currentChannel}/userTime/${this.state.timeKey}`,{
      context: this,
      data: {time: this.state.player.getCurrentTime()},
      then(){
        that.checkTimes()
      },
    })
  }

  checkTimes = () => {
    console.log('checking times')
    // const that = this
    base.fetch(`/channels/${this.props.currentChannel}/userTime/`,{
      context: this,
      asArray: true,
      then(users){
        const timeStamps = []
        let counter = 0
        this.props.handleChangeUsers(users.length)
        // Look through active users and store their timeStamps in an array
        users.forEach((user) => {
          counter++
          timeStamps.push(user.time)
          // Once done - pick the largest index from that array and set channel state
          if (counter === users.length) {
            if (Math.max(...timeStamps) > this.state.channelState.time){
              // console.log('newMaxTime is ' + Math.max(...timeStamps))
              this.setChannelTime(Math.max(...timeStamps))
            }
          }
        })
      },
    })
  }

  setChannelTime = (time) => {
    // leader or not
    if (time < this.state.player.getCurrentTime()) {
      console.log('found new max time ' + time)
      base.update(`/channels/${this.props.currentChannel}/`,{
        data: {time: time},
      })
    } else if (time-5 > this.state.player.getCurrentTime()) {
      console.log('just update my time to' + time)
      this.state.player.seekTo(time)
    }
  }

  addListeners = () => {
    console.log('adding Listener')
    base.listenTo(`/channels/${this.props.currentChannel}/userPresence/`,{
      context: this,
      asArray: true,
      then(users){
        //something funny happening with empty array here
        this.props.handleChangeUsers(users.length)
        this.updateTime()
        console.log('new user present')
      },
    })

    base.listenTo(`channels/${this.props.currentChannel}/currentVideoIndex`, {
      context: this,
      asArray: false,
      then(index) {
        console.log('the video changed')
        if (index > this.state.currentVideoIndex && index < this.state.currentVideoIndex + 2) {
          this.skipToNext(index)
        }
      },
    })
  }

  removeUser = () => {
    //need to find a way to update channel time before this
    base.remove(`/channels/${this.props.currentChannel}/userPresence/${this.state.userKey}`)
    base.remove(`/channels/${this.props.currentChannel}/userTime/${this.state.timeKey}`)
  }

  addUser = (channel,time) => {
    const userRef = base.push(`/channels/${channel}/userPresence/`,{
      data: {alive:true},
    })
    userRef.onDisconnect().remove()
    let generatedUserKey = userRef.key

    // Looks like when switching channels this time is get and set before any other viewers can update
    const timeRef = base.push(`/channels/${channel}/userTime/`,{
      data: {time:time},
    })
    timeRef.onDisconnect().remove()
    let generatedTimeKey = timeRef.key

    this.setState({
      userKey: generatedUserKey,
      timeKey: generatedTimeKey,
    })
    // base.update(`/channels/${this.props.currentChannel}/userPresence/${this.state.userKey}`,{
    //   data: {alive:true},
    // })
    // base.update(`/channels/${this.props.currentChannel}/userTime/${this.state.userKey}`,{
    //   data: {time:time},
    // })
  }

  skipToNext = (index) => {
    console.log('the next video is playing')
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

    console.log('seeking to ' + this.state.channelState.time)
    this.state.player.seekTo(this.state.channelState.time)
    // this.state.player.mute()
    this.props.getCurrentVideoName(this.state.currentVideoTitle)
    this.addListeners()
  }

  onEnd = () => {
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
