// const addCronoButton = document.getElementById('add-crono')
const buttonContainer = document.getElementById('button-container')
const buttonCronoContainer = document.getElementById('button-container-crono')
const buttonCdownContainer = document.getElementById('button-container-cdown')
const buttonCdowntimeContainer = document.getElementById('button-container-cdowntime')
const buttonExtensibleContainer = document.getElementById('button-container-extensible')
const buttonTimeContainer = document.getElementById('button-container-time')
const buttonClose = document.getElementById('stopCode')
const buttonWiki = document.getElementById('button-wiki')
const leftButtons = document.getElementById('left-button')
const textVersion = document.getElementById('span-version')
const languageSelector = document.getElementById('language-selector')
const switchTheme = document.getElementById('switch-theme')
const titleCrono = document.getElementById('crono-title')
const titleCdown = document.getElementById('cdown-title')
const titleCdowntime = document.getElementById('cdowntime-title')
const titleExtensible = document.getElementById('extensible-title')
const titleTime = document.getElementById('time-title')
// const test = document.getElementById('test')
const socket = new WebSocket(`ws://localhost:${window.location.port}`)

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
    switchTheme.checked = message.config.themeDark
    buttonClose.title = translateElements.home.close || 'n/a'
    textVersion.textContent = message.config.version
    if (message.config.version !== 'Error' && message.config.versionRelease !== 'Error' && compareVersions(message.config.version, message.config.versionRelease) === 1) {
      const link = document.createElement('a')
      link.href = 'https://github.com/BrowserSourcesForOBS/obs-timer-controller/releases/latest'
      link.target = '_blank'
      link.id = 'link-newVersion'
      const button = document.createElement('button')
      button.className = 'button-versionRelease'
      button.title = translateElements.home.newVersionTitle || 'n/a'
      button.textContent = (translateElements.home.newVersion || 'n/a') + (message.config.versionRelease || 'n/a')
      link.appendChild(button)
      leftButtons.appendChild(link)
    }
    buttonWiki.title = translateElements.home.wiki || 'n/a'
    if (message.config.themeDark) {
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

    titleCrono.textContent = translateElements.home.cronoTitle || 'n/a'
    titleCdown.textContent = translateElements.home.cdownTitle || 'n/a'
    titleCdowntime.textContent = translateElements.home.cdowntimeTitle || 'n/a'
    titleExtensible.textContent = translateElements.home.extensibleTitle || 'n/a'
    titleTime.textContent = translateElements.home.timeTitle || 'n/a'

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
  socket.send(JSON.stringify({ action: 'stopCode' }))
})

buttonClose.addEventListener('click', () => {
  socket.send(JSON.stringify({ action: 'stopCode' }))
  // Closes the current window or tab
  window.close()
})

switchTheme.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'themeChange', themeDark: switchTheme.checked }))
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
    } else if (data[1] === 'viewButtonCrono') {
      window.open(`/${data[0]}/viewCrono`, '_blank', 'width=800,height=600')
    } else if (data[1] === 'viewButtonCdown') {
      window.open(`/${data[0]}/viewCdown`, '_blank', 'width=800,height=600')
    } else if (data[1] === 'copyButton') {
      // Get the text to copy from the "data-copy-text" attribute
      const copyText = `http://localhost:${window.location.port}/${data[0]}/view`

      if (copyText) {
        copyTextToClipboard(copyText)

        // Display a notification message
        showNotification(translateElements.home.notycopy || 'n/a', button)
      }
    } else if (data[1] === 'copyButtonCrono') {
      // Get the text to copy from the "data-copy-text" attribute
      const copyText = `http://localhost:${window.location.port}/${data[0]}/viewCrono`

      if (copyText) {
        copyTextToClipboard(copyText)

        // Display a notification message
        showNotification(translateElements.home.notycopy || 'n/a', button)
      }
    } else if (data[1] === 'copyButtonCdown') {
      // Get the text to copy from the "data-copy-text" attribute
      const copyText = `http://localhost:${window.location.port}/${data[0]}/viewCdown`

      if (copyText) {
        copyTextToClipboard(copyText)

        // Display a notification message
        showNotification(translateElements.home.notycopy || 'n/a', button)
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
    } else if (element.startsWith('extensible')) {
      const iconCrono = document.createElement('i')
      iconCrono.className = 'fas fa-clock'
      iconCrono.style.marginRight = '10px'
      iconCrono.style.color = '#494949'
      iconCrono.style.fontSize = '20px'
      blockSpan.appendChild(iconCrono)

      const viewButtonCrono = createIconButton('fas fa-eye')
      viewButtonCrono.id = element + '-viewButtonCrono'
      blockSpan.appendChild(viewButtonCrono)

      const copyButtonCrono = createIconButton('fas fa-copy', 'OBS')
      copyButtonCrono.className = 'button-copy'
      copyButtonCrono.id = element + '-copyButtonCrono'
      blockSpan.appendChild(copyButtonCrono)

      blockSpan.appendChild(document.createElement('br'))

      const iconCdown = document.createElement('i')
      iconCdown.className = 'fas fa-stopwatch'
      iconCdown.style.marginRight = '10px'
      iconCdown.style.color = '#494949'
      iconCdown.style.fontSize = '20px'
      blockSpan.appendChild(iconCdown)

      const viewButtonCdown = createIconButton('fas fa-eye')
      viewButtonCdown.id = element + '-viewButtonCdown'
      blockSpan.appendChild(viewButtonCdown)

      const copyButtonCdown = createIconButton('fas fa-copy', 'OBS')
      copyButtonCdown.className = 'button-copy'
      copyButtonCdown.id = element + '-copyButtonCdown'
      blockSpan.appendChild(copyButtonCdown)

      blockSpan.appendChild(document.createElement('br'))

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
    } else if (element.startsWith('extensible')) {
      buttonExtensibleContainer.insertBefore(blockSpan, buttonExtensibleContainer.firstChild)
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

function compareVersions (versionA, versionB) {
  const a = versionA.split('v')[1].split('.').map(Number)
  const b = versionB.split('v')[1].split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    if (a[i] < b[i]) return 1 // B es más moderna que A
    if (a[i] > b[i]) return -1 // B es más antigua que A
  }

  return 0 // Son la misma versión
}
