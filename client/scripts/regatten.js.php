<?php
	
	header('Content-Type: text/javascript');
	
	require_once(__DIR__ . '/../../server/config.php');
	
?>

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
	var div = '<div id="' + id + '" class="snackbar-toast ' + color + '" ' + delay + '>';
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

var initRegatten = function() {
	loggedin = true;
	if (typeof siteScript !== 'undefined') {
		siteScript();
	}
}