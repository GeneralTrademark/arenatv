import React, { Component } from 'react'
// import logo from './logo.svg'
import VideoPlayer from './VideoPlayer'
import './App.css'
import Home from './containers/Home'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to arenatv</h2>
        </div>
        <VideoPlayer seekTime={10} videoUrl="iYJKd0rkKss" />
      </div>
    )
  }
}

export default App
