import React from 'react'
import './ChannelList.css'

function ChannelList(props) {
  function getChannels() {
    const channelList = props.channels.map((channel, index) =>
      <li
        value={props.currentChannel === channel.slug ? 0 : index + 1}
        className={'channelListItem'}
        onClick={(e) => props.handleChangeChannel(e, channel.slug)}
        key={channel.slug}>
        <div className={'heading'}>
            <h2>{channel.title}</h2>
            <p>{channel.user.username}</p>
            <div className='meta'>
              <p>{'23 videos'}</p>
              <p>{'Link'}</p>
            </div>
        </div>
      </li>
    )
    return channelList
  }

  return (
    <div className={'trayContents'}>
      {'channels'}
      <ol>
        {getChannels()}
      </ol>
    </div>
  )
}


export default ChannelList
