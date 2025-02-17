<?php

	header('Content-Type: text/javascript');

	require_once(__DIR__ . '/../../server/config.php');
	require_once(__DIR__ . '/../../server/version.php');

// QUERY_URL changed in config.php (this is to update this file on client devices)

?>

const QUERY_URL = '<?php echo QUERY_URL; ?>';
const BOATCLASS = '<?php echo BOATCLASS; ?>';
const LINK_PRE = '<?php echo SERVER_ADDR; ?>/';
const PUSH_SERVER_KEY = '<?php echo PUSH_SERVER_KEY; ?>';

var consoleOutput = [];

function onConsoleOutput(entry) {
	consoleOutput.push(entry);
}

window.onerror = function(message, source, lineno, colno, errorError) {
	if (source.startsWith(LINK_PRE)) {
		source = source.substr(LINK_PRE.length);
	}
	var pos = source.indexOf('?');
	if (pos >= 0) {
		source = source.substr(0, pos);
	}
	consoleOutput.push({
		message: message,
		stack: {
			caller: '',
			file: source,
			line: lineno,
			col: colno
		}
	});
}

function log() {
	var now = new Date();
	var hour = now.getHours().toString();
	var min = now.getMinutes().toString();
	var sec = now.getSeconds().toString();
	var millis = now.getMilliseconds().toString();
	hour = (hour.length < 2 ? '0' + hour : hour);
	min = (min.length < 2 ? '0' + min : min);
	sec = (sec.length < 2 ? '0' + sec : sec);
	while (millis.length < 3) millis = '0' + millis;
	console.log('[' + hour + ':' + min + ':' + sec + '.' + millis + ']', ...arguments);
}

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
	log('[app] Login');
	showLoader();
	var username = $('#input-login-username').val();
	var password = $('#input-login-password').val();
	$('#input-login-username').val('').trigger('focusin').trigger('focusout');
	$('#input-login-password').val('').trigger('focusin').trigger('focusout');
	$.ajax({
		url: QUERY_URL + 'login',
		method: 'POST',
		data: {
			username: username,
			password: password,
			device: navigator.userAgent
		},
		error: function (xhr, status, error) {
			log('[app] Login: error:', xhr.status, status);
			if (xhr.status == 401) {
				toastError('Benutzername oder Passwort falsch');
				$('#input-login-username').val(username).trigger('focusin').trigger('focusout');
			} else if (xhr.status == 0) {
				toastError('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um Dich anzumelden');
				$('#menu-login').hideMenu();
			} else {
				log('[app] Login: unbekannter Fehler', status, error);
				log(xhr);
				toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
			}
			hideLoader();
		},
		success: function (data, status, xhr) {
			log('[app] Login successful');
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
	log('[app] Logout');
	showLoader();
	var auth = {
		id: localStorage.getItem('auth_id'),
		hash: localStorage.getItem('auth_hash')
	}
	if ((auth.id === null) || (auth.hash === null)) {
		log('[app] Not logged in');
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
			log('[app] Logout: error:', xhr.status, status);
			if (xhr.status == 401) {
				log('[app] Not logged in');
				logoutClearStorage();
			} else if (xhr.status == 0) {
				log('[app] Could not delete auth from server');
				logoutClearStorage();
			} else {
				log('[app] Logout: unbekannter Fehler', status, error);
				log(xhr);
				toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
				hideLoader();
			}
		},
		success: function (data, status, xhr) {
			log('[app] Logout successful');
			logoutClearStorage();
		}
	});
}

function deleteDb() {
	log('[app] Deleting DB');
	$('#menu-developer').hideMenu();
	if (canUseLocalDB) {
		showLoader();
		var request = window.indexedDB.deleteDatabase('regatten_app_db_' + BOATCLASS);
		request.onerror = function (event) {
			log('[app] Cannot delete DB: ', event.target.errorCode);
			toastError('Beim Löschen der Datenbank ist ein Fehler aufgetreten.<br>Bitte melde diesen Fehler. (Dev-Menu => Problem melden)', 5000);
			hideLoader();
		}
		request.onsuccess = function (event) {
			log('[app] DB deleted');
			toastInfo('Die Datenbank wurde gelöscht. Die Seite lädt in wenigen Sekunden neu und erstellt damit eine neue Datenbank.', 10000);
			hideLoader();
			setTimeout(function(){ location.reload(); }, 3000);
		}
	} else {
		log('[app] DB not supported');
		toastWarn('Dein Gerät unterstützt kein lokales Speichern der Daten. Alle Daten werden direkt vom Server gezogen.<br>Entsprechend kannst Du die Datenbank auch nicht zurücksetzen.', 10000);
	}
}

