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
      let computed = {}
      if (channel.slug === props.currentChannel) {
        computed = {
          order: -1,
          border: '2px solid white',
          color: 'white',
        }
      } else {
        computed = {
          order: index,
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
              <p>{channel.user.username}</p>

          </div>
          <div className='meta'>
            <p>{`${channel.length} videos`}</p>
          </div>
        </div>
      )
    })
    return channelList
  }

  return (
    <div className={'trayContents'}>
      <div className='channelHeader'><h2>{'Channels'}</h2></div>
      <div className='list'>
        {getChannels()}
      </div>
    </div>
  )
}


export default ChannelList
