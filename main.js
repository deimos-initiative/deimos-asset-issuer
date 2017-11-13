'use strict';

const electron = require('electron');
const path = require('path');
const url = require('url');

require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
})

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// SET ENV
process.env.NODE_ENV = 'development';

const {app, BrowserWindow, Menu, ipcMain} = electron;

global.secretKeys = {
    issuer: '',
    distributor: ''
}
global.settings = {
    network: '',
    language: 'en-US'
}

let mainWindow;

app.on('ready', function(){

    mainWindow = new BrowserWindow({
        frame: true,
        // resizable: false,
        width: 1024,
        height: 768,
        'use-content-size': true,
    });

    mainWindow.loadURL('file://' + __dirname + '/app/index.html');

    mainWindow.on('closed', function() {
        secretKeys.issuer = "";
        secretKeys.distributor = "";
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('show', () => {
        mainWindow.webContents.executeJavaScript('loadTranslations()');
    });
});

// Catch signin-click
ipcMain.on('signin-click', function(e, params) {
  secretKeys.issuer = params.keys.issuer;
  secretKeys.distributor = params.keys.distributor;

  settings.network = params.network;
  settings.language = params.language;

  mainWindow.loadURL('file://' + __dirname + '/app/manage-assets.html');
});

// Catch language-change
ipcMain.on('language-change', function(e, language) {
  settings.language = language;
  //$('body').localize();
});


// Create menu template
// TODO: translate menu items
const mainMenuTemplate =  [
  // Each object is a dropdown
  {
    label: 'Asset Issuer',
    submenu:[
      {
        label:'Switch to Another Accounts',
        click(){
          secretKeys.issuer = '';
          secretKeys.distributor = '';
          mainWindow.loadURL('file://' + __dirname + '/app/index.html');
        }
      },
      {
        label: 'Quit',
        accelerator:process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
]

// If OSX, add empty object to menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
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
          focusedWindow.toggleDevTools();
        }
      }
    ]
  })
}
