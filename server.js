const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const path = require('path')
const fs = require('fs-extra')
const open = require('openurl')

const argsv = process.argv.slice(2)

if (argsv[0] !== 'test') {
  // Obtén la ubicación del directorio donde se encuentra el ejecutable
  const executablePath = path.dirname(process.execPath)

  // Cambia el directorio de trabajo actual a la ubicación del ejecutable
  process.chdir(executablePath)
}

// The icons for the web page titles are obtained from:
// https://www.iconfinder.com/search?q=&designer=kmgdesignid&price=free

const {
  loadDataFromYAML,
  saveVariablesToYAML,
  createDataYAML,
  startTimer,
  pauseCrono,
  pauseCdown,
  pauseExtensible,
  resetCrono,
  resetCdown,
  stopCdown,
  stopExtensible,
  resetExtensible,
  sendVariableData,
  initConfig,
  saveConfig,
  editTimeTimer,
  editTimeCdowntime,
  getFonts
} = require('./functions')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// Variable to store the list of system fonts
const fontOptions = getFonts()

// Load variables from the YAML file at server startup
let GlobalVariables
GlobalVariables = loadDataFromYAML((argsv[0] === 'test') ? './core/db.yaml' : './resources/app/core/db.yaml')
try {
  Object.keys(GlobalVariables).forEach((key) => {
    if (GlobalVariables[key].status === 'started') {
      GlobalVariables[key].status = 'paused'
    }
  })
  saveVariablesToYAML(GlobalVariables)
} catch (error) {
  GlobalVariables = {}
}

let Config;
(async () => {
  Config = await initConfig()
  saveConfig(Config)
})()

