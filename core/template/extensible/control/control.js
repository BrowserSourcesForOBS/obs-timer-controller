const controlButton = document.getElementById('controlButton')
const resetButton = document.getElementById('resetButton')
const timeText = document.getElementById('timeText')
const addContainer = document.getElementById('buttonsaddtime')
const subContainer = document.getElementById('buttonssubtime')
const checkboxStopAdd = document.getElementById('checkboxStopAdd')
const checkboxLabelStopAdd = document.getElementById('checkboxLabelStopAdd')
const checkboxPauseAdd = document.getElementById('checkboxPauseAdd')
const checkboxLabelPauseAdd = document.getElementById('checkboxLabelPauseAdd')
const textMsg = document.getElementById('text-endmsg')
const formatSelectorCrono = document.getElementById('formatSelectorCrono')
const formatSelectorCdown = document.getElementById('formatSelectorCdown')
const fontSelect = document.getElementById('fontSelect') // Font selector
const fontSize = document.getElementById('fontSize')
const boldButton = document.getElementById('boldButton')
const italicButton = document.getElementById('italicButton')
const underlineButton = document.getElementById('underlineButton')
const alignLeftButton = document.getElementById('alignLeft')
const alignCenterButton = document.getElementById('alignCenter')
const alignRightButton = document.getElementById('alignRight')
const colorPicker = document.getElementById('colorPicker')
const colorHex = document.getElementById('colorHex')
const titlePage = document.getElementById('titlePage')
const selectorLang = document.getElementById('language-selector')
const switchTheme = document.getElementById('switch-theme')
// const test = document.getElementById('test');
const socket = new WebSocket('ws://localhost:3000')

const classElement = window.location.href.split('/')[3]
titlePage.textContent = classElement + ' - Control'
let translateElements

let checkTextTime
let checkHexColor

