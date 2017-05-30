import React, { Component } from 'react'
import YouTube from 'react-youtube'
import './App.css'
import config from './config'


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      playlistChannelSlug: 'arenatv',
      targetBlockSlugs: [],
      currentVideoId: 'iYJKd0rkKss',
    }
  }

  componentWillMount = () => {
    const component = this
    fetch(`${config.apiBase}/channels/${this.state.playlistChannelSlug}`)
      .then(function (response) {
        return response.json()
      }).then(function (response) {
        const blocks = response.contents
        const reqs = blocks.map(function (block) {
          const slug = block.slug
          return `${config.apiBase}/channels/${slug}`
        })
        component.setState({ targetBlockSlugs: reqs })
      }).catch(function (ex) {
        console.log('parsing failed', ex)
      })
  }

  render() {
    const opts = {
      height: '390',
      width: '640',
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 1,
        controls: 0,
        showinfo: 0,
        autohide: 1,
        fs: 0,
        enablejsapi: 1,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        color: 'white',
        frameborder: 0,
      },
    }

    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to arenatv</h2>
        </div>
        <YouTube
          start={10}
          videoId={this.state.currentVideoId}
          opts={opts}
        />
      </div>
    )
  }
}

export default App
