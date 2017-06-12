import React, { Component } from 'react'
import base from './helpers/base'
import Client from './Client'
import ChannelList from './ChannelList'
import { decode, configureUrlQuery, addUrlProps, replaceUrlQuery, UrlQueryParamTypes } from 'react-url-query'
import Favicon from 'react-favicon'
import config from './config'
import './App.css'

const urlPropsQueryConfig = {
  URICurrentChannel: { type: UrlQueryParamTypes.string, queryParam: 'ch' },
}

configureUrlQuery({
  addRouterParams: false,
})

const defaultChannelSlug = 'herzog'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentChannel: !this.props.URICurrentChannel ? 'herzog' : this.props.URICurrentChannel,
      currentChannelName: '',
      currentVideoName: '',
      channels: [],
      numUsers: 0,
      muted: false,
      currentVideoStatus: -1,
      trayOpen: false,
      isLoaded: false,
      isClientLoaded: false,
    }
    replaceUrlQuery({'ch': this.state.currentChannel })
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.URICurrentChannel !== this.props.URICurrentChannel) {
      console.log('SWITCHING!!!!!')
      this.setState({
        currentChannel: nextProps.URICurrentChannel,
      })
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
    const isMedia = item.class === "Media"
    if (isMedia && item.source.url.indexOf('list') > 0) return "playlist"
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
        //make sure channel has contents
        channelArr = channelArr.filter(channel => {
          return channel.length > 0
        })
        component.setState({channels: channelArr})
        channelArr.map((channel) => {
          base.update(`channels/${channel.slug}`, {
            data: {
              slug: channel.slug,
              title: channel.title,
              health: 0,
              username: channel.user.username,
              // currentVideoIndex: 0,
              // time: 0,
            },
          }).then(this.getCurrentChannelName(this.state.currentChannel))
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
        return video = {url: this.getYoutubeId(video.source.url), title: video.title}
      })
      base.update(`channels/${targetSlug}`, {
        data: {videos: youtubeSlugs},
      })
    })
  }

  handleChangeChannel = (e, target) => {
    replaceUrlQuery({'ch': target})
    this.getCurrentChannelName(target)
    this.getVids(target)
    e.stopPropagation()
    e.preventDefault()
  }

  handleChangeUsers = (num) =>{
    this.setState({
      numUsers: num,
    })
  }

  onMuteVideo = (event) => {
    this.setState({
      muted: !this.state.muted,
    })
    event.stopPropagation()
    event.preventDefault()
  }

  getVideoStatus = (status) => {
    console.log(status)
    this.setState({
      currentVideoStatus: status,
    })
  }

  getCurrentChannelName = (target) => {
    const currentChannel = this.state.channels.filter(channel => {
      return channel.slug === target
    })
    this.setState({
      currentChannelName: currentChannel[0].title,
    })
  }

  getCurrentVideoName = (name) => {
    this.setState({
      currentVideoName: name,
    })
  }

  getClientStatus = (isLoaded) => {
    this.setState({
      isClientLoaded: isLoaded,
    })
  }

  handleLoadingState = () => {
    if (this.state.isClientLoaded === true && this.state.currentVideoStatus === 1) {
      return 'loadingState' + ' ' + 'loadingOff'
    } else {
      return 'loadingState' + ' ' + 'loadingOn'
    }
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

  toggleTrayState = (event) => {
    const trayOpen = this.state.trayOpen
    this.setState({
      trayOpen: !trayOpen,
    })
    event.stopPropagation()
    event.preventDefault()
  }


  setTrayClass = () => {
    const trayOpen = this.state.trayOpen
    let classToSet
    if (trayOpen) {
      classToSet = 'trayOpen' + ' ' + 'tray'
    } else {
      classToSet = 'trayClosed' + ' ' + 'tray'
    }
    return classToSet
  }

  handleFavicon = () => {
    let data
    switch(this.state.currentVideoStatus) {
    case -1:
        data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAXRJREFUWAljYBgFoyEwGgIDHAKMxNr///9/ZoYN2xUYGP+qM/z7J8rAyMAL1AvCIPCZ4T8QMzG9ZvjPfJMhwPMBIyPjX4gUfhKnA8AWbtpkx/CPwRVoBAjrMvz/z47fOKgsI+NPIOsyEO9mYAJiP79DuByE4YD/GzeKM/z9nw7UnArEMkBMDfAEaMhsBm7OGYzu7q+QDYQ7ABLEm3MZGP43An3Kh6yIamxGxk8MDIz1DAG+k2EhAnbA//37eRg+fFoPtNiFapbhM4iRcQ+DAF8go6PjFyawz99/2kE3y0EOA3kUaCfIbsb/GzbkARPaRHwOppkcE0M+EzD7xNHMAkIGA+0GOUCdkDqayQPtZgIWKDdpZgEhg4F2gxywiJA6mskD7WYE54L1mw4Ck6Y1zSzCajDjUYZAP3smcIEgyOfBAMqb9AIgu4B2guweHCUhsscHrC5AdgSIDU4bA1EbojsExgc7iAbtAZj5o/RoCIyGwMgNAQBQ8pjlfYLQegAAAABJRU5ErkJggg=='
        break
    case 0:
        data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAXRJREFUWAljYBgFoyEwGgIDHAKMxNr///9/ZoYN2xUYGP+qM/z7J8rAyMAL1AvCIPCZ4T8QMzG9ZvjPfJMhwPMBIyPjX4gUfhKnA8AWbtpkx/CPwRVoBAjrMvz/z47fOKgsI+NPIOsyEO9mYAJiP79DuByE4YD/GzeKM/z9nw7UnArEMkBMDfAEaMhsBm7OGYzu7q+QDYQ7ABLEm3MZGP43An3Kh6yIamxGxk8MDIz1DAG+k2EhAnbA//37eRg+fFoPtNiFapbhM4iRcQ+DAF8go6PjFyawz99/2kE3y0EOA3kUaCfIbsb/GzbkARPaRHwOppkcE0M+EzD7xNHMAkIGA+0GOUCdkDqayQPtZgIWKDdpZgEhg4F2gxywiJA6mskD7WYE54L1mw4Ck6Y1zSzCajDjUYZAP3smcIEgyOfBAMqb9AIgu4B2guweHCUhsscHrC5AdgSIDU4bA1EbojsExgc7iAbtAZj5o/RoCIyGwMgNAQBQ8pjlfYLQegAAAABJRU5ErkJggg=='
        break
    case 1:
        data='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAYhJREFUWAntlj9LA0EQxWf2CGkMSDAGwUKrFGJvYyTggaUJpLUTO/98BD+ChSDY2QajdkKEoCLYi0W0sbCJCSmMKObMjfuEA0lYvML1Cu+aZWfn3m/mwc0eUfzEDsQOROwAh+WXpexcH59PeX0vR0oy5HNKmFJ4n4W6OtbVsVbCSTTmlhceKlzph9E2FgDgZbWeZ+q7IuIS06wIJUOJMr2T0A0z14Sc2nypcGEqaKiA6ZPx7JvXWyPmVQ2eDAP8KUcX8kgi+6KSe81S8+l7vgo26HjiML356nl3QrT9W3DoQwua5PfuwQAr4H45MFPPjLQ73pG2bTE4sLoynY2lE8XbQutFoZp25+P0z+DoTDcKJticrY6uk087Vjs2iSvaUPoTWjGd246DrUQ4Zxtk0gdbMUvDlGA7DrbS0+zANsikD7bKF91dPXSuTEnW4poJdvRzAB1iIORL7pJitaWvlmdrXWttMMACE5zI74KhAoLuMaUiuQ2DAgZXFGTjf2CQE+9jB2IH/p8Dn8V2yWB9H+D3AAAAAElFTkSuQmCC'
        break
    case 2:
        data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAYlJREFUWAntVj1Lw1AUvecVK37EzSrEwS2DiINDB0ERWrQ6+QfcxEn9CeJPEBfBzT/gVCu0IAoOCk7FIZugHaybsaJFe72vUAlKmgx9VjBZ8vJy3jnnHl7uC1F8xQnECXQ5AUTVZ+bEdaE6zqg7DcIwMSyZs/R6AB6BPUX8CE6607nUrcx9ROEONKAFL/OVWQXKMnFWyCaZqTcSKehNcGUQig2mYnrZPg8y9MNAufQwUnt9Xwd4TUyMRREMw4j4PTMO+noS+1MLo1U//stAs+JCZQPMO1LpkB/UqTFATwxsp3P2XiuRpoGb0+qgV6sfEXGmU2LteVCyBpIrE/OpZ6Ur917qJ78nrq1xRmtqbVzl7zZlo+y2d2zmrWzwLdVgrJqhD2fV2kpgTjjUGMLRBlxj9OHErlLgw3CcGYTWls9eOt5x5YyYZ8zIBLACF+kle07phmD1Jxelo5cCoAampQ+Iptb+G53QX2LXzgK/CT1u7o1unIbfjbSetSET/wMt/vgeJxAn8H8T+ATOLsXoaiZrTgAAAABJRU5ErkJggg=='
        break
    case 3:
        data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAYlJREFUWAntVj1Lw1AUvecVK37EzSrEwS2DiINDB0ERWrQ6+QfcxEn9CeJPEBfBzT/gVCu0IAoOCk7FIZugHaybsaJFe72vUAlKmgx9VjBZ8vJy3jnnHl7uC1F8xQnECXQ5AUTVZ+bEdaE6zqg7DcIwMSyZs/R6AB6BPUX8CE6607nUrcx9ROEONKAFL/OVWQXKMnFWyCaZqTcSKehNcGUQig2mYnrZPg8y9MNAufQwUnt9Xwd4TUyMRREMw4j4PTMO+noS+1MLo1U//stAs+JCZQPMO1LpkB/UqTFATwxsp3P2XiuRpoGb0+qgV6sfEXGmU2LteVCyBpIrE/OpZ6Ur917qJ78nrq1xRmtqbVzl7zZlo+y2d2zmrWzwLdVgrJqhD2fV2kpgTjjUGMLRBlxj9OHErlLgw3CcGYTWls9eOt5x5YyYZ8zIBLACF+kle07phmD1Jxelo5cCoAampQ+Iptb+G53QX2LXzgK/CT1u7o1unIbfjbSetSET/wMt/vgeJxAn8H8T+ATOLsXoaiZrTgAAAABJRU5ErkJggg=='
        break
    case 5:
        break
    default:
        data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAXRJREFUWAljYBgFoyEwGgIDHAKMxNr///9/ZoYN2xUYGP+qM/z7J8rAyMAL1AvCIPCZ4T8QMzG9ZvjPfJMhwPMBIyPjX4gUfhKnA8AWbtpkx/CPwRVoBAjrMvz/z47fOKgsI+NPIOsyEO9mYAJiP79DuByE4YD/GzeKM/z9nw7UnArEMkBMDfAEaMhsBm7OGYzu7q+QDYQ7ABLEm3MZGP43An3Kh6yIamxGxk8MDIz1DAG+k2EhAnbA//37eRg+fFoPtNiFapbhM4iRcQ+DAF8go6PjFyawz99/2kE3y0EOA3kUaCfIbsb/GzbkARPaRHwOppkcE0M+EzD7xNHMAkIGA+0GOUCdkDqayQPtZgIWKDdpZgEhg4F2gxywiJA6mskD7WYE54L1mw4Ck6Y1zSzCajDjUYZAP3smcIEgyOfBAMqb9AIgu4B2guweHCUhsscHrC5AdgSIDU4bA1EbojsExgc7iAbtAZj5o/RoCIyGwMgNAQBQ8pjlfYLQegAAAABJRU5ErkJggg=='
    }
  return (data)
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
              <div className={'logoMark'}>
                <div className={'mark'} />
                <div className={'slash'}/>
                <h1>{'tv'}</h1>
              </div>
                <button id="channels" onClick={(e) => this.toggleTrayState(e)}><h2>{`${this.state.channels.length} Channels`}</h2></button>
              </header>
              <footer>
              <div className={'info'}>
                <div className={this.indicateStatus()} />
                <Favicon url={this.handleFavicon()}/>
                <div className={'spacer'} />
                <h2>{`${this.state.currentChannelName}`}</h2>
                <div className={'smallSlash'} />
                <p>{`${this.state.currentVideoName}`}</p>
              </div>
              <div className={'info'}>
              <p>{this.state.numUsers-1} {maybePluralize(this.state.numUsers-1, 'other')} {isare(this.state.numUsers-1, 'are')} watching with you</p>
              <button
                className="button"
                id="mute"
                onClick={(e) => this.onMuteVideo(e)}>
                {this.state.muted ? <div className={'sound_off'} /> : <div className={'sound_on'} />}
              </button>
              </div>
              </footer>
            </div>
              <div className={this.handleLoadingState()} />
              <Client
                currentChannel={this.state.currentChannel}
                handleChangeUsers={this.handleChangeUsers}
                trayOpen={this.state.trayOpen}
                muted={this.state.muted}
                getVideoStatus={this.getVideoStatus}
                getCurrentVideoName={this.getCurrentVideoName}
                getClientStatus={this.getClientStatus}
                getChannels={this.getChannels}
              />
          </div>
        </div>
        <div className={this.setTrayClass()}>
          <ChannelList
            handleChangeChannel={this.handleChangeChannel}
            channels={this.state.channels}
            currentChannel={this.state.currentChannel}
          />
        </div>
      </div>
    )
  }
}

export default addUrlProps({ urlPropsQueryConfig })(App)
