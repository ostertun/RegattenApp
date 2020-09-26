<?php
	
	header('Content-Type: text/javascript');
	
	require_once(__DIR__ . '/../../server/config.php');
	
?>

const QUERY_URL = '<?php echo SERVER_ADDR; ?>/api/';
const BOATCLASS = '<?php echo BOATCLASS; ?>';
const LINK_PRE = '<?php echo SERVER_ADDR; ?>/';
const YOUTH_AGE = '<?php echo $_CLASS['youth-age']; ?>';
const YOUTH_GERMAN_NAME = '<?php echo $_CLASS['youth-german-name']; ?>';

var randomId = function() { return '_' + Math.random().toString(36).substr(2, 9); }

var badges = {
	more: {
		id: 'badge-footer-more',
		cnt: 0,
		childs: {
			news: {
				id: 'badge-more-news',
				cnt: 0
			}
		}
	}
};

/**
 * updateBadge - updates the count in pre-defined badges
 *  name - name of the badge (e.g. 'more/news'), must exist and must not have childs
 *  val - new value for badge ('+2' or '-4' for increase/decrease current value)
 *  returns true, if badge was updated, false on error
 */
var updateBadge = function (name, val) {
	const names = name.split('/');
	if (!(names[0] in badges)) return false;
	var badge = [badges[names[0]]];
	var cnt = names.length;
	for (i = 1; i < cnt; i ++) {
		if (!('childs' in badge[i-1]) || !(names[i] in badge[i-1].childs)) return false;
		badge[i] = badge[i-1].childs[names[i]];
	}
	if ('childs' in badge[cnt-1]) return false;
	if (String(val).substr(0, 1) == '+') val = parseInt(badge[cnt-1].cnt) + parseInt(String(val).substr(1));
	else if (String(val).substr(0, 1) == '-') val = parseInt(badge[cnt-1].cnt) - parseInt(String(val).substr(1));
	badge[cnt-1].cnt = parseInt(val);
	$('#' + badge[cnt-1].id).text(val == 0 ? '' : val);
	for (i = cnt - 2; i >= 0; i --) {
		var sum = 0;
		for (b in badge[i].childs) {
			sum += badge[i].childs[b].cnt;
		}
		badge[i].cnt = sum
		$('#' + badge[i].id).text(sum == 0 ? '' : sum);
	}
	return true;
}

/**
 * makeToast - creates a snackbar toast
 *  color - css class as bg-color / font-color (e.g. 'bg-highlight color-white')
 *  icon - font awesome icon
 *  text - text to be displayed
 *  time - time after which toast is hidden (ms), 0 to disable auto-hide
 *  returns id of created toast (needed for manual hide)
 */
var makeToast = function (color, icon, text, time) {
	var id = 'snackbar' + randomId();
	var delay = (time > 0 ? 'data-delay="' + time + '" data-autohide="true"' : 'data-autohide="false"');
	var div = '<div id="' + id + '" class="snackbar-toast pt-3 pb-3 ' + color + '" ' + delay + ' style="line-height: 2em;">';
	div += '<i class="fa ' + icon + ' mr-3"></i>' + text + '</div>';
	$('#page').append(div);
	$('#' + id).toast('show');
	if (time > 0) {
		setTimeout(function(){
			$('#' + id).remove();
		}, parseInt(time) + 1000);
	}
	return id;
}
/**
 * closeToast - hides a toast
 *  id - id of toast to be hidden
 */
var closeToast = function (id) {
	$('#' + id).toast('hide');
	setTimeout(function(){
		$('#' + id).remove();
	}, 1000);
}
/**
 * toastType - creates a pre-defined toast (Load, Ok, Warn, Info, Error)
 *  text - text to be displayed
 *  time (optional) - time after which toast is hidden(ms), 0 to disable auto-hide
 *  returns id of created toast (needed for manual hide)
 */
