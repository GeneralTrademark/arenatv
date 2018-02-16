import React, { Component } from 'react'
import ReactPlayer from 'react-player'

class VideoItem extends Component {
  render() {
    const {
      isPlaying,
      handlePlayback,
      goToNextTrack,
      goToPreviousTrack,
      currentItem,
      handleOnReady,
      handleOnStart,
      handleOnPlay,
      handleOnProgress,
      handleOnDuration,
      handleOnBuffer,
      handleOnError,
      volume,
      playerStatus
    } = this.props

    const style = {}

    const config = {
      soundcloud: {
        clientId: process.env.REACT_APP_SOUNDCLOUD_CLIENT_ID
      }
    }

    return (
        <ReactPlayer
          url={''}
          playing={isPlaying}
          autoPlay={false}
          hidden={false}
          style={style}
          volume={volume} // 0 to 1
          config={config}
          onReady={e => handleOnReady(e)}
          onStart={e => handleOnStart(e)}
          onPlay={e => handleOnPlay(e)}
          onProgress={e => handleOnProgress(e)}
          onDuration={e => handleOnDuration(e)}
          onBuffer={e => handleOnBuffer(e)}
          onEnded={() => goToNextTrack()}
          onError={e => handleOnError(e)}
        />
    )
  }
}

export default VideoItem
