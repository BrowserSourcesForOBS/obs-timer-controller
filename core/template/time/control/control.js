// Elements
const timezoneSelector = document.getElementById('timezone')
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
const langSelector = document.getElementById('language-selector')
const switchTheme = document.getElementById('switch-theme')
// const test = document.getElementById('test');
const socket = new WebSocket('ws://localhost:3000')

const classElement = window.location.href.split('/')[3]
titlePage.textContent = classElement + ' - Control'
// let translateElements;

let checkHexColor

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

  if (message.fonts) {
    // If the message contains font list
    updateFontSelector(message.fonts)
  }

  if (fontSelect.innerHTML !== '') {
    // Call the function to get the maximum font size width
    const maxWidth = getMaxSizeWidth()

    // Set the calculated width as the CSS style for font size selector
    fontSize.style.width = maxWidth

    if (message.action === 'sendVariables' && message.classElement === classElement) {
      // If the message contains variable data
      const elementVariables = message.variables
      // translateElements = message.translateElements;

      // Configuration and translations
      switchTheme.checked = message.config.themedark
      if (message.config.themedark) {
        document.body.classList.remove('light-theme')
        document.body.classList.add('dark-theme')
      } else {
        document.body.classList.remove('dark-theme')
        document.body.classList.add('light-theme')
      }

      langSelector.innerHTML = ''
      Object.keys(message.formats.langs).forEach((format) => {
        const option = document.createElement('option')
        option.value = format
        option.textContent = message.formats.langs[format]
        langSelector.appendChild(option)
      })
      langSelector.value = message.config.lang
      document.documentElement.lang = message.config.lang

      if (elementVariables && typeof elementVariables === 'object') {
        checkHexColor = elementVariables.colorText

        // console.log('Variables loaded from the server.');

        timezoneSelector.innerHTML = ''
        message.formats.timezones.forEach((format) => {
          const option = document.createElement('option')
          option.value = format
          option.textContent = format
          timezoneSelector.appendChild(option)
        })

        formatSelector.innerHTML = ''
        message.formats[classElement.replace(/\d/g, '')].forEach((format) => {
          const option = document.createElement('option')
          option.value = format
          option.textContent = format
          formatSelector.appendChild(option)
        })

        // Perform necessary actions with variables here
        timezoneSelector.value = elementVariables.timezone
        formatSelector.value = elementVariables.formatTime
        fontSelect.value = elementVariables.font
        fontSize.value = elementVariables.size
        textFormat(elementVariables)
        formatAlign(elementVariables.align) // Set selected font
        colorPicker.value = elementVariables.colorText
        colorHex.value = elementVariables.colorText
      } else {
        console.log('The server did not return valid data.')
      }
    } else {
      formatAlign(message[classElement].align) // Set selected font
      textFormat(message[classElement])
      // Update control button and other elements based on the received message
      formatSelector.value = message[classElement].formatTime
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

langSelector.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'langChange', lang: langSelector.value }))
})

timezoneSelector.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'changeTimezoneTime', timezone: timezoneSelector.value, classElement }))
  window.location.reload()
})

formatSelector.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'changeFormatTime', format: formatSelector.value, classElement }))
})

fontSelect.addEventListener('change', () => {
  socket.send(JSON.stringify({ action: 'changeFontTime', font: fontSelect.value, classElement }))
})

fontSize.addEventListener('change', () => {
  // Get the maximum value allowed from the 'max' attribute
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
  socket.send(JSON.stringify({ action: 'changeSizeTime', size: newSize, classElement }))
})

boldButton.addEventListener('click', () => {
  socket.send(JSON.stringify({ action: 'textFormatTime', format: 'bold', classElement }))
})

italicButton.addEventListener('click', () => {
  socket.send(JSON.stringify({ action: 'textFormatTime', format: 'italic', classElement }))
})

underlineButton.addEventListener('click', () => {
  socket.send(JSON.stringify({ action: 'textFormatTime', format: 'underline', classElement }))
})

alignLeftButton.addEventListener('click', () => {
  socket.send(JSON.stringify({ action: 'alignTime', align: 'left', classElement }))
})

alignCenterButton.addEventListener('click', () => {
  socket.send(JSON.stringify({ action: 'alignTime', align: 'center', classElement }))
})

alignRightButton.addEventListener('click', () => {
  socket.send(JSON.stringify({ action: 'alignTime', align: 'right', classElement }))
})

colorPicker.addEventListener('change', () => {
  checkHexColor = colorPicker.value.toUpperCase()
  // If the hexadecimal code is valid, send the color to the server
  socket.send(JSON.stringify({ action: 'changeColorTime', color: colorPicker.value.toUpperCase(), classElement }))
  colorHex.value = checkHexColor
})

colorHex.addEventListener('change', () => {
  const hexColor = colorHex.value.trim() // Remove whitespace around

  // Regular expression to check the correct hexadecimal code format
  const hexRegex = /^#([0-9A-Fa-f]{6})$/

  if (hexRegex.test(hexColor)) {
    checkHexColor = hexColor.toUpperCase()
    // If the hexadecimal code is valid, send the color to the server
    socket.send(JSON.stringify({ action: 'changeColorTime', color: checkHexColor, classElement }))
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

function getMaxSizeWidth () {
  const maxvalue = fontSize.getAttribute('max') // Get the maximum value from the 'max' attribute

  // Take the maximum of the two widths
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

  // Set the format of all buttons
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
