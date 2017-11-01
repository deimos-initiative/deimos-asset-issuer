'use strict'

const electron = require('electron')
const path = require('path')
const url = require('url')

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
})

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')()

// SET ENV
process.env.NODE_ENV = 'development'

const {app, BrowserWindow, Menu, ipcMain} = electron

global.secretKeys = {
    issuer: '',
    distributor: ''
}

let mainWindow

// Listen for app to be ready
app.on('ready', function(){
  createMainWindow()
})

// Handle Main window
function createMainWindow(){
  // Create new window
  mainWindow = new BrowserWindow({})
  // Load html in window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'signin.html'),
    protocol: 'file:',
    slashes: true
  }))
  // Quit app when closed
  mainWindow.on('closed', function(){
    app.quit()
  })

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu)
}

// Catch signin-click
ipcMain.on('signin-click', function(e, keys){
  secretKeys.issuer = keys.issuer
  secretKeys.distributor = keys.distributor

  mainWindow.loadURL('file://' + __dirname + '/manage_assets.html')
})

// Create menu template
const mainMenuTemplate =  [
  // Each object is a dropdown
  {
    label: 'Asset Issuer',
    submenu:[
      {
        label:'Sign In to Another Account',
        click(){
          secretKeys.issuer = ''
          secretKeys.distributor = ''
          mainWindow.loadURL('file://' + __dirname + '/signin.html')
        }
      },
      {
        label: 'Quit',
        accelerator:process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit()
        }
      }
    ]
  }
]

// If OSX, add empty object to menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({})
}

// Add developer tools option if in dev
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools()
        }
      }
    ]
  })
}
