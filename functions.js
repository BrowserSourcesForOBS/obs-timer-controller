const fs = require('fs')
const yaml = require('js-yaml')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const WebSocket = require('ws')
const { getMs } = require('util-tiempo')
const fontkit = require('fontkit')

const argsv = process.argv.slice(2)

// Convert a string containing digits to an integer
function strToInt (str) {
  const digits = str.replace(/\D/g, '')
  return parseInt(digits, 10) // The second argument 10 indicates decimal base
}

// Get the user's language from the Windows Registry
async function getLanguage () {
  const command = 'reg query "HKEY_CURRENT_USER\\Control Panel\\International" /v LocaleName'
  const { stdout } = await exec(command)

  const outputLines = stdout.split('\n')
  const languageValueLine = outputLines.find((line) => line.includes('LocaleName'))

  if (languageValueLine) {
    const languageValue = (languageValueLine.split(/\s+/).filter((element) => element !== '')[2]).split('-')[0]
    return languageValue
  } else {
    console.error('Could not find language Registry key.')
  }
}

// Check if the Windows theme is dark
async function darkThemeCheck () {
  const command = 'reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v AppsUseLightTheme'
  const { stdout } = await exec(command)

  const outputLines = stdout.split('\n')
  const themeValueLine = outputLines.find((line) => line.includes('AppsUseLightTheme'))

  if (themeValueLine) {
    const themeValue = (themeValueLine.split(/\s+/).filter((element) => element !== '')[2]).split('x')[1]

    if (themeValue === '1') {
      return false // Light theme
    } else if (themeValue === '0') {
      return true // Dark theme
    } else {
      console.error('Could not determine Windows theme.')
    }
  } else {
    console.error('Could not find theme Registry key.')
  }
}

// Get a list of installed fonts
exports.getFonts = () => {
  const fontDirectories = [
    'C:/Windows/Fonts',
    `${process.env.LOCALAPPDATA}/Microsoft/Windows/Fonts`
  ]

  let installedFonts = []

  fontDirectories.forEach((fontDirectory) => {
    try {
      const files = fs.readdirSync(fontDirectory)

      files.forEach((file) => {
        if (file.endsWith('.ttf') || file.endsWith('.TTF')) {
          const fontPath = `${fontDirectory}/${file}`
          const font = fontkit.openSync(fontPath)
          const fontFamily = font.name.records.fontFamily.en

          if (fontFamily) {
            installedFonts.push(fontFamily)
          }
        }
      })
    } catch (err) {
      console.error(`Error reading font directory: ${fontDirectory}`)
    }
  })

  installedFonts = [...new Set(installedFonts)].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  )

  return installedFonts
}

// Initialize configuration settings
exports.initConfig = async () => {
  const Config = {
    lang: await getLanguage(),
    themedark: await darkThemeCheck()
  }

  this.saveConfig(Config)
  return Config
}

// Load configuration settings from a YAML file
exports.loadConfig = async () => {
  let Config

  try {
    // Read the YAML file (if it exists)
    const yamlFile = fs.readFileSync((argsv[0] === 'test') ? './core/config.yaml' : './resources/app/core/config.yaml', 'utf8')

    // Convert the YAML file content to a JavaScript object
    const data = yaml.load(yamlFile)

    // Update global variables if the YAML file contains valid data
    if (data && typeof data === 'object') {
      Config = data
      // console.log('Variables loaded from YAML file.');
    } else {
      console.error('The YAML file does not contain valid data.')
    }
  } catch (error) {
    console.error('Error loading variables from YAML file:', error)
  }

  return Config
}

// Save configuration settings to a YAML file
exports.saveConfig = (config) => {
  try {
    // Convert the configuration object to YAML format
    const configYAML = yaml.dump(config)

    // Write the content to the YAML file
    fs.writeFileSync((argsv[0] === 'test') ? './core/config.yaml' : './resources/app/core/config.yaml', configYAML, 'utf8')

    // console.log('Variables saved to YAML file.');
  } catch (error) {
    console.error('Error saving variables to YAML file:', error)
  }
}

// Load data from a YAML file
exports.loadDataFromYAML = (name) => {
  try {
    // Read the YAML file (if it exists)
    const yamlFile = fs.readFileSync(name, 'utf8')

    // Convert the YAML file content to a JavaScript object
    const data = yaml.load(yamlFile)

    // Update global variables if the YAML file contains valid data
    if (data && typeof data === 'object') {
      return data
      // console.log('Variables loaded from YAML file.');
    } else {
      console.error('The YAML file does not contain valid data.')
      return {}
    }
  } catch (error) {
    console.error('Error loading variables from YAML file:', error)
    return {}
  }
}

