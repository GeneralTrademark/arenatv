import React from 'react'
import 'whatwg-fetch'
import config from '../config'

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      playlistChannelSlug: 'arenatv',
      targetBlockSlugs: [],
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
      <div>
        {'hello'}
      </div>
    )
  }
}

export default Home
