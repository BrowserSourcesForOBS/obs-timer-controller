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

const actions = {
  reloadPage: () => sendToAllClients({ action: 'reload' }),
  themeChange: (ws, data) => {
    Config.themeDark = data.themeDark
    saveConfig(Config)
    sendToAllClients({ action: 'reload' })
  },
  langChange: (ws, data) => {
    Config.lang = data.lang
    saveConfig(Config)
    sendToAllClients({ action: 'reload' })
  },
  startTimer: (ws, data) => startTimer(wss, GlobalVariables, data.classElement),
  pauseCrono: (ws, data) => pauseCrono(wss, GlobalVariables, data.classElement),
  pauseCdown: (ws, data) => pauseCdown(wss, GlobalVariables, data.classElement),
  pauseExtensible: (ws, data) => pauseExtensible(wss, GlobalVariables, data.classElement),
  resetCrono: (ws, data) => resetCrono(wss, GlobalVariables, data.classElement),
  resetCdown: (ws, data) => resetCdown(wss, GlobalVariables, data.classElement),
  resetExtensible: (ws, data) => resetExtensible(wss, GlobalVariables, data.classElement),
  stopCdown: (ws, data) => stopCdown(wss, GlobalVariables, data.classElement),
  stopExtensible: (ws, data) => stopExtensible(wss, GlobalVariables, data.classElement),
  changeTimeCdown: (ws, data) => handleChangeTimeCdown(data),
  changeTimeCdownTime: (ws, data) => handleChangeTimeCdownTime(data),
  changeTimeExtensible: (ws, data) => handleChangeTimeExtensible(data),
  changeTimezoneTime: (ws, data) => handleChangeTimezoneTime(data),
  editMsg: (ws, data) => editMsg(data),
  checkboxStopAdd: (ws, data) => changeCheckboxStopAdd(data),
  checkboxPauseAdd: (ws, data) => changeCheckboxPauseAdd(data),
  changeFormat: (ws, data) => changeFormat(data),
  changeFormatExtCrono: (ws, data) => changeFormatExtCrono(data),
  changeFormatExtCdown: (ws, data) => changeFormatExtCdown(data),
  editTime: (ws, data) => editTime(data),
  changeFont: (ws, data) => changeFont(data),
  changeSize: (ws, data) => changeSize(data),
  textFormat: (ws, data) => changeTextFormat(data),
  align: (ws, data) => changeAlign(data),
  changeColor: (ws, data) => changeColor(data),
  getVariables: (ws, data) => sendVariableData(ws, GlobalVariables, Config, data.classElement),
  createData: (ws, data) => createData(data),
  removeData: (ws, data) => removeData(data),
  stopCode: () => process.exit()
}

function sendToAllClients (data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data))
    }
  })
}

function handleChangeTimeCdown (data) {
  GlobalVariables[data.classElement].textMilliseconds = data.time
  sendToAllClients(GlobalVariables)
  saveVariablesToYAML(GlobalVariables)
  if (GlobalVariables[data.classElement].status === 'ended') {
    resetCdown(wss, GlobalVariables, data.classElement)
  }
}

function handleChangeTimeCdownTime (data) {
  GlobalVariables[data.classElement].endDatetime = data.time
  sendToAllClients(GlobalVariables)
  saveVariablesToYAML(GlobalVariables)
}

function handleChangeTimeExtensible (data) {
  GlobalVariables[data.classElement].textMilliseconds = data.time
  sendToAllClients(GlobalVariables)
  saveVariablesToYAML(GlobalVariables)
  if (GlobalVariables[data.classElement].status === 'ended') {
    resetExtensible(wss, GlobalVariables, data.classElement)
  }
}

function handleChangeTimezoneTime (data) {
  GlobalVariables[data.classElement].timezone = data.timezone
  saveVariablesToYAML(GlobalVariables)
  sendToAllClients({ action: 'reload' })
}

function editMsg (data) {
  GlobalVariables[data.classElement].msgEnd = data.msg
  sendToAllClients(GlobalVariables)
  saveVariablesToYAML(GlobalVariables)
}

function changeCheckboxStopAdd (data) {
  GlobalVariables[data.classElement].enableStopAdd = data.value
  sendToAllClients(GlobalVariables)
  saveVariablesToYAML(GlobalVariables)
}

function changeCheckboxPauseAdd (data) {
  GlobalVariables[data.classElement].enablePauseAdd = data.value
  sendToAllClients(GlobalVariables)
  saveVariablesToYAML(GlobalVariables)
}

