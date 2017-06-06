import React, { Component } from 'react'
import './App.css'
import base from './helpers/base'
import Client from './Client3'
import ChannelList from './ChannelList'
import config from './config'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // playlistChannelSlug: 'arena-tv',
      currentChannel: "herzog",
      currentVideoName: '',
      // currentVideoId: 'iYJKd0rkKss',
      channels: [],
      numUsers: 0,
      muted: false,
      currentVideoStatus: -1,
      trayOpen: false,
    }
  }

  componentWillMount = () => {
    this.getChannels()

    // this.getVids('arena-tv')
    // if channels changes, get all videos again
    // base.listenTo('channels', {
    //   context: this,
    //   asArray: true,
    //   then(channels){
    //     this.getChannels()
    //   },
    // })
  }


  classifyItem = (item) => {
    const isAttachment = item.class === 'Attachment'
    const isMedia = item.class === "Media"

    if (isAttachment && item.attachment.extension === "mp3") return "mp3"
    if (isMedia && item.source.url.indexOf('soundcloud') > 0) return "soundcloud"
    if (isMedia && item.source.url.indexOf('youtube') > 0) return "youtube"

    return 'notSupported'
  }

  getYoutubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : '3_XooZ65n6c'
  }

  // make a list of channels and their videos
  getChannels = () => {
    let component = this
    const getChannels = fetch(`${config.apiBase}/channels/arenatv`)
    getChannels.then(resp => resp.json()).then(channels => {
      let channelArr = channels.contents
      component.setState({channels: channelArr})
      channelArr.map((channel) => {
        base.update(`channels/${channel.slug}`, {
          data: {
            slug: channel.slug,
            title: channel.title,
            health: 0,
            // username: channel.user.username,
            // currentVideoIndex: 0,
            // time: 0,
          },
        })
      })
    })
  }

  getVids = (targetSlug) => {
    const channels = this.state.channels
    const channelToQuery = channels.filter((channel) => {
      return channel.slug === targetSlug
    })
    const slugToQuery = channelToQuery[0].slug
    const getVideos = fetch(`${config.apiBase}/channels/${slugToQuery}/contents`)
    getVideos.then(resp => resp.json()).then(videos => {
      let youtubeVids = videos.contents.filter((video) => {
        return this.classifyItem(video) === 'youtube'
      })
      let youtubeSlugs = youtubeVids.map((video) => {
        return this.getYoutubeId(video.source.url)
      })
      base.update(`channels/${targetSlug}`, {
        data: {videos : youtubeSlugs},
      })
    })
  }

  handleChangeChannel = (target) => {
    this.setState({
      currentChannel: target,
    })
    this.getVids(target)
  }

  handleChangeUsers = (num) =>{
    this.setState({
      numUsers: num,
    })
  }

  onMuteVideo = () => {
    this.setState({
      muted: !this.state.muted,
    })
  }

  getVideoStatus = (status) => {
    this.setState({
      currentVideoStatus: status,
    })
  }

  getCurrentVideoName = (name) => {
    this.setState({
      currentVideoName: name,
    })
  }

  indicateStatus = () => {
    let status
    switch(this.state.currentVideoStatus) {
    case -1:
        status = 'unstarted'
        break
    case 0:
        status = 'ended'
        break
    case 1:
        status = 'playing'
        break
    case 2:
        status = 'paused'
        break
    case 3:
        status = 'buffering'
        break
    case 5:
        status = 'cued'
        break
    default:
        status = 'error'
    }
  return (`${status} indicator`)
  }

  toggleTrayState = () => {
    const trayOpen = this.state.trayOpen
    this.setState({
      trayOpen: !trayOpen,
    })
  }


  setTrayClass = () => {
    const trayOpen = this.state.trayOpen
    let classToSet
    if (trayOpen) {
      classToSet = 'open'
    } else {
      classToSet = 'closed'
    }
    return classToSet
  }


  render() {
    const maybePluralize = (count, noun, suffix = 's') =>
      `${noun}${count !== 1 ? suffix : ''}`
    const isare = (count, noun, suffix = 'is') =>
      `${count !== 1 ? noun : suffix}`

    return (
      <div className="App">
        <div className={'videoFrame'}>
          <div className="overlayContainer">
            <div className="overlay">
              <header>
                <div className={'mark'} />
                <button onClick={() => this.toggleTrayState()}>{'.tv'}</button>
              </header>
              <footer>
              <div className={'info'}>
                <div className={this.indicateStatus()} />
                <div className={'spacer'} />
                <h2>{this.state.currentChannel}</h2>
                <div className={'spacer'} />
                <p>{this.state.currentVideoName}</p>
                <div className={'spacer'} />
                <p>{this.state.numUsers-1} {maybePluralize(this.state.numUsers-1, 'other')} {isare(this.state.numUsers-1, 'are')} watching with you.</p>

              </div>
              <button className="button" onClick={() => this.onMuteVideo()}>{this.state.muted ? 'Sound On' : 'Sound Off'}</button>
              </footer>
            </div>
              <Client
                currentChannel={this.state.currentChannel}
                handleChangeUsers={this.handleChangeUsers}
                trayOpen={this.state.trayOpen}
                muted={this.state.muted}
                getVideoStatus={this.getVideoStatus}
                getCurrentVideoName={this.getCurrentVideoName}
              />
          </div>
        </div>
        <div className={this.setTrayClass()}>
          <ChannelList
            handleChangeChannel={this.handleChangeChannel}
            channels={this.state.channels}
          />
        </div>
      </div>
    )
  }
}

export default App
