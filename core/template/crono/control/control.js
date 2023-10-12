const controlButton = document.getElementById('controlButton')
const resetButton = document.getElementById('resetButton')
const addContainer = document.getElementById('buttonsaddtime')
const subContainer = document.getElementById('buttonssubtime')
const formatSelector = document.getElementById('formatSelector')
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
const languageSelector = document.getElementById('language-selector')
const switchTheme = document.getElementById('switch-theme')
// const test = document.getElementById('test')
const socket = new WebSocket('ws://localhost:3000')

const classElement = window.location.href.split('/')[3]
titlePage.textContent = classElement + ' - Control'
let translateElements

let checkHexColor

socket.addEventListener('open', (event) => {
  console.log('WebSocket Connection Opened')

  // Request variable data from the WebSocket server
  socket.send(JSON.stringify({ action: 'getVariables', classElement }))
})

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)

  if (message.action === 'reload') {
    window.location.reload()
  }

  if (message.fonts) {
    // If the message contains the list of fonts
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

      // Configuration and translates
      switchTheme.checked = message.config.themeDark
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

      controlButton.textContent = translateElements.timer.buttons.start
      resetButton.textContent = translateElements.timer.buttons.reset

      if (elementVariables && typeof elementVariables === 'object') {
        checkHexColor = elementVariables.colorText

        formatSelector.innerHTML = ''
        message.formats[classElement.replace(/\d/g, '')].forEach((format) => {
          const option = document.createElement('option')
          option.value = format
          option.textContent = format
          formatSelector.appendChild(option)
        })

        // Perform necessary actions with the variables here
        formatSelector.value = elementVariables.formatTime
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
        formatSelector.value = message[classElement].formatTime
        fontSelect.value = message[classElement].font
        fontSize.value = message[classElement].size
        colorPicker.value = message[classElement].colorText
        colorHex.value = message[classElement].colorText
      }
      formatAlign(message[classElement].align)
      textFormat(message[classElement])
      updateControlButton(message[classElement].status)
      formatSelector.value = message[classElement].formatTime
    }
  } else {
    window.location.reload()
  }
})

socket.addEventListener('close', (event) => {
  console.log('WebSocket Connection Closed')
})

switchTheme.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'themeChange', themeDark: switchTheme.checked }))
})

languageSelector.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'langChange', lang: languageSelector.value }))
})

controlButton.addEventListener('click', () => {
  if (controlButton.textContent === translateElements.timer.buttons.start) {
    socket.send(JSON.stringify({ action: 'startTimer', classElement }))
  } else {
    socket.send(JSON.stringify({ action: 'pauseCrono', classElement }))
  }
})

resetButton.addEventListener('click', () => {
  socket.send(JSON.stringify({ action: 'resetCrono', classElement }))
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
      socket.send(JSON.stringify({ action: 'editTime', time: `+${data[1]}`, classElement }))
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
      socket.send(JSON.stringify({ action: 'editTime', time: `-${data[1]}`, classElement }))
    }
  }
})

formatSelector.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'changeFormat', format: formatSelector.value, classElement }))
})

fontSelect.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'changeFont', font: fontSelect.value, classElement }))
})

fontSize.addEventListener('change', () => {
  const maxSize = parseFloat(fontSize.getAttribute('max'))
  let newSize = parseFloat(fontSize.value)

  if (newSize > maxSize) {
    newSize = maxSize
    fontSize.value = maxSize
  }

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
  socket.send(JSON.stringify({ action: 'changeColor', color: checkHexColor, classElement }))
  colorHex.value = checkHexColor
})

colorHex.addEventListener('change', () => {
  const hexColor = colorHex.value.trim()
  const hexRegex = /^#([0-9A-Fa-f]{6})$/

  if (hexRegex.test(hexColor)) {
    checkHexColor = hexColor.toUpperCase()
    socket.send(JSON.stringify({ action: 'changeColor', color: checkHexColor, classElement }))
    colorPicker.value = checkHexColor
    colorHex.value = checkHexColor
  } else {
    colorHex.value = checkHexColor
  }
})

// Function to update the font selector
function updateFontSelector (fonts) {
  fontSelect.innerHTML = ''

  fonts.forEach((font) => {
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

  return Math.max(...widths) + 'px'
}

function getMaxSizeWidth () {
  const maxvalue = fontSize.getAttribute('max')
  return maxvalue.length * 20 + 'px'
}

function formatAlign (align) {
  const buttons = [
    { button: alignLeftButton, align: 'left' },
    { button: alignCenterButton, align: 'center' },
    { button: alignRightButton, align: 'right' }
  ]

  buttons.forEach((btn) => {
    btn.button.style.backgroundColor = '#ccc'
    btn.button.style.color = '#333'
    btn.button.style.border = '2px solid #ccc'
  })

  const selectedButton = buttons.find((btn) => btn.align === align)
  if (selectedButton) {
    selectedButton.button.style.backgroundColor = '#777'
    selectedButton.button.style.color = 'white'
    selectedButton.button.style.border = '2px solid #777'
  }
}

function textFormat (message) {
  const buttons = [
    { button: boldButton, format: message.bold },
    { button: italicButton, format: message.italic },
    { button: underlineButton, format: message.underline }
  ]

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
