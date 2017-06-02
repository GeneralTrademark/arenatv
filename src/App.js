import React, { Component } from 'react'
import base from './helpers/base'
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
    }
  }

  componentWillMount = () => {
    this.updateChannelList()
    // this.updateVideos()
  }

  updateVideos = (toUpdate) => {
    base.fetch('channels', {
      context: this,
      asArray: true,
      then() {
        Promise.all(toUpdate.map(channel =>
          fetch(`${config.apiBase}/channels/${channel.slug}/contents`).then(resp => resp.json())
        )).then((videos) => {
          console.log(videos)
        }).catch((error) => {
          console.log('parsing failed', error)
        })
      },
    })
  }


  // updateVideos = () => {
  //   base.listenTo('votes', {
  //   context: this,
  //   asArray: true,
  //   then(votesData){
  //     var total = 0;
  //     votesData.forEach((vote, index) => {
  //       total += vote
  //     });
  //     this.setState({total});
  //   }
  // })
  //   Promise.all(channels.map(block =>
  //     fetch(`${config.apiBase}/channels/${block.slug}/contents`).then(resp => resp.json())
  //       )).then(texts => {
  //         console.log(texts)
  //       }).catch(function (ex) {
  //         console.log('parsing failed', ex)
  //       })
  // }


  updateChannelList = () => {
    const component = this
    fetch(`${config.apiBase}/channels/${this.state.playlistChannelSlug}`)
      .then(function (response) {
        return response.json()
      }).then(function (response) {
        const channels = response.contents
        component.setState({ channels })
        Promise.all(channels.map(channel =>
          base.post(channel.slug, {
            data: { channel },
          }).catch((err) => {
            console.log(`Error post channels to FB: ${err}`)
          })
        ))
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
        <Client selectedChannel={this.state.currentChannel} />
        <ChannelList
          handleChangeChannel={this.handleChangeChannel}
          channels={this.state.channels}
        />
      </div>
    )
  }
}

export default App