// WebSocket connections handling
wss.on('connection', (ws) => {
  // Send the list of fonts to the client upon connection
  ws.send(JSON.stringify({ fonts: fontOptions }))

  ws.on('message', (message) => {
    const data = JSON.parse(message)

    GlobalVariables = loadDataFromYAML((argsv[0] === 'test') ? './core/db.yaml' : './resources/app/core/db.yaml')

    if (data.action === 'reloadPage') {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ action: 'reload' }))
        }
      })
    } else if (data.action === 'themeChange') {
      Config.themedark = data.themedark
      saveConfig(Config)
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ action: 'reload' }))
        }
      })
    } else if (data.action === 'langChange') {
      Config.lang = data.lang
      saveConfig(Config)
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ action: 'reload' }))
        }
      })
    } else if (data.action === 'startCrono' || data.action === 'startCdown' || data.action === 'startExtensible') {
      // Start the timer when receiving the "start" action
      startTimer(wss, GlobalVariables, data.classElement)
    } else if (data.action === 'pauseCrono') {
      // Pause the timer when receiving the "pause" action
      pauseCrono(wss, GlobalVariables, data.classElement)
    } else if (data.action === 'pauseCdown') {
      // Pause the countdown when receiving the "pause" action
      pauseCdown(wss, GlobalVariables, data.classElement)
    } else if (data.action === 'pauseExtensible') {
      // Pause the countdown when receiving the "pause" action
      pauseExtensible(wss, GlobalVariables, data.classElement)
    } else if (data.action === 'resetCrono') {
      // Reset the timer when receiving the "reset" action
      resetCrono(wss, GlobalVariables, data.classElement)
    } else if (data.action === 'resetCdown') {
      // Reset the countdown when receiving the "reset" action
      resetCdown(wss, GlobalVariables, data.classElement)
    } else if (data.action === 'resetExtensible') {
      // Reset the countdown when receiving the "reset" action
      resetExtensible(wss, GlobalVariables, data.classElement)
    } else if (data.action === 'stopCdown') {
      // Stop the countdown when receiving the "stop" action
      stopCdown(wss, GlobalVariables, data.classElement)
    } else if (data.action === 'stopExtensible') {
      // Stop the countdown when receiving the "stop" action
      stopExtensible(wss, GlobalVariables, data.classElement)
    } else if (data.action === 'changeTimeCdown' && data.time) {
      // Change the time format when receiving the "changeFormat" action
      GlobalVariables[data.classElement].textMilliseconds = data.time
      // Transmit the updated format to all WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(GlobalVariables))
        }
      })
      saveVariablesToYAML(GlobalVariables)
      if (GlobalVariables[data.classElement].status === 'ended') {
        resetCdown(wss, GlobalVariables, data.classElement)
      }
    } else if (data.action === 'changeTimeCdownTime' && data.time) {
      // Change the end time format when receiving the "changeFormat" action
      GlobalVariables[data.classElement].endDatetime = data.time
      // Transmit the updated format to all WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(GlobalVariables))
        }
      })
      saveVariablesToYAML(GlobalVariables)
    } else if (data.action === 'changeTimeExtensible' && data.time) {
      // Change the time format when receiving the "changeFormat" action
      GlobalVariables[data.classElement].textMilliseconds = data.time
      // Transmit the updated format to all WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(GlobalVariables))
        }
      })
      saveVariablesToYAML(GlobalVariables)
      if (GlobalVariables[data.classElement].status === 'ended') {
        resetExtensible(wss, GlobalVariables, data.classElement)
      }
    } else if (
      data.action === 'changeTimezoneCdownTime' ||
      data.action === 'changeTimezoneTime'
    ) {
      // Change the time format when receiving the "changeFormat" action
      GlobalVariables[data.classElement].timezone = data.timezone
      // Transmit the updated format to all WebSocket clients
      saveVariablesToYAML(GlobalVariables)
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ action: 'reload' }))
        }
      })
    } else if (data.action === 'editMsgCdown' ||
    data.action === 'editMsgCdownTime' ||
    data.action === 'editMsgExtensible') {
      GlobalVariables[data.classElement].msgEnd = data.msg
      // Transmit the updated format to all WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(GlobalVariables))
        }
      })
      saveVariablesToYAML(GlobalVariables)
    } else if (data.action === 'changeFormat' && data.format) {
      const classElement = data.classElement
      GlobalVariables[classElement].formatTime = data.format

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(GlobalVariables))
        }
      })

      saveVariablesToYAML(GlobalVariables)
    } else if (
      data.action === 'editTimeCrono' ||
    (data.action === 'editTimeCdown' && GlobalVariables[data.classElement].status === 'ended')
    ) {
      editTimeTimer(wss, GlobalVariables, data.time, data.classElement)
    } else if (data.action === 'editTimeCdownTime') {
      editTimeCdowntime(wss, GlobalVariables, data.time, data.classElement)
    } else if (data.action === 'editTimeExtensible' && (
      GlobalVariables[data.classElement].status === 'started' ||
      (GlobalVariables[data.classElement].status === 'paused' && GlobalVariables[data.classElement].enablePauseAdd) ||
      (GlobalVariables[data.classElement].status === 'stopped' && GlobalVariables[data.classElement].enableStopAdd))
    ) {
      editTimeTimer(wss, GlobalVariables, data.time, data.classElement)
    } else if (data.action === 'changeFont' && data.font) {
      // Change the font format when receiving the "changeFormatr"
      GlobalVariables[data.classElement].font = data.font

      // Transmit the updated format to all WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(GlobalVariables))
        }
      })
      saveVariablesToYAML(GlobalVariables)
    } else if (data.action === 'changeSize' && data.size) {
      // Change the font size when receiving the "changeFormat"
      GlobalVariables[data.classElement].size = data.size

      // Transmit the updated format to all WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(GlobalVariables))
        }
      })
      saveVariablesToYAML(GlobalVariables)
    } else if (data.action === 'textFormat') {
      // Change the text format when receiving the "changeFormat"
      switch (data.format) {
        case 'bold':
          GlobalVariables[data.classElement].bold = !GlobalVariables[data.classElement].bold
          break
        case 'italic':
          GlobalVariables[data.classElement].italic = !GlobalVariables[data.classElement].italic
          break
        case 'underline':
          GlobalVariables[data.classElement].underline = !GlobalVariables[data.classElement].underline
          break
      }
      // Transmit the updated format to all WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(GlobalVariables))
        }
      })
      saveVariablesToYAML(GlobalVariables)
    } else if (data.action === 'align') {
      // Change the text alignment when receiving the "changeFormat"
      GlobalVariables[data.classElement].align = data.align

      // Transmit the updated alignment to all WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(GlobalVariables))
        }
      })
      saveVariablesToYAML(GlobalVariables)
    } else if (data.action === 'changeColor') {
      // Change the text color when receiving the "changeFormat"
      GlobalVariables[data.classElement].colorText = data.color

      // Transmit the updated color to all WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(GlobalVariables))
        }
      })
      saveVariablesToYAML(GlobalVariables)
    } else if (data.action === 'getVariables' && data.classElement) {
      GlobalVariables = loadDataFromYAML((argsv[0] === 'test') ? './core/db.yaml' : './resources/app/core/db.yaml')
      // The client requests variable data
      sendVariableData(ws, GlobalVariables, Config, data.classElement)
    } else if (data.action === 'createData' && data.classType) {
      const page = createDataYAML(GlobalVariables, data.classType)
      fs.copy((argsv[0] === 'test') ? `./core/template/${data.classType}` : `./resources/app/core/template/${data.classType}`, (argsv[0] === 'test') ? `./core/${page}` : `./resources/app/core/${page}`)
        .then(() => {
          console.log('Folder copied successfully.')
        })
        .catch((err) => {
          console.error('Error copying the folder:', err)
        })
    } else if (data.action === 'removeData' && data.remove) {
      delete GlobalVariables[data.remove]
      fs.remove((argsv[0] === 'test') ? `./core/${data.remove}` : `./resources/app/core/${data.remove}`)
        .then(() => {
          // console.log(`Folder deleted successfully: ${folderToDelete}`);
        })
        .catch((error) => {
          console.error(`Error deleting the folder: ${error}`)
        })
      saveVariablesToYAML(GlobalVariables)
    } else if (data.action === 'stop-code') {
      // Stop the Node.js server
      process.exit()
    }
  })
  ws.send(JSON.stringify(GlobalVariables))
})

