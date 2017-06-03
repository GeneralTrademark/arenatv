import React, { Component } from 'react'
import './App.css'
import base from './helpers/base'
import Client from './Client'
import ChannelList from './ChannelList'
import config from './config'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // playlistChannelSlug: 'arena-tv',
      currentChannel: 'talks-lectures-mostly-design',
      // currentVideoId: 'iYJKd0rkKss',
      channels: [],
      numUsers: 0,
    }
  }

  componentWillMount = () => {
    this.getChannels()
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
    return (match && match[7].length === 11) ? match[7] : false
  }

  // make a list of channels and their videos
  getChannels = () => {
    let component = this
    const getChannels = fetch(`${config.apiBase}/channels/arenatv`)
    getChannels.then(resp => resp.json()).then(channels => {
      let channelArr = channels.contents
      channelArr = channelArr.map((channel) => {
        let channelObject = {
          slug: channel.slug,
          title: channel.title,
          videos: [],
          health: 0,
          username: channel.user.username,
          currentVideoIndex: 0,
          time: 0,
          users:{},
        }
        return channelObject
      })
      component.setState({channels: channelArr})
      channelArr.map((channel) => {
        base.update(`channels/${channel.slug}`, {
          data: {channel},
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


    // return response.json()
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

  render() {
    const maybePluralize = (count, noun, suffix = 's') =>
      `${noun}${count !== 1 ? suffix : ''}`
    const isare = (count, noun, suffix = 'is') =>
      `${count !== 1 ? noun : suffix}`

    return (
      <div className="App">
        <div className="controlContainer">
          <Client
            selectedChannel={this.state.currentChannel}
            handleChangeUsers={this.handleChangeUsers}
            trayOpen={this.state.trayOpen}
          />
        </div>

        <ChannelList
          handleChangeChannel={this.handleChangeChannel}
          channels={this.state.channels}
        />
      </div>
    )
  }
}

export default App
