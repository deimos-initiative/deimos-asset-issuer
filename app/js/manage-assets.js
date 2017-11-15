'use strict'

var StellarSdk = require('stellar-sdk')

const electron = require('electron')
const {remote, webContents, ipcRenderer, ipcMain} = electron

// TODO: better window autoresize
let currentWindow = remote.getCurrentWindow();
currentWindow.setContentSize(768, 1024);

const appVersion = window.require('electron').remote.app.getVersion();

const issuerPair = StellarSdk.Keypair.fromSecret(remote.getGlobal('secretKeys').issuer);
const distributorPair = StellarSdk.Keypair.fromSecret(remote.getGlobal('secretKeys').distributor);
const issuerPublic = issuerPair.publicKey();
const distributorPublic = distributorPair.publicKey();

const network = remote.getGlobal('settings').network;
const language = remote.getGlobal('settings').language;

if(network == 'public') {
  StellarSdk.Network.usePublicNetwork()
  var stellarServer = new StellarSdk.Server('https://horizon.stellar.org');
}
else {
  StellarSdk.Network.useTestNetwork()
  var stellarServer = new StellarSdk.Server('https://horizon-testnet.stellar.org');
}

var MANAGE_ASSETS = {
  onReady: function() {
      $('#language').val(language);
      $("#version").html(appVersion);
      currentWindow.webContents.executeJavaScript('loadTranslations()');

      $('#issuer-public').text(issuerPublic);
      $('#distribuitor-public').text(distributorPublic);

      // TODO: translate network info
      $('#stellar-network').text(network);

      MANAGE_ASSETS.issuerLumensBalance(issuerPublic,network)
      MANAGE_ASSETS.distributorBalances(distributorPublic,issuerPublic,network)

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
      });
      $('#issue-asset-button').click(function() {
          MANAGE_ASSETS.openModal('new-asset.html')
      });
      if (network == 'test') {
        let url = MANAGE_ASSETS.getApiUrl(network) + '/friendbot?addr='
        $('#issuer-get-lumens-button').click(function() {
          // TODO: add a spinner
          $.getJSON(url + issuerPublic, function() {
            $('#issuer-get-lumens-button').hide()
          })
        })
        $('#distributor-get-lumens-button').click(function() {
          // TODO: add a spinner
          $.getJSON(url + distributorPublic, function() {
            $('#distributor-get-lumens-button').hide()
          })
        })
      }
  },

  getApiUrl(network) {
    if(network == 'public') {
      return 'https://horizon.stellar.org';
    }
    else {
      return 'https://horizon-testnet.stellar.org';
    }
  },

  sendNotification(msg) {
      UIkit.notification('<span uk-icon="icon: file-edit; ratio: 1"></span><span class="notification" data-i18n="' + msg + '"></span>', {
        status: 'primary',
        pos: 'top-center',
        timeout: 5000
      });
      $('.notification').localize();
  },

  openModal(htmlFile) {
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
          modalWindow.show();
      });

      modalWindow.on('show', () => {
          modalWindow.webContents.executeJavaScript('loadTranslations()');
      });
  },

  accountExists(url, callback){
      $.ajax({
          url:      url,
          dataType: 'json',
          type:     'GET',
          complete:  function(xhr){
              if(typeof callback === 'function')
                 callback.apply(this, [xhr.status]);
          }
      });
  },

  issuerLumensBalance(issuerPublic,network) {
      let url = MANAGE_ASSETS.getApiUrl(network) + '/accounts/' + issuerPublic;

      MANAGE_ASSETS.accountExists(url, function(status) {
          if(status === 200) {
              $.getJSON(url)
              .done(function(json) {
                let assets = '';
                let lumens = '';
                if (json.balances.length > 0) {
                  $.each(json.balances, function(i, item) {
                    if(item.asset_type == 'native') {
                      lumens = '<br /><div><span id="lumens-balance"><b>XLM (Stellar Lumens)</b></span>: ';
                      lumens += '<span id="issuer-xlm-balance">' + item.balance + '</span></div><br />';
                    }
                 });
                 $('#issuer-balances').html(lumens);
                 $('#issuer-last-balance-msg').html('');
                }
              })
              .fail(function(json) {
                  $('#issuer-last-balance-msg').text('Update balances error');
              })
              .always(function() {
                  $('#issuer-last-balance-msg').text(document.lastModified);
                  // TODO: refresh translations
              });
          } else if(status === 404) {
              MANAGE_ASSETS.sendNotification('In order to issue an asset you must fund your account with 31 Lumens or more');
          }else{
              MANAGE_ASSETS.sendNotification('An unexpected error occurred. Check your connection');
          }
      });
  },

  distributorBalances(distributorPublic,issuerPublic,network) {
      let url = MANAGE_ASSETS.getApiUrl(network) + '/accounts/' + distributorPublic;

      MANAGE_ASSETS.accountExists(url, function(status) {
          if(status === 200) {
              $.getJSON(url)
              .done(function(json) {
                  let assets = '';
                  let lumens = '';
                  if (json.balances.length > 0) {
                      $.each(json.balances, function(i, item) {
                        if(item.asset_type == 'native') {
                          lumens = '<br /><div><span id="lumens-balance"><b>XLM (Stellar Lumens)</b></span>: ';
                          lumens += '<span id="distributor-xlm-balance">' + item.balance + '</span></div><br />';
                        }
                        else {
                          let assetOperations = '';
                          if (item.asset_issuer == issuerPublic) {
                            assetOperations += '&nbsp;&nbsp;<button type="button" class="uk-button uk-button-primary uk-button-small" data-i18n="Issue more" ';
                            assetOperations += ' id="issue-' + item.asset_code + '"  disabled></button>';
                            assetOperations += '&nbsp;&nbsp;<button type="button" class="uk-button uk-button-primary uk-button-small" data-i18n="Change trust limit" ';
                            assetOperations += ' id="change-limit-' + item.asset_code + '" disabled></button>';
                          }
                          assets += '<div data-asset-balance><b>' + item.asset_code + '</b>' + assetOperations;
                          assets += '<ul><li><span data-i18n="Balance"></span>: ' + item.balance;
                          assets += '</li><li><span data-i18n="Trust Limit"></span>: ' + item.limit;
                          assets += '</li><li><span data-i18n="Issuer"></span>: ' + item.asset_issuer;
                          assets += '</ul></div>';
                        }
                     });
                  }
                  $('#distributor-balances').html(lumens + assets);
                  $('#distributor-last-balance-msg').html('');
              })
              .fail(function(json) {
                  $('#distributor-last-balance-msg').text('Update balances error');
              })
              .always(function() {
                  $('#distributor-last-balance-msg').text(document.lastModified);
                  currentWindow.webContents.executeJavaScript('loadTranslations()');
              });
          } else if(status === 404) {
              MANAGE_ASSETS.sendNotification('In order to receiving an asset you must fund your account with 31 Lumens or more');
          }else{
              MANAGE_ASSETS.sendNotification('An unexpected error occurred. Check your connection');
          }
      });
  },

}


// Update balances
setInterval(function() {

    MANAGE_ASSETS.issuerLumensBalance(issuerPublic,network);
    MANAGE_ASSETS.distributorBalances(distributorPublic,issuerPublic,network);

    let issuerXlm = parseFloat($('#issuer-xlm-balance').text()) || 0;
    let distributorXlm = parseFloat($('#distributor-xlm-balance').text()) || 0;

    // TODO: minimum balance warning
    if (issuerXlm >= 31 && distributorXlm >= 31) {
      $('#issue-asset-button').prop('disabled', false);
    }
    else {
      $('#issue-asset-button').prop('disabled', true)
    }
    if (issuerXlm == 0 && network == 'test') {
      $('#issuer-get-lumens-button').show();
    }
    else {
      $('#issuer-get-lumens-button').hide();
    }
    if (distributorXlm == 0 && network == 'test') {
      $('#distributor-get-lumens-button').show();
    }
    else {
      $('#distributor-get-lumens-button').hide();
    }
}, 10000)


ipcRenderer.on('language-change', function(e, language) {
  	ipcMain.send('language-change', language);
});

$( document ).ready( MANAGE_ASSETS.onReady );
