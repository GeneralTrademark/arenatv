import React, { Component } from 'react'
import './App.css'
import VideoPlayer from './VideoPlayer'
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

  componentWillMount() {
    let blocks
    const component = this
    fetch(`${config.apiBase}/channels/${this.state.playlistChannelSlug}`)
      .then(function (response) {
        return response.json()
      }).then(function (response) {
        blocks = response.contents
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
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to arenatv</h2>
        </div>
        <VideoPlayer
          start={10}
          videoId={this.state.currentVideoId}
        />
      </div>
    )
  }
}

export default App