var toastLoad  = function (text, time = 3000) { return makeToast('bg-highlight color-white', 'fa-sync fa-spin', text, time); }
var toastOk    = function (text, time = 3000) { return makeToast('bg-green1-dark', 'fa-check', text, time); }
var toastWarn  = function (text, time = 3000) { return makeToast('bg-yellow1-dark', 'fa-info', text, time); }
var toastInfo  = function (text, time = 3000) { return makeToast('bg-blue2-dark', 'fa-info', text, time); }
var toastError = function (text, time = 3000) { return makeToast('bg-red2-dark', 'fa-times', text, time); }

function findGetParameter(parameterName) {
	var result = null;
	var tmp = [];
	location.search
		.substr(1)
		.split("&")
		.forEach(function (item) {
			tmp = item.split("=");
			if (tmp[0] === parameterName) {
				result = decodeURIComponent(tmp[1]);
			}
		});
	return result;
}

var login = function() {
	showLoader();
	var username = $('#input-login-username').val();
	var password = $('#input-login-password').val();
	$('#input-login-username').val('');
	$('#input-login-password').val('');
	$.ajax({
		url: QUERY_URL + 'login',
		method: 'POST',
		data: {
			username: username,
			password: password,
			device: navigator.userAgent
		},
		error: function (xhr, status, error) {
			if (xhr.status == 401) {
				toastError('Benutzername oder Passwort falsch');
				$('#input-login-username').val(username);
			} else if (xhr.status == 0) {
				toastError('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um Dich anzumelden');
				$('#menu-login').hideMenu();
			} else {
				console.log('Login: unbekannter Fehler', status, error);
				console.log(xhr);
				toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
			}
			hideLoader();
		},
		success: function (data, status, xhr) {
			localStorage.setItem('auth_id', data.id);
			localStorage.setItem('auth_hash', data.auth);
			localStorage.setItem('auth_user', data.user);
			localStorage.setItem('auth_username', data.username);
			resetDb();
			location.reload();
		}
	});
}

var logoutClearStorage = function() {
	resetDb();
	localStorage.removeItem('auth_id');
	localStorage.removeItem('auth_hash');
	localStorage.removeItem('auth_user');
	localStorage.removeItem('auth_username');
	location.reload();
}

var logout = function() {
	showLoader();
	var auth = {
		id: localStorage.getItem('auth_id'),
		hash: localStorage.getItem('auth_hash')
	}
	if ((auth.id === null) || (auth.hash === null)) {
		console.log('Not logged in');
		logoutClearStorage();
		return;
	}
	$.ajax({
		url: QUERY_URL + 'logout',
		method: 'POST',
		data: {
			auth: auth
		},
		error: function (xhr, status, error) {
			if (xhr.status == 401) {
				console.log('Not logged in');
				logoutClearStorage();
			} else if (xhr.status == 0) {
				console.log('Could not delete auth from server');
				logoutClearStorage();
			} else {
				console.log('Logout: unbekannter Fehler', status, error);
				console.log(xhr);
				toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
				hideLoader();
			}
		},
		success: function (data, status, xhr) {
			logoutClearStorage();
		}
	});
}

function resetCache() {
	$('#menu-developer').hideMenu();
	navigator.serviceWorker.getRegistrations().then(function (registrations) {
		for (let registration of registrations) {
			console.log('Unregister sW:', registration);
			registration.unregister();
		}
	});
	caches.keys().then((keyList) => {
		return Promise.all(keyList.map((key) => {
			console.log('Cache deleted:', key);
			return caches.delete(key);
		}));
	});
	toastInfo('The serviceWorker and the cache were deleted. A new serviceWorker will be generated on the next refresh.');
}

var initRegatten = function() {
	showLoader();
	
	initDatabase();
	
	if (isLoggedIn()) {
		$('.show-loggedin').show();
		$('.show-notloggedin').hide();
		if ($('.replace-userid-href').length > 0)
			$('.replace-userid-href').attr('href', $('.replace-userid-href').attr('href').replace('%USERID%', USER_ID));
		if ($('.replace-username').length > 0)
			$('.replace-username').html(USER_NAME);
	} else {
		$('.show-loggedin').hide();
		$('.show-notloggedin').show();
	}
}