socket.addEventListener('open', (event) => {
  console.log('WebSocket Connection Opened')

  // Ask the WebSocket server to send variable data
  socket.send(JSON.stringify({ action: 'getVariables', classElement }))
})

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)

  if (message.action === 'reload') {
    window.location.reload()
  }

  if (message.fonts) {
    // If the message contains a list of fonts
    updateFontSelector(message.fonts)
  }
  if (fontSelect.innerHTML !== '') {
    // Call the function to get the maximum font size width
    const maxWidth = getMaxSizeWidth()

    // Set the calculated width as the CSS style for the font size selector
    fontSize.style.width = maxWidth

    if (message.action === 'sendVariables' && message.classElement === classElement) {
      // If the message contains variable data
      const elementVariables = message.variables
      translateElements = message.translateElements

      // Config and translates
      switchTheme.checked = message.config.themedark
      if (message.config.themedark) {
        document.body.classList.remove('light-theme')
        document.body.classList.add('dark-theme')
      } else {
        document.body.classList.remove('dark-theme')
        document.body.classList.add('light-theme')
      }

      selectorLang.innerHTML = ''
      Object.keys(message.formats.langs).forEach((format) => {
        const option = document.createElement('option')
        option.value = format
        option.textContent = message.formats.langs[format]
        selectorLang.appendChild(option)
      })
      selectorLang.value = Object.keys(message.formats.langs).includes(message.config.lang)
        ? message.config.lang
        : 'en'
      document.documentElement.lang = Object.keys(message.formats.langs).includes(message.config.lang)
        ? message.config.lang
        : 'en'

      controlButton.textContent = translateElements.timer.buttons.start
      resetButton.textContent = translateElements.timer.buttons.reset
      checkboxLabelStopAdd.textContent = translateElements.timer.enableStopAdd
      checkboxLabelPauseAdd.textContent = translateElements.timer.enablePauseAdd

      if (elementVariables && typeof elementVariables === 'object') {
        checkTextTime = MsToText(elementVariables.textMilliseconds)
        checkHexColor = elementVariables.colorText

        // Format selector options
        formatSelectorCrono.innerHTML = ''
        message.formats[classElement.replace(/\d/g, '')].forEach((format) => {
          const option = document.createElement('option')
          option.value = format
          option.textContent = format
          formatSelectorCrono.appendChild(option)
        })

        formatSelectorCdown.innerHTML = ''
        message.formats[classElement.replace(/\d/g, '')].forEach((format) => {
          const option = document.createElement('option')
          option.value = format
          option.textContent = format
          formatSelectorCdown.appendChild(option)
        })

        // Perform necessary actions with the variables here
        textMsg.textContent = elementVariables.msgEnd
        if (elementVariables.msgEnd === '') {
          textMsg.textContent = translateElements.timer.phMsgEnd
          textMsg.style.color = '#555'
        } else { textMsg.style.color = '#000' }
        timeText.value = MsToText(elementVariables.textMilliseconds)
        // checkboxStopAdd.checked = elementVariables.enableStopAdd
        // checkboxPauseAdd.checked = elementVariables.enablePauseAdd
        formatSelectorCrono.value = elementVariables.formatTimeCrono
        formatSelectorCdown.value = elementVariables.formatTimeCdown
        fontSelect.value = elementVariables.font
        fontSize.value = elementVariables.size
        textFormat(elementVariables)
        formatAlign(elementVariables.align)
        colorPicker.value = elementVariables.colorText
        colorHex.value = elementVariables.colorText
        if (translateElements) {
          updateControlButton(elementVariables.status)
        }
      } else {
        console.log('The server did not return valid data.')
      }
    } else {
      if (message[classElement].status !== 'started') {
        textMsg.textContent = message[classElement].msgEnd
        if (message[classElement].msgEnd === '') {
          textMsg.textContent = translateElements.timer.phMsgEnd
          textMsg.style.color = '#555'
        } else { textMsg.style.color = '#000' }
        timeText.value = MsToText(message[classElement].textMilliseconds)
        checkboxStopAdd.checked = message[classElement].enableStopAdd
        checkboxPauseAdd.checked = message[classElement].enablePauseAdd
        formatSelectorCrono.value = message[classElement].formatTimeCrono
        formatSelectorCdown.value = message[classElement].formatTimeCdown
        fontSelect.value = message[classElement].font
        fontSize.value = message[classElement].size
        colorPicker.value = message[classElement].colorText
        colorHex.value = message[classElement].colorText
      }
      formatAlign(message[classElement].align)
      textFormat(message[classElement])
      // Update the control button and other elements based on the received message
      updateControlButton(message[classElement].status)
      formatSelectorCrono.value = message[classElement].formatTimeCrono
      formatSelectorCdown.value = message[classElement].formatTimeCdown
    }
  } else {
    window.location.reload()
  }
  twemoji.parse(document.body)
})

socket.addEventListener('close', (event) => {
  console.log('WebSocket Connection Closed')
})

switchTheme.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'themeChange', themedark: switchTheme.checked }))
})

selectorLang.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'langChange', lang: selectorLang.value }))
})

controlButton.addEventListener('click', () => {
  if (controlButton.textContent === translateElements.timer.buttons.start) {
    socket.send(JSON.stringify({ action: 'startExtensible', classElement }))
  } else {
    socket.send(JSON.stringify({ action: 'pauseExtensible', classElement }))
  }
})

resetButton.addEventListener('click', () => {
  socket.send(JSON.stringify({ action: 'resetExtensible', classElement }))
})

timeText.addEventListener('change', () => {
  const textTime = timeText.value.trim()

  // Regular expression to check the correct time format
  const timeRegex = /^(\d+):([0-5]?\d):([0-5]?\d)$/

  if (timeRegex.test(textTime)) {
    checkTextTime = textTime
    // If the time format is valid, send the time to the server
    socket.send(JSON.stringify({ action: 'changeTimeExtensible', time: TextToMs(checkTextTime), classElement }))
    timeText.value = MsToText(TextToMs(checkTextTime))
  } else {
    timeText.value = checkTextTime
  }
})