function deleteCache() {
	log('[app] Deleting cache');
	$('#menu-developer').hideMenu();
	navigator.serviceWorker.getRegistrations().then(function (registrations) {
		for (let registration of registrations) {
			log('[app] Unregister sW:', registration);
			registration.unregister();
		}
	});
	caches.keys().then((keyList) => {
		return Promise.all(keyList.map((key) => {
			log('[app] Cache deleted:', key);
			return caches.delete(key);
		}));
	});
	toastInfo('Der serviceWorker und alle Caches wurden gelöscht. Die Seite lädt in wenigen Sekunden neu und erstellt damit neue Caches.', 10000);
	setTimeout(function(){ location.reload(); }, 3000);
}

var pushesPossible = false;

function urlB64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

function pushesSubscribe() {
	log('[app] Subscribing');
	const applicationServerKey = urlB64ToUint8Array(PUSH_SERVER_KEY);
	log('[app] Subscription app server key:', applicationServerKey);
	swRegistration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: applicationServerKey
	})
	.then(async function(subscription) {
		log('[app] Subscription:', subscription);
		if (await pushesUpdateServerSubscription(subscription, true)) {
			log('[app] Subscription: Sent to server, updating UI');
			dbSettingsSet('notify_endpoint_' + BOATCLASS, subscription.endpoint);
			updatePushSwitches();
			updatePushBadge();
		} else {
			$('#menu-pushes').hideMenu();
			log('[app] Failed to subscribe the user due to connection error');
			toastError('Da ist leider etwas schief gelaufen. Bitte stelle sicher, dass Du mit dem Internet verbunden bist und versuche es erneut.', 5000);
			pushesUnSubscribe(true);
		}
		hideLoader();
	})
	.catch(function(err) {
		$('#menu-pushes').hideMenu();
		log('[app] Failed to subscribe the user: ', err);
		toastError('Da ist leider etwas schief gelaufen. Bitte stelle sicher, dass Du mit dem Internet verbunden bist und versuche es erneut.', 5000);
		pushesUnSubscribe(true);
	});
}

function pushesUnSubscribe(silent = false) {
	log('[app] Unsubscribing');
	swRegistration.pushManager.getSubscription()
	.then(async function(subscription) {
		log('[app] Subscription:', subscription);
		if (subscription) {
			if (await pushesUpdateServerSubscription(subscription, false)) {
				log('[app] Subscription: Removed from server');
			} else {
				log('[app] Failed to unsubscribe the user due to connection error');
			}
			log('[app] Removing subscription');
			subscription.unsubscribe();
			log('[app] Subscription: Updating UI');
			$('#menu-pushes').hideMenu();
			dbSettingsSet('notify_endpoint_' + BOATCLASS, false);
			updatePushBadge();
			hideLoader();
			if (!silent) toastOk('Du erhältst ab sofort keine Benachrichtigungen mehr von uns.');
		}
	})
	.catch(function(error) {
		log('[app] Error unsubscribing', error);
		$('#menu-pushes').hideMenu();
		if (!silent) toastError('Da ist leider etwas schief gelaufen. Bitte versuche es erneut oder wende Dich an unseren Support.', 5000);
		updatePushBadge();
		hideLoader();
	});
}

function pushesUpdateServerSubscription(subscription, enabled) {
	return new Promise(function(resolve){
		log('[app] updateServer', enabled, subscription);
		$.ajax({
			url: QUERY_URL + (enabled ? 'add' : 'remove') + '_subscription',
			type: 'POST',
			data: { subscription: JSON.stringify(subscription) },
			success: function (data, textStatus, jqXHR) {
				log('[app] Subscription sent to server');
				resolve(true);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				log('[app] Error sending subscription to server');
				resolve(false);
			}
		});
	});
}

async function initPushSettings() {
	var items = [
		['notify_channel_' + BOATCLASS + '_news', true],
		['notify_channel_' + BOATCLASS + '_regatta_changed_my', true],
		['notify_channel_' + BOATCLASS + '_regatta_changed_all', false],
		['notify_channel_' + BOATCLASS + '_result_ready_my', true],
		['notify_channel_' + BOATCLASS + '_result_ready_all', true],
		['notify_channel_' + BOATCLASS + '_meldeschluss', true]
	];
	for (var i in items) {
		var item = items[i];
		if ((await dbSettingsGet(item[0])) == null) dbSettingsSet(item[0], item[1]);
	}
}