function changeFormat (data) {
  const classElement = data.classElement
  GlobalVariables[classElement].formatTime = data.format
  sendToAllClients(GlobalVariables)
  saveVariablesToYAML(GlobalVariables)
}

function changeFormatExtCrono (data) {
  const classElement = data.classElement
  GlobalVariables[classElement].formatTimeCrono = data.format
  sendToAllClients(GlobalVariables)
  saveVariablesToYAML(GlobalVariables)
}

function changeFormatExtCdown (data) {
  const classElement = data.classElement
  GlobalVariables[classElement].formatTimeCdown = data.format
  sendToAllClients(GlobalVariables)
  saveVariablesToYAML(GlobalVariables)
}

function editTime (data) {
  const classElement = data.classElement
  const status = GlobalVariables[classElement].status
  const enablePauseAdd = GlobalVariables[classElement].enablePauseAdd
  const enableStopAdd = GlobalVariables[classElement].enableStopAdd

  if (
    classElement.startsWith('crono') ||
    (classElement.startsWith('cdown') && !classElement.startsWith('cdowntime') && status !== 'ended') ||
    (classElement.startsWith('extensible') && (
      status === 'started' ||
      (status === 'paused' && enablePauseAdd) ||
      (status === 'stopped' && enableStopAdd)
    ))
  ) {
    editTimeTimer(wss, GlobalVariables, data.time, classElement)
  } else if (classElement.startsWith('cdowntime')) {
    editTimeCdowntime(wss, GlobalVariables, data.time, classElement)
  }
}

function changeFont (data) {
  GlobalVariables[data.classElement].font = data.font
  sendToAllClients(GlobalVariables)
  saveVariablesToYAML(GlobalVariables)
}

function changeSize (data) {
  GlobalVariables[data.classElement].size = data.size
  sendToAllClients(GlobalVariables)
  saveVariablesToYAML(GlobalVariables)
}

function changeTextFormat (data) {
  const classElement = data.classElement
  switch (data.format) {
    case 'bold':
      GlobalVariables[classElement].bold = !GlobalVariables[classElement].bold
      break
    case 'italic':
      GlobalVariables[classElement].italic = !GlobalVariables[classElement].italic
      break
    case 'underline':
      GlobalVariables[classElement].underline = !GlobalVariables[classElement].underline
      break
  }
  sendToAllClients(GlobalVariables)
  saveVariablesToYAML(GlobalVariables)
}

function changeAlign (data) {
  GlobalVariables[data.classElement].align = data.align
  sendToAllClients(GlobalVariables)
  saveVariablesToYAML(GlobalVariables)
}

function changeColor (data) {
  GlobalVariables[data.classElement].colorText = data.color
  sendToAllClients(GlobalVariables)
  saveVariablesToYAML(GlobalVariables)
}

function createData (data) {
  const page = createDataYAML(GlobalVariables, data.classType)
  fs.copy(
    argsv[0] === 'test' ? `./core/template/${data.classType}` : `./resources/app/core/template/${data.classType}`,
    argsv[0] === 'test' ? `./core/${page}` : `./resources/app/core/${page}`
  )
    .then(() => {
      console.log('Folder copied successfully.')
    })
    .catch((err) => {
      console.error('Error copying the folder:', err)
    })
}

function removeData (data) {
  delete GlobalVariables[data.remove]
  fs.remove(argsv[0] === 'test' ? `./core/${data.remove}` : `./resources/app/core/${data.remove}`)
    .then(() => {
      // console.log(`Folder deleted successfully: ${folderToDelete}`);
    })
    .catch((error) => {
      console.error(`Error deleting the folder: ${error}`)
    })
  saveVariablesToYAML(GlobalVariables)
}

// WebSocket connections handling
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ fonts: fontOptions }))

  ws.on('message', (message) => {
    const data = JSON.parse(message)

    GlobalVariables = loadDataFromYAML(argsv[0] === 'test' ? './core/db.yaml' : './resources/app/core/db.yaml')

    if (actions[data.action]) {
      actions[data.action](ws, data)
    }

    ws.send(JSON.stringify(GlobalVariables))
  })
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

function openUrlWhenConfigExists () {
  if (Config) {
    open.open(`http://localhost:${PORT}`)
  } else {
    // Config todavía no existe, espera y vuelve a verificar en un momento
    setTimeout(openUrlWhenConfigExists, 1000) // Espera 1 segundo antes de verificar nuevamente
  }
}

// Start the server on port 3000
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)

  // Open the default browser at 'http://localhost:3000' after starting the server using 'open'.
  openUrlWhenConfigExists()
})
