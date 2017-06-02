import React from 'react'
import VideoPlayer from './VideoPlayer'
import base from './helpers/base'

class Client extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      time: '60',
      id: 'iYJKd0rkKss',
      details: {},
      loaded: false
    }
  }

  componentWillMount() {
    base.bindToState('arenatv', {
      context: this,
      state: 'details',
      asArray: false,
      then() {
        this.setState({
          loaded: true,
        })
      },
    })
  }

  // componentDidMount() {
  //   base.fetch('arenatv', {
  //     context: this,
  //     asArray: false,
  //     then(data) {
  //       console.log(data)
  //     },
  //   })
  // }

  render() {
    return (
      this.state.loaded
      ? <VideoPlayer
        start={this.state.details.time}
        videoId={this.state.details.id}
      />
      : <div> {'Not loaded'}</div>
    )
  }
}

export default Client
