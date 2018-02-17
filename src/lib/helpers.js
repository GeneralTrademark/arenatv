import ReactPlayer from 'react-player'

const youtubeRegex = /(youtu(?:\.be|be\.com)\/(?:.*v(?:\/|=)|(?:.*\/)?)([\w'-]+))/gi


function makeHash() {
  let text = ''
  let possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  return text
}

// only sanitizes youtube, but could support more srcs
function sanitizeURL(url) {
  // returns 2 match groups : URL with youtube.com and ID [0], and only ID [1]
  const youtubeResult = url.match(youtubeRegex)
  if (youtubeResult) {
    return youtubeResult[0]
  }
  return url
}

function getYoutubeID(url) {
  const regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[1].length==11) ? match[1] : false
}

// inserts a valdity message into a copy of the block
function mm(isValid, message, item) {
  return {
    ...item,
    validity: { isValid, message }
  }
}

// our default messages
const message = {
  missing: 'Missing URL 😮',
  class: 'Unplayable block type 😥',
  noPlay: 'Cannot play items from this source 😞',
  valid: 'Valid'
}

// get URL from different types of blocks
function getURL(item) {
  switch (item.class) {
    case 'Attachment':
      return item.attachment.url
    case 'Media':
      return item.source.url
    default:
      return false
  }
}

// this returns a message with information about validation.
// invalid URLs will always have false as it's url key so it can be used with
// array.filter or others
function validateWithMessage(item) {
  let url = getURL(item)
  // catch any glaring issues
  if (url === null) {
    return mm(false, message.missing, item)
  }
  if (url === false) {
    return mm(false, message.class, item)
  }
  // sanitize our URL with regex
  const sanitizedURL = sanitizeURL(url)
  // copy the item and update it's URL with the sanitized one
  const sanitizedItem = Object.assign(
    {},
    { ...item },
    { sanitizedURL, }
  )
  // check if reactplayer can play
  if (ReactPlayer.canPlay(sanitizedURL)) {
    return mm(true, message.valid, sanitizedItem)
  }
  // if nothing has gone well for this URL we just tell it not to play
  return mm(false, message.noPlay, item)
}

// Valid blocks don't need titles so we add one if it is missing
function scrubTitle(title) {
  if (title === null || title === '') {
    return 'Untitled on Are.na'
  }
  return title
}

// get block status
function getStatus(item) {
  switch (item.status) {
    case 'public':
      return 'public'
    case 'closed':
      return 'closed'
    default:
      return 'public'
  }
}

const playerStates = {
  idle: 'IDLE',
  buffering: 'BUFFERING',
  playing: 'PLAYING',
  errored: 'ERRORED'
}

const sortKeys = {
  title: 'title',
  updated_at: 'updated_at',
  created_at: 'created_at',
  connected_at: 'connected_at',
  position: 'position'
}

function stringComparator(a, b) {
  // since contents aren't guaranteed to have names, check for nulls
  const nameA = scrubTitle(a).toLowerCase()
  const nameB = scrubTitle(b).toLowerCase()
  if (nameA < nameB) {
    return -1
  }
  if (nameA > nameB) {
    return 1
  }
  return 0
}

function numComparator(a, b) {
  if (a < b) {
    return -1
  }
  if (a > b) {
    return 1
  }
  return 0
}

function timeComparator(a, b) {
  const dateA = new Date(a)
  const dateB = new Date(b)
  if (dateA < dateB) {
    return -1
  }
  if (dateA > dateB) {
    return 1
  }
  return 0
}

// chooses a comparator to use based on input type
function comparator(a, b, param) {
  switch (param) {
    case sortKeys.title:
      return stringComparator(a, b)
    case sortKeys.created_at:
      return timeComparator(a, b)
    case sortKeys.updated_at:
      return timeComparator(a, b)
    case sortKeys.connected_at:
      return timeComparator(a, b)
    case sortKeys.position:
      return numComparator(a, b)
    default:
      return 0
  }
}

// executes array.sort with comparator and handles order inversion
function sortChannelContents(channelContents, sortObj) {
  const { orderKey, paramKey } = sortObj
  const sortedArr = channelContents.sort((a, b) =>
    comparator(a[paramKey], b[paramKey], paramKey)
  )
  if (orderKey) {
    return sortedArr
  } else {
    return sortedArr.reverse()
  }
}

function immutablyChangeContents(newContents, channel) {
  return {
    ...channel,
    contents: newContents
  }
}

function incrementInList(list, currentIndex) {
  const listLength = list.length
  if (currentIndex + 1 < listLength) {
    return list[currentIndex + 1]
  }
  return false
}

function decrementInList(list, currentIndex) {
  if (currentIndex > 0) {
    return list[currentIndex - 1]
  }
  return false
}

function getThumbnail(url) {

}

export {
  sanitizeURL,
  makeHash,
  getURL,
  validateWithMessage,
  scrubTitle,
  getStatus,
  playerStates,
  sortKeys,
  sortChannelContents,
  immutablyChangeContents,
  incrementInList,
  decrementInList,
  getYoutubeID,
}
