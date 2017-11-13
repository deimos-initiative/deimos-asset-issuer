'use strict'

var StellarSdk = require('stellar-sdk');

const {remote, ipcRenderer, ipcMain} = require('electron');

let currentWindow = remote.getCurrentWindow();
// TODO: better window autoresize
currentWindow.setContentSize(700, 700);

const issuerPair = StellarSdk.Keypair.fromSecret(remote.getGlobal('secretKeys').issuer);
const distributorPair = StellarSdk.Keypair.fromSecret(remote.getGlobal('secretKeys').distributor);
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


const ISSUE_NEW_ASSET = "#issue-new-asset-button";

var NEW_ASSET = {
  onReady: function() {

    $( ISSUE_NEW_ASSET ).click( NEW_ASSET.validateForm );
    $('#issue-new-asset-button').attr('uk-spinner');
    $('#close-window').click(function() {
        currentWindow.close();
    });

    $('#issuer-public-key').text(issuerPair.publicKey());
    $('#distribuitor-public-key').text(distributorPair.publicKey());

  },

  issueNewAsset(issuerKeys,distributorKeys) {
      // TODO: validate values and formats
      let assetCode = $('#new-asset-code').val();
      let assetLimit = $('#new-asset-trust-limit').val();
      let assetSendAmount = $('#new-asset-initial-amount').val();

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
        return stellarServer.loadAccount(issuerKeys.publicKey());
      })
      .then(function(issuer) {
        var transaction = new StellarSdk.TransactionBuilder(issuer)
          .addOperation(StellarSdk.Operation.payment({
            destination: distributorKeys.publicKey(),
            asset: newAsset,
            amount: assetSendAmount
          }))
          .build();
        transaction.sign(issuerKeys)
        return stellarServer.submitTransaction(transaction);
      })
      .then(function(transaction) {
        // TODO: show success message before close
        currentWindow.close();

      })
      .catch(function(error) {
        //TODO: show error message
        console.error('Error!', error);
      })
  },

  validateForm( event ) {

		event.preventDefault();

		var errors = {};

		var newAssetCode = $('#new-asset-code').val() || '';
		var assetTrustLimit = parseFloat($('#new-asset-trust-limit').val()) || 0;
		var assetInitialAmount = parseFloat($('#new-asset-initial-amount').val()) || 0;
    console.log(assetTrustLimit);
    console.log(assetInitialAmount);
    if (newAssetCode.length === 0 || newAssetCode.length > 12) {
      errors[ "#new-asset-code" ] = "Invalid asset code. The code length must be between 1 and 12 characters";
    }

    if (assetTrustLimit <= 0) {
        errors[ "#new-asset-trust-limit" ] = "Invalid trust limit. Trust limit must be greater than 0";
    }

    if (assetInitialAmount <= 0) {
        errors[ "#new-asset-initial-amount" ] = "Invalid amount. Amount to send must be greater than 0";
    }

    if (assetInitialAmount > assetTrustLimit) {
        errors[ "#new-asset-initial-amount-greater" ] = "Invalid amount. Amount to send must be equal or less than trust limit";
    }

		for (var key in errors) {
			NEW_ASSET.sendNotification(errors[key]);
		}

		if (Object.keys(errors).length == 0) {
        NEW_ASSET.issueNewAsset(issuerPair,distributorPair);
        $('#issue-new-asset-button').prop('disabled', true);
        $('#new-asset-spinner').show();
        $('#close-window').hide();
		}

	},

  sendNotification( msg ) {
    // TODO: fix translations for modal window
    UIkit.notification('<span uk-icon="icon: file-edit; ratio: 1"></span><span class="notification" data-i18n="' + msg + '">'+msg+'</span>', {
      status: 'primary',
      pos: 'top-center',
      timeout: 10000
    });
    $('.notification').localize();
  }
}

$( document ).ready( NEW_ASSET.onReady );