// Save global variables to a YAML file
exports.saveVariablesToYAML = (GlobalVariables) => {
  try {
    // Convert global variables to YAML format
    const variablesYAML = yaml.dump(GlobalVariables)

    // Write the content to the YAML file
    fs.writeFileSync((argsv[0] === 'test') ? './core/db.yaml' : './resources/app/core/db.yaml', variablesYAML, 'utf8')

    // console.log('Variables saved to YAML file.');
  } catch (error) {
    console.error('Error saving variables to YAML file:', error)
  }
}

// Create a new data entry in YAML format
exports.createDataYAML = (GlobalVariables, classType) => {
  let newKey
  try {
    // Check if GlobalVariables is an object
    if (typeof GlobalVariables !== 'object') {
      GlobalVariables = {} // Initialize as an empty object if it's not
    }

    let keys = Object.keys(GlobalVariables)
    keys = keys.filter((i) => i.startsWith(classType))
    keys = keys.sort((a, b) => a.localeCompare(b))
    keys = keys.map((item) => strToInt(item))
    let index = 1
    while (keys.includes(index)) {
      index += 1
    }

    newKey = `${classType}${index.toString().padStart(2, '0')}`
  } catch (error) {
    newKey = `${classType}01`
  }

  // Check if GlobalVariables[newKey] is an object before assigning values
  if (typeof GlobalVariables[newKey] !== 'object') {
    GlobalVariables[newKey] = {}
  }

  // Default values based on classType
  if (classType === 'crono') {
    GlobalVariables[newKey].status = 'stopped'
    GlobalVariables[newKey].startTime = 0
    GlobalVariables[newKey].milliseconds = 0
    GlobalVariables[newKey].formatTime = 'MM:ss'
    GlobalVariables[newKey].font = 'Arial'
    GlobalVariables[newKey].size = 50
    GlobalVariables[newKey].bold = false
    GlobalVariables[newKey].italic = false
    GlobalVariables[newKey].underline = false
    GlobalVariables[newKey].align = 'center'
    GlobalVariables[newKey].colorText = '#000000'
  } else if (classType === 'cdown') {
    GlobalVariables[newKey].status = 'stopped'
    GlobalVariables[newKey].startTime = 0
    GlobalVariables[newKey].milliseconds = 60000
    GlobalVariables[newKey].textmilliseconds = 60000
    GlobalVariables[newKey].formatTime = 'MM:ss'
    GlobalVariables[newKey].font = 'Arial'
    GlobalVariables[newKey].size = 50
    GlobalVariables[newKey].bold = false
    GlobalVariables[newKey].italic = false
    GlobalVariables[newKey].underline = false
    GlobalVariables[newKey].align = 'center'
    GlobalVariables[newKey].colorText = '#000000'
    GlobalVariables[newKey].msgEnd = ''
  } else if (classType === 'cdowntime') {
    GlobalVariables[newKey].endDatetime = new Date().getTime() + getMs('1h')
    GlobalVariables[newKey].timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    GlobalVariables[newKey].formatTime = 'HH:mm:ss'
    GlobalVariables[newKey].font = 'Arial'
    GlobalVariables[newKey].size = 50
    GlobalVariables[newKey].bold = false
    GlobalVariables[newKey].italic = false
    GlobalVariables[newKey].underline = false
    GlobalVariables[newKey].align = 'center'
    GlobalVariables[newKey].colorText = '#000000'
    GlobalVariables[newKey].msgEnd = ''
  } else if (classType === 'time') {
    GlobalVariables[newKey].timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    GlobalVariables[newKey].formatTime = 'hh:mm:ss'
    GlobalVariables[newKey].font = 'Arial'
    GlobalVariables[newKey].size = 50
    GlobalVariables[newKey].bold = false
    GlobalVariables[newKey].italic = false
    GlobalVariables[newKey].underline = false
    GlobalVariables[newKey].align = 'center'
    GlobalVariables[newKey].colorText = '#000000'
  }

  this.saveVariablesToYAML(GlobalVariables)
  return newKey
}

