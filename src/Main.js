import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  withRouter
} from 'react-router-dom'

import VideoItem from './components/VideoItem'
import Controls from './components/Controls'

import { tinyAPI } from './lib/api'
import base from './lib/base'
import {
  playerStates,
  sortKeys,
  sortChannelContents,
  immutablyChangeContents,
  validateWithMessage,
  incrementInList,
  decrementInList
} from './lib/helpers'

class Main extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isPlaying: false,
      playerStatus: '',
      volume: 0.8,
      currentItem: '',
      playlist: '',
      currentPlayerID: '',
    }
    this.API = new tinyAPI()
    // this.playerRef = null
  }

  componentWillMount = () => {
    base.listenTo('currentChannel', {
     context: this,
     asArray: false,
     then(data) {
       this.getChannelContents(data)
     },
   })
    console.log(process.env)
  }

  requestCurrentChannel = () => {

  }

  getChannelContents = (data) => {
    console.log(data)
  }

  initializeCookies = () => {
    // FYI cookie returns string
    // if (localStorage.getItem('isInverted') === 'true') {
    //   this.invert()
    // } else {
    //   this.unInvert()
    // }
  }

  play = () => {
    this.setState({ isPlaying: true })
  }

  pause = () => {
    this.setState({ isPlaying: false, playerStatus: playerStates.idle })
  }

  // update +1 track and index
  goToNextTrack = () => {
    const { playlist, currentItem } = this.state
    const trackList = playlist.contents
    const indexOfCurrentItem = trackList.findIndex(
      block => block.id === currentItem.id
    )
    const nextItem = incrementInList(trackList, indexOfCurrentItem)
    if (nextItem) {
      this.setState({ currentItem: nextItem })
    } else {
      this.pause()
      this.setState({ currentItemURL: false, currentItem: false })
    }
  }

  //  update -1 track and index
  goToPreviousTrack = () => {
    const { playlist, currentItem } = this.state
    const trackList = playlist.contents
    const indexOfCurrentItem = trackList.findIndex(
      block => block.id === currentItem.id
    )
    const previousItem = decrementInList(trackList, indexOfCurrentItem)
    if (previousItem) {
      this.setState({ currentItem: previousItem })
    } else {
      // this.playerRef.seekTo(0)
    }
  }

  setCurrentRoute = currentRoute => {
    this.setState({ currentRoute })
  }

  handleOnReady = e => {
    // console.log(e, 'ready')
  }

  handleOnStart = e => {
    // console.log(e, 'start')
  }

  handleOnPlay = e => {
    this.setState({ playerStatus: playerStates.playing })
  }

  handleOnProgress = e => {
    this.setState({ trackProgress: e.playedSeconds })
  }

  handleOnDuration = e => {
    this.setState({ trackDuration: e })
  }

  handleOnBuffer = e => {
    this.setState({ playerStatus: playerStates.buffering })
  }

  handleOnError = event => {
    this.setState({ playerStatus: playerStates.errored })
    this.goToNextTrack()
  }

  makeVideoList = (channel) => {
    return channel.map(chan => {
      return <VideoItem
        {...this.state}
        // ref={this.ref}
        returnRef={this.returnRef}
        handlePlayback={this.handlePlayback}
        goToNextTrack={this.goToNextTrack}
        goToPreviousTrack={this.goToPreviousTrack}
        handleOnReady={this.handleOnReady}
        handleOnStart={this.handleOnStart}
        handleOnPlay={this.handleOnPlay}
        handleOnProgress={this.handleOnProgress}
        handleOnDuration={this.handleOnDuration}
        handleOnBuffer={this.handleOnBuffer}
        handleOnError={this.handleOnError}
      />
    })
  }

  render() {
    return (
      <main>
        <span id="carfullyBalancedContainer">

          <Controls
          />
        </span>

      </main>
    )
  }
}

export default Main