async function updatePushSwitches() {
	$('#switch-pushes-news').prop('checked', await dbSettingsGet('notify_channel_' + BOATCLASS + '_news'));
	$('#switch-pushes-regatta-changed-my').prop('checked', await dbSettingsGet('notify_channel_' + BOATCLASS + '_regatta_changed_my'));
	$('#switch-pushes-regatta-changed-all').prop('checked', await dbSettingsGet('notify_channel_' + BOATCLASS + '_regatta_changed_all'));
	$('#switch-pushes-result-ready-my').prop('checked', await dbSettingsGet('notify_channel_' + BOATCLASS + '_result_ready_my'));
	$('#switch-pushes-result-ready-all').prop('checked', await dbSettingsGet('notify_channel_' + BOATCLASS + '_result_ready_all'));
	$('#switch-pushes-meldeschluss').prop('checked', await dbSettingsGet('notify_channel_' + BOATCLASS + '_meldeschluss'));

	if ($('#switch-pushes').prop('checked')) {
		$('#p-pushes-info').show();
		$('.a-switch-pushes-channel-all').show();
		$('.a-switch-pushes-channel-my').show();
		if (!isLoggedIn()) {
			$('.a-switch-pushes-channel-my').find('div').remove();
			$('.a-switch-pushes-channel-my').find('.badge').text('nicht angemeldet');
		}
	} else {
		$('#p-pushes-info').hide();
		$('.a-switch-pushes-channel-all').hide();
		$('.a-switch-pushes-channel-my').hide();
	}
}

function pushesSubscribeClicked() {
	showLoader();
	if ($('#switch-pushes').prop('checked')) {
		pushesSubscribe();
	} else {
		pushesUnSubscribe();
	}
}

function pushesChannelClicked() {
	dbSettingsSet('notify_channel_' + BOATCLASS + '_news', $('#switch-pushes-news').prop('checked'));
	dbSettingsSet('notify_channel_' + BOATCLASS + '_regatta_changed_my', $('#switch-pushes-regatta-changed-my').prop('checked'));
	dbSettingsSet('notify_channel_' + BOATCLASS + '_regatta_changed_all', $('#switch-pushes-regatta-changed-all').prop('checked'));
	dbSettingsSet('notify_channel_' + BOATCLASS + '_result_ready_my', $('#switch-pushes-result-ready-my').prop('checked'));
	dbSettingsSet('notify_channel_' + BOATCLASS + '_result_ready_all', $('#switch-pushes-result-ready-all').prop('checked'));
	dbSettingsSet('notify_channel_' + BOATCLASS + '_meldeschluss', $('#switch-pushes-meldeschluss').prop('checked'));
}

function pushesOpenMenu() {
	$('#menu-settings').hideMenu();
	if (!pushesPossible) {
		toastWarn('Dein Browser unterst&uuml;tzt leider keine Benachrichtigungen.', 5000);
		return;
	}
	if (Notification.permission == 'denied') {
		toastWarn('Benachrichtigungen werden von Deinem Browser blockiert.', 5000);
		return;
	}

	swRegistration.pushManager.getSubscription().then(function(subscription) {
		var isSub = (subscription !== null);
		$('#switch-pushes').prop('checked', isSub);
		updatePushSwitches();
		$('#menu-pushes').showMenu();
	});
}

function updatePushBadge() {
	if (typeof onUpdatePushBadge === 'function') onUpdatePushBadge();
	if (!pushesPossible) return;
	if (Notification.permission == 'denied') {
		$('#badge-pushes').removeClass('bg-green2-dark').addClass('bg-red2-dark').text('BLOCKED');
		return;
	}
	swRegistration.pushManager.getSubscription().then(async function(subscription) {
		var dbSub = await dbSettingsGet('notify_endpoint_' + BOATCLASS);
		var isSub = (subscription !== null);
		log('[app] DB Subscription:', dbSub);
		log('[app] Real Subscription:', subscription);
		if (isSub) {
			$('#badge-pushes').removeClass('bg-red2-dark').addClass('bg-green2-dark').text('AN');
			if (dbSub === null) dbSettingsSet('notify_endpoint_' + BOATCLASS, subscription.endpoint);
			else if (dbSub !== subscription.endpoint) {
				if (navigator.onLine) {
					log('[app] Updating subscription');
					pushesSubscribe();
				}
			}
		} else {
			$('#badge-pushes').removeClass('bg-green2-dark').addClass('bg-red2-dark').text('AUS');
			if (dbSub === null) dbSettingsSet('notify_endpoint_' + BOATCLASS, false);
			else if (dbSub !== false) {
				if (navigator.onLine) {
					log('[app] Re subscribe');
					pushesSubscribe();
				}
			}
		}
	});
}