// Add an event listener to the main container
addContainer.addEventListener('click', (event) => {
  const target = event.target

  // Find the nearest button to the clicked element (including icons and text)
  const button = target.closest('button')

  if (button) {
    // A button was clicked
    const data = button.id.split('-')

    if (button.id.startsWith('addtime-')) {
      socket.send(JSON.stringify({ action: 'editTimeExtensible', time: `+${data[1]}`, classElement }))
    }
  }
})

subContainer.addEventListener('click', (event) => {
  const target = event.target

  // Find the nearest button to the clicked element (including icons and text)
  const button = target.closest('button')

  if (button) {
    // A button was clicked
    const data = button.id.split('-')

    if (button.id.startsWith('subtime-')) {
      socket.send(JSON.stringify({ action: 'editTimeExtensible', time: `-${data[1]}`, classElement }))
    }
  }
})

checkboxStopAdd.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'checkboxStopAdd', value: checkboxStopAdd.checked, classElement }))
})

checkboxPauseAdd.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'checkboxPauseAdd', value: checkboxPauseAdd.checked, classElement }))
})

textMsg.addEventListener('focus', () => {
  if (textMsg.textContent === translateElements.timer.phMsgEnd) {
    textMsg.textContent = ''
    textMsg.style.color = '#000'
  }
})

textMsg.addEventListener('blur', () => {
  socket.send(JSON.stringify({ action: 'editMsgExtensible', msg: textMsg.textContent, classElement }))
  if (textMsg.textContent === '') {
    textMsg.textContent = translateElements.timer.phMsgEnd
    textMsg.style.color = '#555'
  } else { textMsg.style.color = '#000' }
})

formatSelectorCrono.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'changeFormatExtCrono', format: formatSelectorCrono.value, classElement }))
})

formatSelectorCdown.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'changeFormatExtCdown', format: formatSelectorCdown.value, classElement }))
})

fontSelect.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'changeFont', font: fontSelect.value, classElement }))
})

fontSize.addEventListener('change', () => {
  // Get the maximum allowed value from the 'max' attribute
  const maxSize = parseFloat(fontSize.getAttribute('max'))

  // Get the manually entered value as a number
  let newSize = parseFloat(fontSize.value)

  // Check if the entered value is greater than the maximum value
  if (newSize > maxSize) {
    // If it's greater, set the value to the maximum allowed
    newSize = maxSize
    fontSize.value = maxSize
  }

  // Send the new size to the server
  socket.send(JSON.stringify({ action: 'changeSize', size: newSize, classElement }))
})

boldButton.addEventListener('click', () => {
  socket.send(JSON.stringify({ action: 'textFormat', format: 'bold', classElement }))
})

italicButton.addEventListener('click', () => {
  socket.send(JSON.stringify({ action: 'textFormat', format: 'italic', classElement }))
})

underlineButton.addEventListener('click', () => {
  socket.send(JSON.stringify({ action: 'textFormat', format: 'underline', classElement }))
})

alignLeftButton.addEventListener('click', () => {
  socket.send(JSON.stringify({ action: 'align', align: 'left', classElement }))
})

alignCenterButton.addEventListener('click', () => {
  socket.send(JSON.stringify({ action: 'align', align: 'center', classElement }))
})

alignRightButton.addEventListener('click', () => {
  socket.send(JSON.stringify({ action: 'align', align: 'right', classElement }))
})

colorPicker.addEventListener('change', () => {
  checkHexColor = colorPicker.value.toUpperCase()
  // If the hexadecimal code is valid, send the color to the server
  socket.send(JSON.stringify({ action: 'changeColor', color: colorPicker.value.toUpperCase(), classElement }))
  colorHex.value = checkHexColor
})

