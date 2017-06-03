import React, { Component } from 'react'
import './App.css'
import Client from './Client'
import ChannelList from './ChannelList'
import config from './config'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      playlistChannelSlug: 'arena-tv',
      currentChannel: 'arena-tv',
      currentVideoId: 'iYJKd0rkKss',
      channels: [],
      numUsers: 0,
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
        <div className="App-header">
          <h2>Welcome to arenatv </h2>
          <p>{this.state.numUsers-1} other {maybePluralize(this.state.numUsers-1, 'being')} {isare(this.state.numUsers-1, 'are')} here with you</p>
        </div>
        <Client selectedChannel={this.state.currentChannel} handleChangeUsers={this.handleChangeUsers} />
        <ChannelList
          handleChangeChannel={this.handleChangeChannel}
          channels={this.state.channels}
        />
      </div>
    )
  }
}

export default App
