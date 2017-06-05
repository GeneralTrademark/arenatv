import React from 'react'
import './ChannelList.css'

function ChannelList(props) {
  function getChannels() {
    const channelList = props.channels.map(channel =>
      <li className={'channelListItem'} onClick={(e) => props.handleChangeChannel(e, channel.slug)} key={channel.slug}>
        <div className={'listContents'}>
          {channel.title}
        </div>
        <div className={'listContents'}>
          {'/'}
        </div>
        <div className={'listContents'}>
          {channel.username}
        </div>
      </li>
    )
    return channelList
  }

  return (
    <div className={'trayContents'}>
      {'channels'}
      <ul>
        {getChannels()}
      </ul>
    </div>
  )
}


export default ChannelList