// Configure static routes for HTML files
app.use(express.static(path.join(__dirname, 'core')))

// Configure route for timer/view
app.get('/:classElement/view', (req, res) => {
  const classElement = req.params.classElement
  res.sendFile(path.join(__dirname, `core/${classElement}/view/index.html`))
})

// Configure route for timer/control
app.get('/:classElement/control', (req, res) => {
  const classElement = req.params.classElement
  res.sendFile(path.join(__dirname, `core/${classElement}/control/index.html`))
})

app.get('/:classElement/control&:request', (req, res) => {
  const classElement = req.params.classElement
  const request = req.params.request
  GlobalVariables = loadDataFromYAML((argsv[0] === 'test') ? './core/db.yaml' : './resources/app/core/db.yaml')

  // Here you can check the value of 'request' and perform the corresponding action
  if (request === 'start' && !classElement.startsWith('cdowntime') && !classElement.startsWith('time')) {
    // Simulate pressing the "Start" button by sending a WebSocket message
    startTimer(wss, GlobalVariables)
  } else if (request === 'pause' && classElement.startsWith('crono')) {
    // Simulate pressing the "Pause" button by sending a WebSocket message
    pauseCrono(wss, GlobalVariables, classElement)
  } else if (request === 'pause' && classElement.startsWith('cdown') && !classElement.startsWith('cdowntime')) {
    // Simulate pressing the "Pause" button by sending a WebSocket message
    pauseCdown(wss, GlobalVariables, classElement)
  } else if (request === 'startpause' && classElement.startsWith('crono')) {
    const status = GlobalVariables[classElement].status
    if (status === 'started') {
      pauseCrono(wss, GlobalVariables, classElement)
    } else if (status === 'paused' || status === 'stopped') {
      startTimer(wss, GlobalVariables, classElement)
    }
  } else if (request === 'startpause' && classElement.startsWith('cdown') && !classElement.startsWith('cdowntime')) {
    const status = GlobalVariables[classElement].status
    if (status === 'started') {
      pauseCdown(wss, GlobalVariables, classElement)
    } else if (status === 'paused' || status === 'stopped') {
      startTimer(wss, GlobalVariables, classElement)
    }
  } else if (request === 'reset' && classElement.startsWith('crono')) {
    // Simulate pressing the "Reset" button by sending a WebSocket message
    resetCrono(wss, GlobalVariables, classElement)
  } else if (request === 'reset' && classElement.startsWith('cdown') && !classElement.startsWith('cdowntime')) {
    // Simulate pressing the "Reset" button by sending a WebSocket message
    resetCdown(wss, GlobalVariables, classElement)
  } else if (
    !classElement.startsWith('time') &&
    request.split('=')[0] === 'addtime'
  ) {
    if (classElement.startsWith('cdowntime')) {
      editTimeCdowntime(
        wss,
        GlobalVariables,
        `+${request.split('=')[1]}`,
        classElement
      )
    } else {
      editTimeTimer(
        wss,
        GlobalVariables,
      `+${request.split('=')[1]}`,
      classElement
      )
    }
  } else if (
    !classElement.startsWith('time') &&
    request.split('=')[0] === 'subtime'
  ) {
    if (classElement.startsWith('cdowntime')) {
      editTimeCdowntime(
        wss,
        GlobalVariables,
        `-${request.split('=')[1]}`,
        classElement
      )
    } else {
      editTimeTimer(
        wss,
        GlobalVariables,
      `-${request.split('=')[1]}`,
      classElement
      )
    }
  }

  // Redirect back to the control page
  res.sendFile(path.join(__dirname, `core/${classElement}/control/blank.html`))
})

// Other server configuration (port, etc.)

// Start the server on port 3000
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)

  // Open the default browser at 'http://localhost:3000' after starting the server using 'open'.
  open.open(`http://localhost:${PORT}`)
})
