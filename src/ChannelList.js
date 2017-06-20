import React from 'react'
import './ChannelList.css'

function ChannelList(props) {
  function handleExternalLink(event, href){
    window.location.assign(href)
    event.preventDefault()
    event.stopPropagation()
  }

  function getChannels() {
    const channelList = props.channels.map((channel, index) => {
      let borderColor
      switch(channel.status) {
        case 'private': borderColor = '#FFAEB0'
          break
        case 'public': borderColor = '#17AC10'
          break
        case 'closed': borderColor = '#C8B4E3'
          break
        default: borderColor = 'white'
      }
      let computed = {}
      if (channel.slug === props.currentChannel) {
        computed = {
          order: -1,
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor,
          color: 'white',
          opacity: 1,
          marginTop: '40px',
          position: 'absolute',
          zIndex: 998,
          top: 0,
          marginLeft: '10px',
          marginRight: '10px',
          width:'300px',
          boxShadow: '0px 6px 30px 10px black',
        }
      } else {
        computed = {
          order: index,
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor,
        }
      }
      return (
        <div
          style={computed}
          className={'channelListItem'}
          onClick={(e) => props.handleChangeChannel(e, channel.slug)}
          key={channel.slug}>
          <div className={'heading'}>
              <div className='header'>
                <h2>{channel.title}</h2>

                <button
                  className={'externalLink'}
                  onClick={(e) => handleExternalLink(e, `https://www.are.na/channels/${channel.slug}`)}>
                  {'↗'}
                </button>
              </div>
              <p>{channel.username}</p>
          </div>
          <div className='meta'>
          <p>Current Viewers: {channel.watchers}</p>
          </div>
        </div>
      )
    })
    return channelList
  }

  return (
    <div className={'trayContents'}>
      <div className='channelHeader'><p>{'You\'re watching'}</p></div>
      <div className='list'>
        {getChannels()}
      </div>
    </div>
  )
}


export default ChannelList
