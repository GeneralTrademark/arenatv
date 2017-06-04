import React, { Component } from 'react'

class App extends Component {
  render() {
    return (
      <div className="app">
        <nav className="aboutContainer about"><h2>{'About'}</h2></nav>

        <div className="body">
          <header><h2>{'High Precision Folk Sculpture'}</h2></header>

          <main className="content">
            <h1>Imbe&shy;dded</h1>
            <h1>Fo&shy;rms</h1>
          </main>
          <footer><h2>{'Uni-Format Archivalog'}</h2></footer>

        </div>

        <nav className="menuContainer menu"><h2>{'Main Menu'}</h2></nav>
      </div>
    )
  }
}

export default App
