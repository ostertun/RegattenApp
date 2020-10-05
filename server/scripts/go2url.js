var siteScript = function() {
	hideLoader();
	setTimeout(function() {
		var url = findGetParameter('url');
		if (url === null) {
			$('#card-title').find('p').html('Wir konnten Dich leider nicht umleiten.<br><a href="' + LINK_PRE + 'index">Hier kommst Du zur&uuml;ck zur Startseite</a>');
		} else {
			showLoader();
			location.href = url;
		}
	}, 2000);
}
