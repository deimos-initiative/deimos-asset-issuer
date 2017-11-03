'use strict'

var StellarSdk = require('stellar-sdk')

const electron = require('electron')
const {remote} = electron

let currentWindow = remote.getCurrentWindow()

currentWindow.webContents.on('did-finish-load', () => {
  const issuerPair = StellarSdk.Keypair.fromSecret(remote.getGlobal('secretKeys').issuer)
  const distributorPair = StellarSdk.Keypair.fromSecret(remote.getGlobal('secretKeys').distributor)

  $('#issuer-public-key').text(issuerPair.publicKey())
  $('#distribuitor-public-key').text(distributorPair.publicKey())

  $('#close-window').click(function() {
    currentWindow.close()
  })

  $('#issue-new-asset-button').click(function() {
    issueNewAsset(issuerPair,distributorPair)
    $('#issue-new-asset-button').prop('disabled', true)
  })

  if(process.env.NODE_ENV !== 'production'){
    var devButton = $('<button type="button" id="dev-tools">Open Developer Tools</button>')
    devButton.appendTo($('body'))

    $('#dev-tools').click(function() {
      currentWindow.toggleDevTools()
    })
  }
})

function issueNewAsset(issuerKeys,distributorKeys) {
  //TODO: validate values and formats
  let assetCode = $('#new-asset-code').val()
  let assetLimit = $('#new-asset-limit').val()
  let assetTransferAmount = $('#new-asset-transfer-amount').val()

  // Create an object to represent the new asset
  let newAsset = new StellarSdk.Asset(assetCode, issuerKeys.publicKey());

  // First, the receiving account must trust the asset
  stellarServer.loadAccount(distributorKeys.publicKey())
  .then(function(receiver) {
    var transaction = new StellarSdk.TransactionBuilder(receiver)
      // The `changeTrust` operation creates (or alters) a trustline
      // The `limit` parameter below is optional
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: newAsset,
        limit: assetLimit
      }))
      .build();
    transaction.sign(distributorKeys);
    return stellarServer.submitTransaction(transaction);
  })
  // Second, the issuing account actually sends a payment using the asset
  .then(function() {
    return stellarServer.loadAccount(issuerKeys.publicKey())
  })
  .then(function(issuer) {
    var transaction = new StellarSdk.TransactionBuilder(issuer)
      .addOperation(StellarSdk.Operation.payment({
        destination: distributorKeys.publicKey(),
        asset: newAsset,
        amount: assetTransferAmount
      }))
      .build();
    transaction.sign(issuerKeys)
    return stellarServer.submitTransaction(transaction)
  })
  .then(function(transaction) {
    //console.log(transaction)
    currentWindow.close()

  })
  .catch(function(error) {
    //TODO: show error message
    console.error('Error!', error)
  })
}
