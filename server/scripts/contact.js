function sendMessage() {
	var name = $('#input-name').val();
	var email = $('#input-email').val();
	var subject = $('#input-subject').val();
	var message = $('#input-message').val();

	if ((name == '') || (email == '') || (subject == '') || (message == '')) {
		toastError('Bitte f&uuml;lle alle Felder aus!');
		return;
	}

	showLoader();
	$.ajax({
		url: QUERY_URL + 'contact',
		method: 'POST',
		data: {
			name: name,
			email: email,
			subject: subject,
			message: message
		},
		error: function (xhr, status, error) {
			if (xhr.status == 0) {
				toastError('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um eine Nachricht zu versenden');
			} else {
				console.log('Contact: unbekannter Fehler', status, error);
				console.log(xhr);
				toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
			}
			hideLoader();
		},
		success: function (data, status, xhr) {
			toastOk('Nachricht erfolgreich versandt!');
			$('#input-subject').val('').trigger('focusin').trigger('focusout');
			$('#input-message').val('').trigger('focusin').trigger('focusout');
			hideLoader();
		}
	});
}

var siteScript = async function () {
	if (isLoggedIn()) {
		var user = await dbGetData('users', USER_ID);
		$('#input-name').val(user.username).trigger('focusin').trigger('focusout');
		$('#input-email').val(user.email).trigger('focusin').trigger('focusout');
	}
	$('#button-send').click(sendMessage);
	hideLoader();
}