// Send variable data to a WebSocket client
exports.sendVariableData = (client, GlobalVariables, configuration, classE) => {
  if (GlobalVariables && typeof GlobalVariables === 'object') {
    const formats = this.loadDataFromYAML((argsv[0] === 'test') ? './core/formats.yaml' : './resources/app/core/formats.yaml')
    const translates = this.loadDataFromYAML((argsv[0] === 'test') ? `./core/translates/${configuration.lang}.yaml` : `./resources/app/core/translates/${configuration.lang}.yaml`)

    // Send variable data to the client
    if (classE === 'home') {
      client.send(JSON.stringify({ action: 'sendVariables', variables: GlobalVariables, config: configuration, formats, translateElements: translates, classElement: classE }))
    } else {
      client.send(JSON.stringify({ action: 'sendVariables', variables: GlobalVariables[classE], config: configuration, formats, translateElements: translates, classElement: classE }))
    }
  } else {
    console.log('No variable data to send.')
  }
}

// Start the stopwatch
exports.startTimer = (wss, GlobalVariables, classElement) => {
  if (GlobalVariables[classElement].status !== 'started') {
    GlobalVariables[classElement].status = 'started'
    GlobalVariables[classElement].startTime = Date.now()

    // Update all WebSocket clients with stopwatch status
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(GlobalVariables))
      }
    })

    this.saveVariablesToYAML(GlobalVariables)
  }
}

// Pause the stopwatch
exports.pauseCrono = (wss, GlobalVariables, classElement) => {
  if (GlobalVariables[classElement].status === 'started') {
    GlobalVariables[classElement].status = 'paused'
    GlobalVariables[classElement].milliseconds += Date.now() - GlobalVariables[classElement].startTime

    // Update all WebSocket clients with stopwatch status
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(GlobalVariables))
      }
    })

    this.saveVariablesToYAML(GlobalVariables)
  }
}

// Pause the countdown
exports.pauseCdown = (wss, GlobalVariables, classElement) => {
  if (GlobalVariables[classElement].status === 'started') {
    GlobalVariables[classElement].status = 'paused'
    GlobalVariables[classElement].milliseconds -= Date.now() - GlobalVariables[classElement].startTime

    // Update all WebSocket clients with countdown status
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(GlobalVariables))
      }
    })

    this.saveVariablesToYAML(GlobalVariables)
  }
}

// Reset the stopwatch
exports.resetCrono = (wss, GlobalVariables, classElement) => {
  GlobalVariables[classElement].status = 'stopped'
  GlobalVariables[classElement].milliseconds = 0
  GlobalVariables[classElement].startTime = 0

  // Update all WebSocket clients with stopwatch status
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(GlobalVariables))
    }
  })

  this.saveVariablesToYAML(GlobalVariables)
}

// Reset the countdown
exports.resetCdown = (wss, GlobalVariables, classElement) => {
  GlobalVariables[classElement].status = 'stopped'
  GlobalVariables[classElement].milliseconds = GlobalVariables[classElement].textmilliseconds
  GlobalVariables[classElement].startTime = 0

  // Update all WebSocket clients with countdown status
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(GlobalVariables))
    }
  })

  this.saveVariablesToYAML(GlobalVariables)
}

// Stop the countdown
exports.stopCdown = (wss, GlobalVariables, classElement) => {
  GlobalVariables[classElement].status = 'stopped'
  GlobalVariables[classElement].milliseconds = 0

  // Update all WebSocket clients with countdown status
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(GlobalVariables))
    }
  })

  this.saveVariablesToYAML(GlobalVariables)
}

// Add or subtract time from the countdown
exports.editTimeTimer = (wss, GlobalVariables, time, classElement) => {
  const regex = /^([-+])(\d+)([ywdhms]|(ms)|(mh))$/
  const match = time.match(regex)

  if (match) {
    let operator = match[1]
    const number = parseInt(match[2], 10)
    const timeUnit = match[3]

    operator = (operator === '-') ? -1 : 1

    GlobalVariables[classElement].milliseconds += operator * getMs(`${number}${timeUnit}`)
  }

  // Update all WebSocket clients with countdown status
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ action: 'reload' }))
    }
  })

  this.saveVariablesToYAML(GlobalVariables)
}

exports.editTimeCdowntime = (wss, GlobalVariables, time, classElement) => {
  const regex = /^([-+])(\d+)([ywdhms]|(ms)|(mh))$/
  const match = time.match(regex)

  if (match) {
    let operator = match[1]
    const number = parseInt(match[2], 10)
    const timeUnit = match[3]

    operator = (operator === '-') ? -1 : 1

    GlobalVariables[classElement].endDatetime += operator * getMs(`${number}${timeUnit}`)
  }

  // Update all WebSocket clients with countdown status
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ action: 'reload' }))
    }
  })

  this.saveVariablesToYAML(GlobalVariables)
}
