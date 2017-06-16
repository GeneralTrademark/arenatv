import React from 'react'
import Youtube from 'react-youtube'
import base from './helpers/base'

class Client extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loaded: false,
      player: null,
      channel: null,
      currentVideoIndex: null,
      currentVideoTime: null,
      currentVideoId: null,
      currentVideoTitle: null,
      currentUsers: [],
      initialized: false,
      youtubeStatus: -1,
    }
  }

  syncChannel (channel) {
    base.fetch(`channels/${channel}`, {
      context: this,
      then(data){
        if (data.videos === undefined){
          console.log('error page')
        } else {
          this.setState({
            channel: data,
            currentVideoTime: data.time,
            currentVideoId: data.videos[data.currentVideoIndex].url,
            currentVideoTitle: data.videos[data.currentVideoIndex].title,
            currentVideoIndex: data.currentVideoIndex,
            currentUsers: data.users,
            loaded: true,
            initialized: false,
            muted: false,
          })
          this.props.getClientStatus(true)
          console.log(data)
        }
        //SEE ONREADY - FIRES WHEN LOADED = TRUE
      },
    })
  }

  componentWillMount () {
    console.log('get channel from client to set up sync with ' + this.props.currentChannel)
    this.syncChannel(this.props.currentChannel)
  }

  tick = () =>{
    console.log('timer tick')
    console.log(this.state.player.getCurrentTime())
    let time = this.state.player.getCurrentTime()
    base.update(`channels/${this.props.currentChannel}/`,{
      data: {time: time},
    })
    base.update(`channels/${this.props.currentChannel}/userTime/${this.state.userTimeKey}`,{
      context: this,
      data: {time: time},
    })
    this.setState({currentVideoTime: time})
    console.log(this.state.currentVideoTime)
  }

  componentWillUpdate(nextProps){
    if (nextProps.currentChannel !== this.props.currentChannel) {
      console.log('got a new channel request - unmount and resync')
      console.log('from client nextProp ' + nextProps.currentChannel)
      this.setState({loaded: false})
      this.props.getClientStatus(false)
      this.removeRefs()
      this.leaveChannel(this.props.currentChannel, this.state.userTimeKey)
      this.syncChannel(nextProps.currentChannel)
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.muted !== nextProps.muted){
      this.muteAudio(nextProps.muted)
    }
  }

  muteAudio(muteState){
    muteState ? this.state.player.mute() : this.state.player.unMute()
  }

  leaveChannel = (channel, userTimeKey) => {
    // this.props.handleChangeUsers(this.state.currentUsers-1, channel)
    console.log(`trying to update ${channel} at maxTime from ${userTimeKey}`)
    console.log(`there are ${this.state.currentUsers.length} users`)
    if (this.state.currentUsers.length < 2){
      this.setChannelTime(this.state.player.getCurrentTime(), channel)
      base.update(`channels/${channel}/`, {
        data: {watchers: 0},
      })
    } else {
      this.updateTime(channel, userTimeKey)
    }
    base.remove(`channels/${channel}/userTime/${userTimeKey}`)
  }

  setChannelTime = (time, channel) => {
    this.setState({currentVideoTime: time})
    base.update(`channels/${this.props.currentChannel}/`,{
      data: {time: time},
    })
  }

  updateTime = () => {
    console.log('updating self' + this.props.currentChannel + ' and checking other times')
    const that = this
    base.update(`channels/${this.props.currentChannel}/userTime/${this.state.userTimeKey}`,{
      context: this,
      data: {time: this.state.player.getCurrentTime()},
      then(){
        that.calculateMaxTime()
      },
    })
  }

  updateSelf = (time) => {
    console.log('updating self at ' + this.props.currentChannel + 'at ' + time)
    this.state.player.seekTo(time, true)
    // this.state.player.playVideo()
    base.update(`channels/${this.props.currentChannel}/userTime/${this.state.userTimeKey}`,{
      context: this,
      data: {time: time},
    })
  }

  calculateMaxTime = () => {
    console.log('Find new max time')
    base.fetch(`channels/${this.props.currentChannel}/userTime/`, {
      context: this,
      asArray: true,
      then(users){
        console.log(users)
        const timeStamps = []
        let counter = 0
        users.forEach((user) => {
          counter++
          timeStamps.push(user.time)
          // Once done - pick the largest index from that array and set channel state
          if (counter === users.length) {
            if (Math.max(...timeStamps) > this.state.currentVideoTime){
              console.log('newMaxTime is ' + Math.max(...timeStamps) + ' at ' + this.props.currentChannel)
              this.setChannelTime(Math.max(...timeStamps), this.props.currentChannel)
            }
          }
        })
      },
    })
  }

  setListeners = (channel) => {
    this.timeRef = base.listenTo(`channels/${channel}/time`, {
      context: this,
      then(data){
        console.log(`data is ${data} + ${this.state.player.getCurrentTime()} grabbed from ${channel}`)
        console.log(data < this.state.player.getCurrentTime() - 2 || data > this.state.player.getCurrentTime() + 2)
        console.log('got new time from ' + channel)
        if (data < this.state.player.getCurrentTime() - 2 || data > this.state.player.getCurrentTime() + 2){
          this.updateSelf(data)
        }
        this.setState({
          currentVideoTime: data,
        })
      },
    })

    this.indexRef = base.listenTo(`channels/${channel}/currentVideoIndex`, {
      context: this,
      asArray: false,
      then(index) {
        if (index !== this.state.currentVideoIndex){
          this.skipToNext(index)
          console.log('the video changed ' + index)
        }
        // this.setState({
        //   currentVideoIndex: index,
        // })
        // if (index > this.state.currentVideoIndex && index < this.state.currentVideoIndex + 2) {
        //   this.skipToNext(index)
        //   this.setState({currentVideoIndex: index})
        // }
      },
    })

    this.userRef = base.listenTo(`channels/${channel}/userPresence`, {
      context: this,
      asArray: true,
      then(data){
        this.setState({
          currentUsers: data,
        })
        this.props.handleChangeUsers(data.length, channel)
        // this.props.getChannels()
        if (this.state.player.getPlayerState() === 1){
          this.updateTime(channel, this.state.userTimeKey, this.state.currentVideoTime)
        }
        if (data.length < 2){
          console.log('I started the timer')
          this.timer = setInterval(this.tick, 5000)
        } else {
          console.log('I cleared the timer')
          clearInterval(this.timer)
        }
        console.log('users changed')
      },
    })
  }

  removeRefs = () =>{
    base.removeBinding(this.timeRef)
    base.removeBinding(this.indexRef)
    base.removeBinding(this.userRef)

    base.removeBinding(this.userPresenceRef)
    base.removeBinding(this.userTimeRef)

    base.remove(`channels/${this.props.currentChannel}/userPresence/${this.state.userPresenceKey}`)
    base.remove(`channels/${this.props.currentChannel}/userTime/${this.state.userTimeKey}`)
    console.log('refs got removed')

    clearInterval(this.timer)
  }

  addUser = (channel) => {
    const that = this
    this.userPresenceRef = base.push(`/channels/${channel}/userPresence/`,{
      context: this,
      data: {alive:true},
      then(){
        that.setState({
        })
      },
    })
    this.userPresenceRef.onDisconnect().remove()
    let generatedUserKey = this.userPresenceRef.key
    this.setState({userPresenceKey: generatedUserKey})
    console.log('push user')
  }

  setUserTime = (time, channel) => {
    this.userTimeRef = base.push(`/channels/${channel}/userTime/`,{
      context: this,
      data: {time:time},
    })
    this.userTimeRef.onDisconnect().remove()
    let generatedUserKey = this.userTimeRef.key
    this.setState({userTimeKey: generatedUserKey})
    console.log('push user time at ' + time )
  }

  componentWillUnmount(){
    this.removeRefs()
    clearInterval(this.timer)
  }

  skipToNext = (index) => {
    console.log('the next video is playing ' + index)
    this.setState({
      currentVideoIndex: index,
      currentVideoId: this.state.channel.videos[index].url,
      currentVideoTitle: this.state.channel.videos[index].title,
    })
    this.props.getCurrentVideoName(this.state.currentVideoTitle)
    base.update(`channels/${this.props.currentChannel}`, {
      data: { time: 0 },
    })
  }

  incrementVideoIndex = (index) => {
    if (index === this.state.currentVideoIndex) {
      let newIndex = index
      if (index >= (this.state.channel.videos.length - 1)) {
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
    console.log('I got onready event!! am I initialized? ' + this.state.initialized)
    // if (!this.state.initialized){
    //   this.setState({
    //     player: event.target,
    //   })
    // }

    if (this.state.loaded && !this.state.initialized && this.state.player.getPlayerState() !== 1) {
      console.log('I set up again')
      this.props.getCurrentVideoName(this.state.currentVideoTitle)
      this.setUserTime(this.state.channel.time, this.state.channel.slug)
      this.addUser(this.state.channel.slug)
      this.setListeners(this.state.channel.slug)
      this.setState({initialized: true})
    }
  }

  onQChange = () => {
    console.log('quality changed')
    console.log(this.state.player.getCurrentTime())
    console.log(this.state.currentVideoTime)
    this.state.player.seekTo(this.state.currentVideoTime, true)
  }

  onError = () => {
    base.fetch(`channels/${this.props.currentChannel}/currentVideoIndex`, {
      context: this,
      asArray: false,
      then(index) {
        console.log('i need to go to next')
        this.incrementVideoIndex(index)
      },
    })
  }

  onEnd = () => {
    base.fetch(`channels/${this.props.currentChannel}/currentVideoIndex`, {
      context: this,
      asArray: false,
      then(index) {
        console.log('i need to go to next')
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
        enablejsapi: 1,
        disablekb: 1,
        v_load_policy: 3,
      },
    }
    return (
      this.state.loaded
      ? <div className='videoWrapper'>
          <div className='videoWrapper'>
            <Youtube
              className="video"
              videoId={this.state.currentVideoId}
              onReady={this.onReady}
              onPlay={this.onPlay}
              onStateChange={this.onStateChange}
              onPlaybackQualityChange={this.onQChange}
              onError={this.onError}
              onEnd={this.onEnd}
              opts={opts}
              className="video"
            />
          </div>
        </div>
      : <div> {'Not loaded'}</div>
    )
  }
}

export default Client
