// const addCronoButton = document.getElementById('add-crono')
const buttonContainer = document.getElementById('button-container')
const buttonCronoContainer = document.getElementById('button-container-crono')
const buttonCdownContainer = document.getElementById('button-container-cdown')
const buttonCdowntimeContainer = document.getElementById('button-container-cdowntime')
const buttonTimeContainer = document.getElementById('button-container-time')
const buttonClose = document.getElementById('stop-code')
const buttonWiki = document.getElementById('button-wiki')
const languageSelector = document.getElementById('language-selector')
const switchTheme = document.getElementById('switch-theme')
const titleCrono = document.getElementById('crono-title')
const titleCdown = document.getElementById('cdown-title')
const titleCdowntime = document.getElementById('cdowntime-title')
const titleTwitchExt = document.getElementById('twitchext-title')
const titleTime = document.getElementById('time-title')
// const test = document.getElementById('test')
const socket = new WebSocket('ws://localhost:3000')

let translateElements

socket.addEventListener('open', (event) => {
  console.log('WebSocket Connection Opened')

  socket.send(JSON.stringify({ action: 'getVariables', classElement: 'home' }))
})

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)

  if (message.action === 'reload') {
    window.location.reload()
  } else if (message.action === 'sendVariables' && message.classElement === 'home') {
    // If the message contains variable data
    const elementVariables = message.variables
    translateElements = message.translateElements

    // Configuration and translation
    switchTheme.checked = message.config.themedark
    buttonClose.title = translateElements.home.close
    buttonWiki.title = translateElements.home.wiki
    if (message.config.themedark) {
      document.body.classList.remove('light-theme')
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
      document.body.classList.add('light-theme')
    }

    languageSelector.innerHTML = ''
    Object.keys(message.formats.langs).forEach((format) => {
      const option = document.createElement('option')
      option.value = format
      option.textContent = message.formats.langs[format]
      languageSelector.appendChild(option)
    })
    languageSelector.value = Object.keys(message.formats.langs).includes(message.config.lang)
      ? message.config.lang
      : 'en'
    document.documentElement.lang = Object.keys(message.formats.langs).includes(message.config.lang)
      ? message.config.lang
      : 'en'

    titleCrono.textContent = translateElements.home.cronoTitle
    titleCdown.textContent = translateElements.home.cdownTitle
    titleCdowntime.textContent = translateElements.home.cdowntimeTitle
    titleTwitchExt.textContent = translateElements.home.twitchextTitle
    titleTime.textContent = translateElements.home.timeTitle

    if (elementVariables && typeof elementVariables === 'object') {
      // console.log('Variables loaded from the server.')
      // Perform necessary actions with the variables here
      let keys = Object.keys(message.variables)
      // keys = keys.filter((i) => i.startsWith('crono'))
      keys = keys.sort(function (a, b) {
        if (a < b) { return 1 } // If in ascending order, change -1
        if (a > b) { return -1 } // If in ascending order, change 1
        return 0
      })
      loadButtons(keys)
    }
  }
})

socket.addEventListener('close', (event) => {
  console.log('WebSocket Connection Closed')
})

window.addEventListener('unload', (event) => {
  socket.send(JSON.stringify({ action: 'stop-code' }))
})

buttonClose.addEventListener('click', () => {
  // Closes the current window or tab
  window.close()
})

switchTheme.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'themeChange', themedark: switchTheme.checked }))
})

languageSelector.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'langChange', lang: languageSelector.value }))
})

// Add an event listener to the main container
buttonContainer.addEventListener('click', (event) => {
  const target = event.target

  // Find the closest button to the clicked element (including icons and text)
  const button = target.closest('button')

  if (button) {
    // A button was clicked
    const data = button.id.split('-')

    if (button.id.startsWith('add-')) {
      socket.send(JSON.stringify({ action: 'createData', classType: data[1] }))
      window.location.reload()
    } else if (data[1] === 'viewButton') {
      window.open(`/${data[0]}/view`, '_blank', 'width=800,height=600')
    } else if (data[1] === 'controlButton') {
      window.open(`/${data[0]}/control`, '_blank', 'width=800,height=600')
    } else if (data[1] === 'copyButton') {
      // Get the text to copy from the "data-copy-text" attribute
      const copyText = `http://localhost:3000/${data[0]}/view`

      if (copyText) {
        copyTextToClipboard(copyText)

        // Display a notification message
        showNotification(translateElements.home.notycopycrono, button)
      }
    } else if (data[1] === 'removeButton') {
      socket.send(JSON.stringify({ action: 'removeData', remove: data[0] }))
      window.location.reload()
    }
  }
})

function createIconButton (iconClass, buttonText) {
  const button = document.createElement('button')
  const icon = document.createElement('i')
  button.className = 'button'
  icon.className = iconClass
  if (buttonText) {
    icon.style.marginRight = '10px'
    button.appendChild(icon)
    const textSpan = document.createElement('span')
    textSpan.textContent = buttonText
    button.appendChild(textSpan)
  } else {
    button.appendChild(icon)
  }
  return button
}

function loadButtons (list) {
  list.forEach(element => {
    const blockSpan = document.createElement('div')
    blockSpan.className = 'button-span'
    blockSpan.id = element + '-spanBlock'

    const title = document.createElement('span')
    title.textContent = element
    title.className = 'subtitle'
    blockSpan.appendChild(title)

    blockSpan.appendChild(document.createElement('br'))
    blockSpan.appendChild(document.createElement('br'))

    if (element.startsWith('crono') || element.startsWith('cdown') || element.startsWith('time')) {
      const viewButton = createIconButton('fas fa-eye')
      viewButton.id = element + '-viewButton'
      blockSpan.appendChild(viewButton)

      const copyButton = createIconButton('fas fa-copy', 'OBS')
      copyButton.className = 'button-copy'
      copyButton.id = element + '-copyButton'
      blockSpan.appendChild(copyButton)

      const controlButton = createIconButton('fas fa-gear')
      controlButton.id = element + '-controlButton'
      blockSpan.appendChild(controlButton)
    }

    const removeButton = createIconButton('fas fa-trash')
    removeButton.className = 'button-remove'
    removeButton.id = element + '-removeButton'
    blockSpan.appendChild(removeButton)

    if (element.startsWith('crono')) {
      buttonCronoContainer.insertBefore(blockSpan, buttonCronoContainer.firstChild)
    } else if (element.startsWith('cdowntime')) {
      buttonCdowntimeContainer.insertBefore(blockSpan, buttonCdowntimeContainer.firstChild)
    } else if (element.startsWith('cdown')) {
      buttonCdownContainer.insertBefore(blockSpan, buttonCdownContainer.firstChild)
    } else if (element.startsWith('time')) {
      buttonTimeContainer.insertBefore(blockSpan, buttonTimeContainer.firstChild)
    }
  })
}

function copyTextToClipboard (text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

function showNotification (message, button) {
  const blockSpan = button.closest('div') // Find the closest span block
  const notification = document.createElement('div') // Create a div element for the notification
  notification.textContent = message
  notification.classList.add('notification')

  // Set the notification ID with a unique value
  notification.id = 'notification-' + button.id
  // Add the notification to the span block
  blockSpan.appendChild(notification)
  setTimeout(() => {
    // Remove the notification after 2 seconds (adjust the time to your preference)
    notification.remove()
  }, 2000)
}
