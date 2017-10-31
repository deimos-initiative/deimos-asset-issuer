'use strict'

var StellarSdk = require('stellar-sdk')

const electron = require('electron')
const {ipcRenderer, ipcMain} = electron

ipcRenderer.on('signin-click', function(e, keys){
  ipcMain.send('signin-click', keys)
})

function createKeyPairs(){
  const issuerPair = StellarSdk.Keypair.random()
  const distributorPair = StellarSdk.Keypair.random()

  document.getElementById('issuer-public-key').value = issuerPair.publicKey()
  document.getElementById('issuer-secret-key').value = issuerPair.secret()
  document.getElementById('distribuitor-public-key').value = distributorPair.publicKey()
  document.getElementById('distribuitor-secret-key').value = distributorPair.secret()

  //console.log(ipcRenderer)
}

function signIn() {
  //e.preventDefault();
  let keys = {
    issuer: document.getElementById('issuer-secret-key').value,
    distributor: document.getElementById('distribuitor-secret-key').value
  }
  ipcRenderer.send('signin-click', keys)

}

//document.querySelector('#signin-button').addEventListener('click', createKeyPairs)
//document.querySelector('form').addEventListener('submit', signIn)
