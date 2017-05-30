import React, { Component } from 'react';
import logo from './logo.svg';
import './VideoPlayer'
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h2>Welcome to arenatv</h2>
        </div>
        <VideoPlayer />
      </div>
    )
  }
}

export default App
