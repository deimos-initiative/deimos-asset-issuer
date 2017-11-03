'use strict'

var StellarSdk = require('stellar-sdk')

const electron = require('electron')
const {remote, webContents, ipcMain, ipcRenderer} = electron

let currentWindow = remote.getCurrentWindow()

currentWindow.webContents.on('did-finish-load', () => {
  $('#close-app').click(function() {
    require('electron').remote.app.quit()
  })
  $('#signin-button').click(function() {
    signIn()
  })
  $('#keys-button').click(function() {
    createKeyPairs()
  })

  if(process.env.NODE_ENV !== 'production') {
    var devButton = $('<button type="button" id="dev-tools">Open Developer Tools</button>')
    devButton.appendTo($('body'))

    $('#dev-tools').click(function() {
      currentWindow.toggleDevTools()
    })

    $('#issuer-public-key').val('GBUKNN6YFC2VUY6TIHNKD2OLQWJJU5FXYWPLPMS2VGOTR65LU2M6VMZ4')
    $('#issuer-secret-key').val('SAS3KKLVLXL7PMVYA4PFYVK6HI6JEODXGBJN7CXCYSAYY573T3RL23V5')
    $('#distribuitor-public-key').val('GBA22VS75NDGTWXX33VCZ4KZKMUUDMKFNZZF6ZSRBZFYIIQKMK4J3XMZ')
    $('#distribuitor-secret-key').val('SBHQ33EUFG6IEKI4WGW7R3FQFIN5KDNBTCZ763HOP5SZRD5WHJRWVANU')
  }
})

function createKeyPairs() {
  const issuerPair = StellarSdk.Keypair.random()
  const distributorPair = StellarSdk.Keypair.random()

  $('#issuer-public-key').val(issuerPair.publicKey())
  $('#issuer-secret-key').val(issuerPair.secret())
  $('#distribuitor-public-key').val(distributorPair.publicKey())
  $('#distribuitor-secret-key').val(distributorPair.secret())
}

function signIn() {
  //e.preventDefault();
  let keys = {
    issuer: $('#issuer-secret-key').val(),
    distributor: $('#distribuitor-secret-key').val()
  }
  ipcRenderer.send('signin-click', keys)
}

ipcRenderer.on('signin-click', function(e, keys){
  ipcMain.send('signin-click', keys)
})
