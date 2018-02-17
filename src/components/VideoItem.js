import React, { Component } from 'react'
import ReactPlayer from 'react-player'
import YouTube from 'youtube-node'

class VideoItem extends Component {
  render() {
    const {
      isPlaying,
      block,
      volume,
      playerStatus,
      handleOnReady,
      handleOnStart,
      handleOnPlay,
      handleOnProgress,
      handleOnDuration,
      handleOnBuffer,
      handleOnError,
      handleOnEnded
    } = this.props

    const style = {}

    const config = {
      soundcloud: {
        clientId: process.env.REACT_APP_SOUNDCLOUD_CLIENT_ID
      },
      youtube: {
        playerVars: {
          fs: 0,
          rel: 0,
          controls: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          showinfo: 0,
          enablejsapi: 1,
          disablekb: 1,
        }
      }
    }

    return (
      <div className="videoItem-container">
        <Thumbnail url={block.largeThumb} />
        <ReactPlayer
          url={block.sanitizedURL}
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
          onEnded={e => handleOnEnded(e)}
          onError={e => handleOnError(e)}
        />
      </div>
    )
  }
}

const Thumbnail = ({ url }) => {
  return (
    <img className="thumbnail" src={url} />
  )
}

export default VideoItem
