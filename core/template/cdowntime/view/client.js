// Elements
const timeElement = document.getElementById('time')
const containers = document.querySelectorAll('.container')
const titlePage = document.getElementById('titlePage')
// const test = document.getElementById('test'); // Commented out unused variable
const socket = new WebSocket(`ws://localhost:${window.location.port}`)

const classElement = window.location.href.split('/')[3]
titlePage.textContent = classElement + ' - View'

let intervalId = null
let formatTimeVar

socket.addEventListener('open', (event) => {
  console.log('WebSocket Connection Opened')

  // Request the WebSocket server to send variable data
  socket.send(JSON.stringify({ action: 'getVariables', classElement }))
})

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)

  if (message.action === 'reload') {
    window.location.reload()
  }

  if (message.action === 'sendVariables' && message.classElement === classElement && message.config) {
    document.documentElement.lang = Object.keys(message.formats.langs).includes(message.config.lang)
      ? message.config.lang
      : 'en'
  }

  if (message[classElement].endDatetime !== undefined) {
    if (formatTimeVar !== message[classElement].formatTime && intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }

    formatTimeVar = message[classElement].formatTime
    if (message[classElement].endDatetime <= Date.now()) {
      if (message[classElement].msgEnd !== '') {
        timeElement.textContent = message[classElement].msgEnd
        twemoji.parse(document.body)
      } else {
        updateTimeDisplay(formatTimeVar, 0)
      }
    }

    // Update the timer based on the received message
    timeElement.style.fontFamily = `"${message[classElement].font}"`
    timeElement.style.fontSize = message[classElement].size + 'px'
    timeElement.style.color = message[classElement].colorText

    if (message[classElement].bold) {
      timeElement.style.fontWeight = 'bold'
    } else {
      timeElement.style.fontWeight = 'normal'
    }
    if (message[classElement].italic) {
      timeElement.style.fontStyle = 'italic'
    } else {
      timeElement.style.fontStyle = 'normal'
    }
    if (message[classElement].underline) {
      timeElement.style.textDecoration = 'underline'
    } else {
      timeElement.style.textDecoration = 'none'
    }
    containers.forEach((container) => {
      container.style.textAlign = message[classElement].align
    })

    // If the timer is in the "started" state, start the interval
    if (message[classElement].endDatetime > Date.now()) {
      if (!intervalId) {
        intervalId = setInterval(() => {
          if (message[classElement].endDatetime > Date.now()) {
            updateTimeDisplay(formatTimeVar, message[classElement].endDatetime - Date.now())
          } else {
            socket.send(JSON.stringify({ action: 'reloadPage' }))
          }
        }, 1) // Update every 1 millisecond
      }
    } else {
      // If the timer is not in the "started" state, stop the interval
      clearInterval(intervalId)
      intervalId = null
    }
  }
})

socket.addEventListener('close', (event) => {
  console.log('WebSocket Connection Closed')
})

function updateTimeDisplay (format, milliseconds) {
  if (isNaN(milliseconds)) {
    milliseconds = 0
  }

  const totalMilliseconds = Math.floor(milliseconds)
  const totalSeconds = Math.floor(totalMilliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const remainingSeconds = totalSeconds % 60
  const remainingMilliseconds = totalMilliseconds % 1000

  const formattedTime = formatTime(format, hours, minutes, remainingSeconds, remainingMilliseconds)
  timeElement.textContent = formattedTime
}

function formatTime (format, hours, minutes, seconds, milliseconds) {
  switch (format) {
    case 'HH:mm:ss.000':
      return `${formatTimeComponent(hours)}:${formatTimeComponent(minutes)}:${formatTimeComponent(seconds)}.${formatMilliseconds(milliseconds)}`
    case 'HH:mm:ss':
      return `${formatTimeComponent(hours)}:${formatTimeComponent(minutes)}:${formatTimeComponent(seconds)}`
    case '(HH:)(mm:)ss.000':
      return `${hours !== 0 ? formatTimeComponent(hours) + ':' : ''}${(hours !== 0 || minutes !== 0) ? formatTimeComponent(minutes) + ':' : ''}${formatTimeComponent(seconds)}.${formatMilliseconds(milliseconds)}`
    case '(HH:)(mm:)ss':
      return `${hours !== 0 ? formatTimeComponent(hours) + ':' : ''}${(hours !== 0 || minutes !== 0) ? formatTimeComponent(minutes) + ':' : ''}${formatTimeComponent(seconds)}`
    case '(HH:)mm:ss.000':
      return `${hours !== 0 ? formatTimeComponent(hours) + ':' : ''}${formatTimeComponent(minutes)}:${formatTimeComponent(seconds)}.${formatMilliseconds(milliseconds)}`
    case '(HH:)mm:ss':
      return `${hours !== 0 ? formatTimeComponent(hours) + ':' : ''}${formatTimeComponent(minutes)}:${formatTimeComponent(seconds)}`
    case 'MM:ss.000':
      return `${formatTimeComponent(minutes + hours * 60)}:${formatTimeComponent(seconds)}.${formatMilliseconds(milliseconds)}`
    case 'MM:ss':
      return `${formatTimeComponent(minutes + hours * 60)}:${formatTimeComponent(seconds)}`
    case 'SS.000':
      return `${formatTimeComponent(seconds + minutes * 60 + hours * 3600)}.${formatMilliseconds(milliseconds)}`
    case 'SS':
      return `${formatTimeComponent(seconds + minutes * 60 + hours * 3600)}`
    default:
      return '' // Return an empty string if the format doesn't match
  }
}

function formatTimeComponent (component) {
  return component < 10 ? `0${component}` : component
}

function formatMilliseconds (milliseconds) {
  let result

  if (milliseconds < 10) {
    result = `00${milliseconds}`
  } else if (milliseconds < 100) {
    result = `0${milliseconds}`
  } else {
    result = milliseconds
  }

  return result
}
