
'use strict'

var StellarSdk = require('stellar-sdk')
let network = 'testnet' // or public

if(network == 'public') {
  StellarSdk.Network.usePublicNetwork()
  var stellarServer = new StellarSdk.Server('https://horizon.stellar.org')
}
else {
  StellarSdk.Network.useTestNetwork()
  var stellarServer = new StellarSdk.Server('https://horizon-testnet.stellar.org')
}

window.$ = window.jQuery = require('./node_modules/jquery/dist/jquery.min.js')
window.i18n = new(require('./assets/js/i18n'))

function getApiUrl(network) {
  if(network == 'public') {
    return 'https://horizon.stellar.org'
  }
  else {
    return 'https://horizon-testnet.stellar.org'
  }
}

function openModal(htmlFile) {
  let modalWindow = new remote.BrowserWindow({
    //width: 800,
    //height: 400,
    parent: remote.getCurrentWindow(),
    modal: true,
    frame: false,
    show: false
  })
  modalWindow.loadURL('file://' + __dirname + '/' + htmlFile)
  modalWindow.once('ready-to-show', () => {
    modalWindow.show()
  })
}
