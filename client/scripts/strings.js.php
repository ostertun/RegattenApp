<?php
	
	header('Content-Type: text/javascript');
	
	require_once(__DIR__ . '/../../server/config.php');
	
?>
const strings = {
	inetMsgOffline: "Keine Internet-Verbindung erkannt",
	inetMsgOnline: "Du bist wieder online",
	error_network: "Verbindung fehlgeschlagen.<br>Stelle sicher, dass Du mit dem Internet verbunden bist und versuche es erneut!",
	months_short: [
		'Jan.',
		'Feb.',
		'März',
		'Apr.',
		'Mai',
		'Juni',
		'Juli',
		'Aug.',
		'Sep.',
		'Okt.',
		'Nov.',
		'Dez.'
	],
	months_long: [
		'Januar',
		'Februar',
		'März',
		'April',
		'Mai',
		'Juni',
		'Juli',
		'August',
		'September',
		'Oktober',
		'November',
		'Dezember'
	],
	weekdays_short: [
		'So',
		'Mo',
		'Di',
		'Mi',
		'Do',
		'Fr',
		'Sa'
	],
	weekdays_long: [
		'Sonntag',
		'Montag',
		'Dienstag',
		'Mittwoch',
		'Donnerstag',
		'Freitag',
		'Samstag'
	]
}