colorHex.addEventListener('change', () => {
  const hexColor = colorHex.value.trim()

  // Regular expression to check the correct hexadecimal color code format
  const hexRegex = /^#([0-9A-Fa-f]{6})$/

  if (hexRegex.test(hexColor)) {
    checkHexColor = hexColor.toUpperCase()
    // If the hexadecimal code is valid, send the color to the server
    socket.send(JSON.stringify({ action: 'changeColorExtensible', color: checkHexColor, classElement }))
    colorPicker.value = checkHexColor
    colorHex.value = checkHexColor
  } else {
    colorHex.value = checkHexColor
  }
})

// Function to update the font selector
function updateFontSelector (fonts) {
  // Clear the font selector
  fontSelect.innerHTML = ''

  // Add font options to the selector without quotes
  fonts.forEach((font) => {
    // Remove double quotes at the beginning and end of the font name
    font = font.replace(/^"(.*)"$/, '$1')

    const option = document.createElement('option')
    option.value = font
    option.textContent = font
    fontSelect.appendChild(option)
  })
}

function updateControlButton (status) {
  const maxWidth = getMaxButtonWidth()
  controlButton.style.width = maxWidth

  if (status === 'started') {
    controlButton.textContent = translateElements.timer.buttons.pause
  } else {
    controlButton.textContent = translateElements.timer.buttons.start
  }
}

function getMaxButtonWidth () {
  const widths = []

  Object.keys(translateElements.timer.buttons).forEach((value) => {
    controlButton.textContent = translateElements.timer.buttons[value]
    widths.push(parseFloat(window.getComputedStyle(controlButton).getPropertyValue('width')))
  })
  // Get the maximum of the two widths
  return Math.max(...widths) + 'px'
}

function getMaxSizeWidth () {
  const maxvalue = fontSize.getAttribute('max') // Get the maximum value from the 'max' attribute

  // Get the maximum of the two widths
  return maxvalue.length * 20 + 'px'
}

function formatAlign (align) {
  // List of buttons and their corresponding alignments
  const buttons = [
    { button: alignLeftButton, align: 'left' },
    { button: alignCenterButton, align: 'center' },
    { button: alignRightButton, align: 'right' }
  ]

  // Reset the format of all buttons
  buttons.forEach((btn) => {
    btn.button.style.backgroundColor = '#ccc'
    btn.button.style.color = '#333'
    btn.button.style.border = '2px solid #ccc'
  })

  // Find and highlight the selected button
  const selectedButton = buttons.find((btn) => btn.align === align)
  if (selectedButton) {
    selectedButton.button.style.backgroundColor = '#777'
    selectedButton.button.style.color = 'white'
    selectedButton.button.style.border = '2px solid #777'
  }
}

function textFormat (message) {
  // List of buttons and their corresponding formats
  const buttons = [
    { button: boldButton, format: message.bold },
    { button: italicButton, format: message.italic },
    { button: underlineButton, format: message.underline }
  ]

  // Set the format for all buttons
  buttons.forEach((btn) => {
    if (btn.format) {
      btn.button.style.backgroundColor = '#777'
      btn.button.style.color = 'white'
      btn.button.style.border = '2px solid #777'
    } else {
      btn.button.style.backgroundColor = '#ccc'
      btn.button.style.color = '#333'
      btn.button.style.border = '2px solid #ccc'
    }
  })
}

function TextToMs (text) {
  const timeComponents = text.split(':')

  const hours = parseInt(timeComponents[0], 10)
  const minutes = parseInt(timeComponents[1], 10)
  const seconds = parseInt(timeComponents[2], 10)

  return (hours * 3600 + minutes * 60 + seconds) * 1000
}

function MsToText (ms) {
  const total = ms / 1000
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  const formattedHours = String(hours).padStart(2, '0')
  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(seconds).padStart(2, '0')

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
}
