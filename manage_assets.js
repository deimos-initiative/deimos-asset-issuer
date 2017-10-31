'use strict'

var StellarSdk = require('stellar-sdk')

const electron = require('electron')
const {ipcRenderer, remote} = electron

const network = 'testnet' // or public

if(network == 'testnet') {
    StellarSdk.Network.useTestNetwork()
    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org')
}
else {
    StellarSdk.Network.usePublicNetwork()
    var server = new StellarSdk.Server('https://horizon.stellar.org')
}

const issuerPair = StellarSdk.Keypair.fromSecret(remote.getGlobal('secretKeys').issuer)
const distributorPair = StellarSdk.Keypair.fromSecret(remote.getGlobal('secretKeys').distributor)

const issuerPublic = issuerPair.publicKey()
const distributorPublic = distributorPair.publicKey()

function distributorBalances(publicKey) {
  let url = 'https://horizon-testnet.stellar.org/accounts/' + publicKey
  let assets = '<p>Not found</p>'
  fetch(url)
  .then(response => response.json())
  .then((output) => {
    //console.log(typeof(output.balances))
    if (output.balances.isArray  && output.balances.length > 0) {
      assets = '<p>Not found</p>'
    }
    else {
      output.balances.forEach(function(balance) {
          //console.log('Type:', balance.asset_type, ', Code:', balance.asset_code, ', Balance:', balance.balance)
          if(balance.asset_type == 'native') {
              assets += '<p>Lumens: Balance:' + balance.balance + '</p>'
          }
          else {
            assets += '<p>' + balance.asset_code + ' => Balance:' + balance.balance + ', Limit:' + balance.limit + ', Issuer:' + balance.asset_issuer + '</p>'
          }
      })
    }
  })
  .catch(err => {
    assets = '<p>Not found' + err + '</p>'
  })
  document.getElementById('distributor-balances').innerHTML = assets
}

distributorBalances(distributorPublic)

function loadBalances() {
  distributorBalances(distributorPublic)
}
