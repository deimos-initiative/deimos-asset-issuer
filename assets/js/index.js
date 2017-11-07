$(document).ready(function() {

	$(".account-sign-method").change(function() {
		accountSignMethod = $(this).val()
		accountType = $(this).data("account-type")

		publicKeyInput = accountType + "-public-key"
		secretKeyInput = accountType + "-secret-key"

		$accountKeysPlaceholder = $("#" + accountType + "-keys-placeholder")
		$safeKeysPlaceholder = $("#safe-keys-placeholder")

		switch(accountSignMethod) {
		    case "do-nothing":
		    	// TODO: sintetizar ambos clear em uma única função
		        $accountKeysPlaceholder.empty()
		        clearSafeKeysPlaceholder()
		        break;
		    case "generate-key-pair":
		    	$accountKeysPlaceholder.empty()
		    	clearSafeKeysPlaceholder()

		    	keyPair = generateKeyPair()		    	
		    	publicKey = keyPair["publicKey"] 
		    	secretKey = keyPair["secretKey"]

		    	$publicKeyDiv = buildTextField("Public Key", publicKeyInput, "text", true, true, publicKey)			    	
		    	$accountKeysPlaceholder.append($publicKeyDiv)

		    	$secretKeyDiv = buildTextField("Secret Key", secretKeyInput, "text", true, true, secretKey)			    	
		    	$accountKeysPlaceholder.append($secretKeyDiv)
		    	
		    	if ($safeKeysPlaceholder.is(':empty')){
			    	safeKeysId = "safe-keys"
			    	safeKeysLabel = " I state the keys were kept in a safe place. I understand that once lost the account cannot be recovered."
			    	$safeKeysDiv = buildCheckBox(safeKeysLabel, safeKeysId)			    	
			    	
			    	$safeKeysPlaceholder.append($safeKeysDiv)				
				}

				sendNotification("New key pair generated!")

		        break;
		    case "public-key":
		    	$accountKeysPlaceholder.empty()
		    	clearSafeKeysPlaceholder()

			    $publicKeyDiv = buildTextField("Public Key", publicKeyInput, "text")			    	
			    $accountKeysPlaceholder.append($publicKeyDiv)

		        break
		    case "secret-key":
		    	$accountKeysPlaceholder.empty()
		    	clearSafeKeysPlaceholder()
			    
			    $secretKeyDiv = buildTextField("Secret Key", secretKeyInput, "password")			    	
			    $accountKeysPlaceholder.append($secretKeyDiv)

		        break
		}
	})

	$("#continue").click(function() {
		/* TODO: validar casos de erro
			issuer-account / distributor-account
			do-nothing + do-nothing => deve informar ao menos uma conta para fazer login
			generated || public || secret + do-nothing => ok
			do-nothing + generated || public || secret => ok
			generated || public || secret + generated || public || secret => ok

			se alguma conta for gerada => deve marcar o checkbox

			em caso de erros => destacar os campos preenchidos de forma correta e incorreta (https://getuikit.com/docs/form)

			ao final => guardar todas variáveis disponíveis no form
		*/
		network = $("#network").val()
		language = $("#language").val()

		if(countGeneratedKeyPairs() > 0) {
			safeKeys = $("#safe-keys").is(":checked")

			console.log("safeKeys: ", safeKeys)
		}


		console.log("network: ", network)
		console.log("language: ", language)
	})

})

// TODO: criar builder unificado que trabalhe com dicionário de params
function buildTextField(label, id, type, readOnly = false, disabled = false, value = "") {
	$outerDiv = $("<div>", { 
		"class": "uk-margin" 
	})

	$label = $("<label>", { 
		html: label, 
		for: id, 
		"class": "uk-form-label" 
	})

	$innerDiv = $("<div>", { 
		"class": "uk-form-controls" 
	})

	$input = $("<input>", { 
		type: type, 
		value: value, 
		id: id, 
		"class": "uk-input"
	})

	if (readOnly) {
		$input.attr("readonly", "readonly")
	}

	if (disabled) {
		$input.attr("disabled", "disabled")
	}

	$innerDiv.append($input)
	$outerDiv.append($label)
	$outerDiv.append($innerDiv)

	return $outerDiv
}

function buildCheckBox(label, id, type = "checkbox", readOnly = false, value = "") {
	$div = $("<div>", { 
		"class": "uk-margin uk-grid-small uk-child-width-auto uk-grid" 
	})

	$label = $("<label>", { 
		html: label
	})

	$input = $("<input>", { 
		type: type, 
		value: value, 
		id: id, 
		"class": "uk-checkbox"
	})

	$div.append($label)
	$label.prepend($input)

	return $div
}

function generateKeyPair() {
	keyPair = {}
	
	// TODO: obter chaves da API
	keyPair["publicKey"] = "GD5T6IPRNCKFOHQWT264YPKOZAWUMMZOLZBJ6BNQMUGPWGRLBK3U7ZNP"
	keyPair["secretKey"] = "SDQXUYNUW36UG3BPJSJIV3OPGJGKWKCQ3IOSFIVG3KBV4SSRWWELIYTQ"

	return keyPair;
}

function clearSafeKeysPlaceholder() {
	if (countGeneratedKeyPairs() == 0) {
		$("#safe-keys-placeholder").empty()
	}
}

function countGeneratedKeyPairs() {
	count = 0

	$(".account-sign-method").each(function(index) {
		if ($(this).val() == "generate-key-pair") {
			count += 1
		}
	})

	return count
}

// TODO: melhorar visual da notificação ou substituir por alert (https://getuikit.com/docs/alert)
function sendNotification(msg) {
	UIkit.notification("<span uk-icon='icon: file-edit; ratio: 1'></span> " + msg, {
		status: 'primary',
		pos: 'top-center',
		timeout: 3000
	});
}