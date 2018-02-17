import React, { Component } from 'react'

import VideoItem from './components/VideoItem'
import Controls from './components/Controls'

import { tinyAPI } from './lib/api'
import base from './lib/base'
import {
  playerStates,
  immutablyChangeContents,
  validateWithMessage,
  incrementInList,
  decrementInList,
  getYoutubeID
} from './lib/helpers'

class Main extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isPlaying: false,
      playerStatus: playerStates.idle,
      volume: 0.8,
      currentItem: null,
      playlistChannel: null,
      currentPlayerID: null,
    }
    this.API = new tinyAPI()
  }

  componentWillMount = () => {
    this.initializeCookies()
    this.callBase('slug', false)
  }

  // gets the slug of the week from firebase
  callBase = (key, asArray, callback) => {
    base.listenTo(key, {
     context: this,
     asArray: asArray,
     then(slug) { this.callArena(slug) }
   })
  }

  // ask arena to return the contents of the channel of the week
  callArena = (slug) => {
    Promise.resolve(this.API.getFullChannel(slug)).then(playlistChannel => {
      const validatedContents = playlistChannel.contents.map(item => {
        return validateWithMessage(item)
      })
      const onlyValids = validatedContents.filter(
        item => item.validity.isValid
      )
      const withMetadata = onlyValids.map(item => {
        const id = getYoutubeID(item.sanitizedURL)
        return {
          ...item,
          largeThumb: `https://i1.ytimg.com/vi/${id}/maxresdefault.jpg`
        }
      })
      const resolvedChannel = immutablyChangeContents(withMetadata, playlistChannel)

      this.setState({ playlistChannel: resolvedChannel })
  })
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

  togglePlayPause = () => {
    if (this.state.isPlaying) {
      this.pause()
    } else {
      this.play()
    }
  }

  // update +1 track and index
  gotToNext = () => {
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
  goToPrevious = () => {
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

  handleOnEnded = e => {
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
    this.gotToNext()
  }

  makeVideoList = () => {
    const { playlistChannel } = this.state
    if (playlistChannel) {
      return playlistChannel.contents.map(block => {
        return <VideoItem
          {...this.state}
          key={block.id}
          block={block}
          id={block.id}
          handleOnReady={this.handleOnReady}
          handleOnStart={this.handleOnStart}
          handleOnPlay={this.handleOnPlay}
          handleOnProgress={this.handleOnProgress}
          handleOnDuration={this.handleOnDuration}
          handleOnBuffer={this.handleOnBuffer}
          handleOnError={this.handleOnError}
          handleOnEnded={this.handleOnEnded}
        />
      })
    }
    return null
  }

  render() {

    return (
      <main>
        <span id="carfullyBalancedContainer">
          { this.makeVideoList() }
          <Controls />
        </span>

      </main>
    )
  }
}

export default Main
