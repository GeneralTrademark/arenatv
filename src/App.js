import React, { Component } from 'react'
import './App.css'
import VideoPlayer from './VideoPlayer'
import ChannelList from './ChannelList'
import config from './config'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      playlistChannelSlug: 'arenatv',
      currentChannel: 'arena-tv',
      currentVideoId: 'iYJKd0rkKss',
      channels: [],
    }
  }

  componentWillMount = () => {
    const component = this
    fetch(`${config.apiBase}/channels/${this.state.playlistChannelSlug}`)
      .then(function (response) {
        return response.json()
      }).then(function (response) {
        const channels = response.contents
        console.log(channels)
        component.setState({ channels })
        Promise.all(channels.map(block =>
          fetch(`${config.apiBase}/channels/${block.slug}/contents`).then(resp => resp.json())
            )).then(texts => {
              console.log(texts)
            })
      }).catch(function (ex) {
        console.log('parsing failed', ex)
      })
  }

  handleChangeChannel = (target) => {
    this.setState({
      currentChannel: target,
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
          currentVideoId={this.state.currentVideoId}
        />
        <ChannelList
          handleChangeChannel={this.handleChangeChannel}
          channels={this.state.channels}
        />
      </div>
    )
  }
}

export default App
