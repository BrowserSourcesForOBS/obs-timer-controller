// Elements
const timeElement = document.getElementById('time')
const containers = document.querySelectorAll('.container')
const titlePage = document.getElementById('titlePage')
// const test = document.getElementById('test');
const socket = new WebSocket('ws://localhost:3000')

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
    document.documentElement.lang = message.config.lang
  }

  if (message[classElement].timezone !== undefined) {
    if (formatTimeVar !== message[classElement].formatTime && intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }

    formatTimeVar = message[classElement].formatTime

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

    if (!intervalId) {
      intervalId = setInterval(() => {
        updateTimeDisplay(formatTimeVar, new Date().toLocaleString('en-CA', { timeZone: message[classElement].timezone, hour12: false }))
      }, 1) // Update every 1 millisecond
    }
  }
})

socket.addEventListener('close', (event) => {
  console.log('WebSocket Connection Closed')
})

function updateTimeDisplay (format, datetime) {
  const formattedTime = formatTime(format, datetime)
  timeElement.textContent = formattedTime
}

function formatTime (format, datetime) {
  const dateTimeComponents = datetime.split(/[\s-,:]/).filter(element => element !== '')

  const day = dateTimeComponents[2] // Get the day (1-31)
  const month = dateTimeComponents[1] // Get the month (1-12)
  const year = dateTimeComponents[0] // Get the year (e.g., 2023)
  const hours = dateTimeComponents[3] // Get the hour (0-23)
  const minutes = dateTimeComponents[4] // Get the minutes (0-59)
  const seconds = dateTimeComponents[5] // Get the seconds (0-59)

  switch (format) {
    case 'DD/MM/YYYY hh:mm:ss':
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
    case 'DD/MM/YYYY hh:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`
    case 'DD/MM/YY hh:mm:ss':
      return `${day}/${month}/${year.slice(-2)} ${hours}:${minutes}:${seconds}`
    case 'DD/MM/YY hh:mm':
      return `${day}/${month}/${year.slice(-2)} ${hours}:${minutes}`
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'DD/MM/YY':
      return `${day}/${month}/${year.slice(-2)}`
    case 'hh:mm:ss':
      return `${hours}:${minutes}:${seconds}`
    case 'hh:mm':
      return `${hours}:${minutes}`
    default:
      return '' // Return an empty string if the format doesn't match
  }
}
