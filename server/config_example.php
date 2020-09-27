<?php
	
	// ERROR REPORTING
	error_reporting(0);   // disable error reporting in browser
	define('SEND_ERRORS', true);   // send errors via log
	
	define('BOATCLASS', 'pirat');
	
	date_default_timezone_set('Europe/Berlin');
	define('SERVER_PATH', '/subfolder');  // path to root directory
	define('SERVER_ADDR', 'https://' . $_SERVER['SERVER_NAME'] . SERVER_PATH);  // path to root directory
	define('QUERY_URL', 'http://' . $_SERVER['SERVER_NAME'] . '/api/' . BOATCLASS . '/');  // url to api backend
	define('LOGGING_APIKEY', 'xxx');  // Apikey for Logging API -> get from ostertun.net/logging
	
	// PUSH
	define('PUSH_SERVER_KEY', '');
	
	// BOAT CLASS
	$_CLASS = array(
		'name' => 'Pirat',
		'desc' => 'eine vom DSV gef&ouml;rderte Jugendmeisterschaftsklasse',
		'special' => 'Jugend',
		'youth-age' => 19,
		'youth-german-name' => 'IDJM'
	);
	
?>