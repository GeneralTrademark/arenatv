import React from 'react'

function ChannelList(props) {
  function getChannels() {
    const channelList = props.channels.map(channel =>
      <li className={'channelListItem'} onClick={() => props.handleChangeChannel(channel.slug)} key={channel.slug}>
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
    <div>
      {'channels'}
      <ul>
        {getChannels()}
      </ul>
    </div>
  )
}


export default ChannelList
