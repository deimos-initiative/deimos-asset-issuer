var StellarSdk = require('stellar-sdk');

const {remote, ipcMain, ipcRenderer} = require('electron');

const appVersion = window.require('electron').remote.app.getVersion();

// TODO: better window autoresize
// let currentWindow = remote.getCurrentWindow();
// var contentSize = currentWindow.getContentSize();
// var baseWidth = $('.uk-container').width();
// var baseHeight = $('.uk-container').height();
// currentWindow.setContentSize(baseWidth + 100, baseHeight + 120);

const SAFE_KEYS = "#safe-keys";
const SAFE_KEYS_PLACEHOLDER = "#safe-keys-placeholder";
const CONTINUE = "#continue";
const ISSUER_ACCOUNT = "#issuer-account";
const DISTRIBUTOR_ACCOUNT = "#distributor-account";

const ACCOUNT = ".account";
const ACCOUNT_SIGN_METHOD = ".account-sign-method";

const PUBLIC_KEY = "public-key";
const SECRET_KEY = "secret-key";
const GENERATE_KEY_PAIR = "generate-key-pair";
const LANGUAGE = "language";

var LOGIN = {

	$accountKeysPlaceholder: null,
	$safeKeysPlaceholder: $( SAFE_KEYS_PLACEHOLDER ),

	onReady: function() {

		$( ACCOUNT_SIGN_METHOD ).change( LOGIN.onAccountSignMethodChange );

		$( CONTINUE ).click( LOGIN.validateForm );

		$( LANGUAGE ).val('en-US');		
		
        $( "#version" ).html( appVersion );
	},

	onAccountSignMethodChange: function() {

		var accountSignMethod = $( this ).val();
		var accountType = $( this ).closest( ACCOUNT ).attr( "id" );

		var publicKeyInput = accountType + "-" + PUBLIC_KEY;
		var secretKeyInput = accountType + "-" + SECRET_KEY;

		LOGIN.$accountKeysPlaceholder = $( "#" + accountType + "-keys-placeholder" );

		switch( accountSignMethod ) {

			case SECRET_KEY:

				LOGIN.clearPlaceholders();

				var $secretKeyDiv = LOGIN.createTextField({
					id: accountType + "-" + SECRET_KEY,
					"class": "uk-input",
					type: "password",
					"data-i18n": "[placeholder]Secret Key",
					//placeholder: "Secret Key"
				});

				LOGIN.$accountKeysPlaceholder.append( $secretKeyDiv );

				break;

			case GENERATE_KEY_PAIR:

				LOGIN.clearPlaceholders();

				var keyPair = StellarSdk.Keypair.random();

				var publicKey = keyPair.publicKey();
				var secretKey = keyPair.secret();

				var $publicKeyDiv = LOGIN.createTextFieldWithLabel( "Public Key:", {
					id: accountType + "-" + PUBLIC_KEY,
					"class": "uk-input uk-margin-small-top",
					type: "text",
					value: publicKey,
					readOnly: true,
					disabled: true
				});

				var $secretKeyDiv = LOGIN.createTextFieldWithLabel( "Secret Key:", {
					id: accountType + "-" + SECRET_KEY,
					"class": "uk-input uk-margin-small-top",
					type: "text",
					value: secretKey,
					readOnly: true,
					disabled: true
				});

				LOGIN.$accountKeysPlaceholder.append( $publicKeyDiv );
				LOGIN.$accountKeysPlaceholder.append( $secretKeyDiv );

				if ( LOGIN.$safeKeysPlaceholder.is( ':empty' )) {
					var safeKeysLabel = '<span data-i18n="Keep keys in a safe place"> </span>';

					var $safeKeysDiv = LOGIN.createCheckBoxWithLabel( "safe-keys", safeKeysLabel );
					LOGIN.$safeKeysPlaceholder.append( $safeKeysDiv );
					LOGIN.$safeKeysPlaceholder.localize();
				}

				LOGIN.sendNotification( "New key pair generated" );

				break;

		}

	},

	clearPlaceholders: function() {

		LOGIN.$accountKeysPlaceholder.empty();
		LOGIN.clearSafeKeysPlaceholder();

	},

	clearSafeKeysPlaceholder: function() {

		if ( LOGIN.countGeneratedKeyPairs() == 0 ) {
			LOGIN.$safeKeysPlaceholder.empty();
		}

	},

	countGeneratedKeyPairs: function() {

		var count = 0;

		$( ACCOUNT_SIGN_METHOD ).each( function( index ) {
			if ( $(this).val() == GENERATE_KEY_PAIR ) {
				count += 1;
			}
		})

		return count;

	},

	// TODO: create field builder
	createTextField: function( params ) {

        var $div = $("<div>", {
        	"class": "uk-form-controls uk-margin"
        });

        var $input = $( "<input>", params );

        $div.append( $input );
				$input.localize();

        return $div;

	},

	createTextFieldWithLabel: function( label, params ) {

		var $div = LOGIN.createTextField( params );

		var $label = $( "<label>", {
			html: label
		});

		$div.prepend( $label );

		return $div;
	},

	createCheckBoxWithLabel( id, label ) {

		var $div = $("<div>", {
			"class": "uk-margin uk-grid-small uk-child-width-auto uk-grid"
		});

		var $label = $("<label>", {
			html: label
		});

		var params = {
			id: "safe-keys",
			type: "checkbox",
			"class": "uk-checkbox",
			value: label
		};
		var $input = $( "<input>", params );

		$div.append( $label );
		$label.prepend( $input );

		return $div;

	},

	validateForm( event ) {

		event.preventDefault();

		var errors = {};
		var generatedKeys = false;

		var issuerAccountPublicKey = null;
		var issuerAccountSecretKey = null;
		var distributorAccountPublicKey = null;
		var distributorAccountSecretKey = null;
		var safeKeys = null;
		var network = null;
		var language =  null;

		switch( $( ISSUER_ACCOUNT ).find( "select" ).val() ) {

			case SECRET_KEY:
				issuerAccountSecretKey = $( "#issuer-account-secret-key" ).val();

				try {
					issuerAccountPublicKey = StellarSdk.Keypair.fromSecret( issuerAccountSecretKey ).publicKey();
				} catch(err) {
					errors[ "#issuer-account-secret-key" ] = "Invalid issuer account checksum";
				}

				break;

			case GENERATE_KEY_PAIR:
				generatedKeys = true;

				issuerAccountPublicKey = $( "#issuer-account-public-key" ).val();
				issuerAccountSecretKey = $( "#issuer-account-secret-key" ).val();

				try {
					if( StellarSdk.Keypair.fromSecret( issuerAccountSecretKey ).publicKey() != issuerAccountPublicKey) {
						errors[ "#issuer-account-public-key" ] = "Invalid issuer account public key. Please, generate a new key pair";
					}
				} catch(err) {
					errors[ "#issuer-account-secret-key" ] = "Invalid issuer account checksum. Please, generate a new key pair";
				}

				break;

		}

		switch( $( DISTRIBUTOR_ACCOUNT ).find( "select" ).val() ) {

			case SECRET_KEY:
				distributorAccountSecretKey = $( "#distributor-account-secret-key" ).val();

				try {
					distributorAccountPublicKey = StellarSdk.Keypair.fromSecret( distributorAccountSecretKey ).publicKey();
				} catch(err) {
					errors[ "#distributor-account-secret-key" ] = "Invalid distributor account checksum";
				}

				break;

			case GENERATE_KEY_PAIR:
				generatedKeys = true;

				distributorAccountPublicKey = $( "#distributor-account-public-key" ).val();
				distributorAccountSecretKey = $( "#distributor-account-secret-key" ).val();

				try {
					if( StellarSdk.Keypair.fromSecret( distributorAccountSecretKey ).publicKey() != distributorAccountPublicKey) {
						errors[ "#distributor-account-public-key" ] = "Invalid distributor account public key. Please, generate a new key pair";
					}
				} catch(err) {
					errors[ "#distributor-account-secret-key" ] = "Invalid distributor account checksum. Please, generate a new key pair";
				}

				break;

		}

		if (generatedKeys && !$( "#safe-keys" ).is( ":checked" ) ) {
			errors[ "#safe-keys" ] = "A new account was created. You must check the box";
			LOGIN.sendNotification( "You must confirm the keys were kept in a safe place" );
		}

		network = $( "#network" ).val();
		language = $( "#language" ).val();

		for (var key in errors) {
			if (key == "#safe-keys") continue;
			LOGIN.sendNotification( errors[key] );
		}

		if (Object.keys(errors).length == 0) {
			let keys = {
		    issuer: issuerAccountSecretKey,
		    distributor: distributorAccountSecretKey
		  }

			LOGIN.goToMain(keys,network,language);
		}

	},

	goToMain(keys,network,language) {
	  	ipcRenderer.send('signin-click', {'keys': keys, 'network': network, 'language': language});
	},

	sendNotification( msg ) {

		UIkit.notification('<span uk-icon="icon: file-edit; ratio: 1"></span><span class="notification" data-i18n="' + msg + '"></span>', {
			status: 'primary',
			pos: 'top-center',
			timeout: 10000
		});
		$('.notification').localize();

	}

};

$( document ).ready( LOGIN.onReady );

ipcRenderer.on('signin-click', function(e, params){
  	ipcMain.send('signin-click', params);
});
