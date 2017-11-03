'use strict'

var StellarSdk = require('stellar-sdk')

const electron = require('electron')
const {remote, webContents} = electron

let currentWindow = remote.getCurrentWindow()

const issuerPair = StellarSdk.Keypair.fromSecret(remote.getGlobal('secretKeys').issuer)
const distributorPair = StellarSdk.Keypair.fromSecret(remote.getGlobal('secretKeys').distributor)
const issuerPublic = issuerPair.publicKey()
const distributorPublic = distributorPair.publicKey()

function issuerLumensBalance(issuerPublic,network) {
  let url = getApiUrl(network) + '/accounts/' + issuerPublic

  $.getJSON(url)
  .done(function(json) {
    let assets = ''
    let lumens = ''
    if (json.balances.length > 0) {
      $.each(json.balances, function(i, item) {
        if(item.asset_type == 'native') {
          lumens = '<br /><div><span id="lumens-balance">XLM (Stellar Lumens)</span>: '
          lumens += '<span id="issuer-xlm-balance">' + item.balance + '</span></div><br />'
        }
     })
     $('#issuer-balances').html(lumens)
     $('#issuer-last-balance-msg').html('')
    }
  })
  .fail(function(json) {
    $('#issuer-last-balance-msg').text('Update balances error')
  })
  .always(function() {
    $('#issuer-last-balance-msg').text(document.lastModified)
    // TODO: refresh translations
  })
}

function distributorBalances(distributorPublic,issuerPublic,network) {
  let url = getApiUrl(network) + '/accounts/' + distributorPublic

  $.getJSON(url)
  .done(function(json) {
    let assets = ''
    let lumens = ''
    if (json.balances.length > 0) {
      $.each(json.balances, function(i, item) {
        if(item.asset_type == 'native') {
          lumens = '<br /><div><span id="lumens-balance">XLM (Stellar Lumens)</span>: '
          lumens += '<span id="distributor-xlm-balance">' + item.balance + '</span></div><br />'
        }
        else {
          let assetOperations = ''
          if (item.asset_issuer == issuerPublic) {
            assetOperations += '&nbsp;&nbsp;&nbsp;<button type="button" data-label-issue-more '
            assetOperations += ' id="issue-' + item.asset_code + '"  disabled>Issue more</button>'
            assetOperations += '&nbsp;&nbsp;&nbsp;<button type="button" data-label-change-limit '
            assetOperations += ' id="change-limit-' + item.asset_code + '" disabled>Change limit</button>'
          }
          assets += '<div data-asset-balance>' + item.asset_code + assetOperations
          assets += '<ul><li><span data-label-balance>Balance</span>: ' + item.balance
          assets += '</li><li><span data-label-limit>Limit</span>: ' + item.limit
          assets += '</li><li><span data-label-issuer>Issuer</span>: ' + item.asset_issuer
          assets += '</ul></div>'
        }
     })
    }
    $('#distributor-balances').html(lumens + assets)
    $('#distributor-last-balance-msg').html('')
  })
  .fail(function(json) {
    $('#distributor-last-balance-msg').text('Update balances error')
  })
  .always(function() {
    $('#distributor-last-balance-msg').text(document.lastModified)
    // TODO: refresh translations
  })
}

currentWindow.webContents.on('did-finish-load', () => {
  $('#issuer-public').text(issuerPublic)
  $('#distribuitor-public').text(distributorPublic)

  issuerLumensBalance(issuerPublic,network)
  distributorBalances(distributorPublic,issuerPublic,network)

  let issuerXlm = parseFloat($('#issuer-xlm-balance').text()) || 0
  let distributorXlm = parseFloat($('#distributor-xlm-balance').text()) || 0
  // TODO: minimum balance warning
  if (issuerXlm >= 31 && distributorXlm >= 31) {
    $('#issue-asset-button').prop('disabled', false)
  }
  else {
    $('#issue-asset-button').prop('disabled', true)
  }
  $('#close-app').click(function() {
    require('electron').remote.app.quit()
  })
  $('#issue-asset-button').click(function() {
    openModal('new-asset.html')
  })
  if (network == 'testnet') {
    let url = getApiUrl(network) + '/friendbot?addr='
    $('#issuer-get-lumens-button').click(function() {
      $.getJSON(url + issuerPublic, function() {
        $('#issuer-get-lumens-button').hide()
      })
    })
    $('#distributor-get-lumens-button').click(function() {
      $.getJSON(url + distributorPublic, function() {
        $('#distributor-get-lumens-button').hide()
      })
    })
  }
  if(process.env.NODE_ENV !== 'production') {
    var devButton = $('<button type="button" id="dev-tools">Open Developer Tools</button>')
    devButton.appendTo($('body'))

    $('#dev-tools').click(function() {
      currentWindow.toggleDevTools()
    })
  }
})

// Update balances
setInterval(function() {
  issuerLumensBalance(issuerPublic,network)
  distributorBalances(distributorPublic,issuerPublic,network)

  let issuerXlm = parseFloat($('#issuer-xlm-balance').text()) || 0
  let distributorXlm = parseFloat($('#distributor-xlm-balance').text()) || 0

  // TODO: minimum balance warning
  if (issuerXlm >= 31 && distributorXlm >= 31) {
    $('#issue-asset-button').prop('disabled', false)
  }
  else {
    $('#issue-asset-button').prop('disabled', true)
  }
  if (issuerXlm == 0) {
    $('#issuer-get-lumens-button').show()
  }
  else {
    $('#issuer-get-lumens-button').hide()
  }
  if (distributorXlm == 0) {
    $('#distributor-get-lumens-button').show()
  }
  else {
    $('#distributor-get-lumens-button').hide()
  }
}, 10000)