async function updateNewsBadge() {
	var newsRead = await dbSettingsGet('news_read_' + BOATCLASS);
	if (newsRead === null) dbSettingsSet('news_read_' + BOATCLASS, newsRead = new Date());
	var news = await dbGetData('news');
	var now = new Date();
	var sum = 0;
	for (var n in news) {
		var newsEntry = news[n];
		newsEntry.date = parseDbTimestamp(newsEntry.date);
		if (newsEntry.date > now) continue;
		if (newsEntry.date < newsRead) continue;
		sum ++;
	}
	updateBadge('more/news', sum);
}

var initRegatten = function() {
	showLoader();

	log('[app] Initializing DB...');

	initDatabase();

	log('[app] Loading app specific code...');

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

	// Pushes
	$('#a-switch-pushes').click(pushesSubscribeClicked);
	$('.a-switch-pushes-channel-all').click(pushesChannelClicked);
	$('.a-switch-pushes-channel-my').click(pushesChannelClicked);
}

var onServiceWorkerLoaded = function() {
	log('[app] sW loaded');
	if ((swRegistration !== null) && (swRegistration.pushManager) && canUseLocalDB) {
		pushesPossible = true;
		updatePushBadge();
	} else {
		$('#badge-pushes').removeClass('bg-green2-dark').addClass('bg-red2-dark').text('NOT SUPPORTED');
	}
}

var onDatabaseLoaded = function() {
	log('[app] DB loaded');
	if (!canUseLocalDB && !$('#menu-welcome').hasClass('menu-active')) {
		function NoDbWarningOk() {
			createCookie('regatten_nodb_banner', true, 1);
			$('#menu-nodb-warning').hideMenu();
		}
		function showNoDbWarning() {
			if (!readCookie('regatten_nodb_banner')) {
				$('#menu-nodb-warning').showMenu();
			}
		}
		$('#menu-nodb-warning-okay').click(NoDbWarningOk);
		showNoDbWarning();
	}

	onServiceWorkerLoaded();
	initPushSettings();

	updateNewsBadge();
}

var onAfterSync = function() {
	updateNewsBadge();
}

function sendErrorReport() {
	alert('FEHLERBERICHT\nEs wird jetzt ein Fehlerbericht an die Entwickler geschickt.\nBitte stelle sicher, dass Du mit dem Internet verbunden bist und drücke dann auf OK.');
	$.ajax({
		url: QUERY_URL + 'error_report',
		method: 'POST',
		data: {
			errors: JSON.stringify(consoleOutput),
			device: navigator.userAgent,
			version: '<?php echo PWA_VERSION; ?>'
		},
		error: function (xhr, status, error) {
			if (xhr.status == 0) {
				alert('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um den Fehlerbericht zu senden');
			} else {
				alert('Beim Senden ist ein unbekannter Fehler aufgetreten. Bitte versuche es noch einmal');
			}
		},
		success: function (data, status, xhr) {
			alert('Wir leiten Dich jetzt zum erstellten Fehlerbericht um, sodass Du ggf. weitere Informationen ergänzen kannst.');
			location.href = 'https://github.com/ostertun/RegattenApp/issues/' + data.issueNumber;
		}
	});
}

// Add console opener to preloader
var addConsoleOpenerToPreloader = function() {
	addConsoleOpenerToPreloader = function(){};
	var preloader = document.getElementById('preloader');
	var button = document.createElement('a');
	button.id = 'button-show-console';
	button.href = '#';
	button.classList = 'btn rounded-s text-uppercase font-900 shadow-m m-3 bg-red2-dark bg-white';
	button.style.position = 'fixed';
	button.style.bottom = 0;
	button.style.left = 0;
	button.style.right = 0;
	button.innerHTML = 'Fehlerbericht senden';
	button.onclick = function(){
		sendErrorReport();
		return false;
	}
	preloader.appendChild(button);
	$(button).hide();
}
addConsoleOpenerToPreloader();

function m2s_getLink(type, eventId, classId) {
	switch (type) {
		case 'entrylist':
			return 'https://manage2sail.com/de-DE/event/' + eventId + '#!/entries?classId=' + classId;
	}
	return '';
}
function ro_getLink(type, eventId, classId) {
	switch (type) {
		case 'entrylist':
			return 'http://www.raceoffice.org/entrylist.php?eid=' + eventId;
	}
	return '';
}
function wfn_getLink(type, eventId, classId) {
	switch (type) {
		case 'entrylist':
			return 'https://wettfahrten.net/event/' + eventId + '/entrylist?class=' + classId;
	}
	return '';
}
function extServiceGetLink(serviceName, type, eventId = '', classId = '') {
	switch (serviceName) {
		case 'm2s':
			return m2s_getLink(type, eventId, classId);
		case 'ro':
			return ro_getLink(type, eventId, classId);
		case 'wfn':
			return wfn_getLink(type, eventId, classId);
	}
	return '';
}
