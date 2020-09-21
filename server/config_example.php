<?php
	
	// ERROR REPORTING
	error_reporting(0);   // disable error reporting in browser
	define('SEND_ERRORS', true);   // send errors via log
	
	date_default_timezone_set('Europe/Berlin');
	define('SERVER_GITDIR', __DIR__ . '/../.git/');  // path to git folder (with trailing slash)
	define('SERVER_PATH', '/subfolder');  // path to root directory
	define('SERVER_ADDR', 'https://' . $_SERVER['SERVER_NAME'] . SERVER_PATH);  // path to root directory
	define('LOGGING_APIKEY', 'xxx');  // Apikey for Logging API -> get from ostertun.net/logging
	
	define('PWA_VERSION', '1.0');
	
	// PUSH SERVER
	define('PUSH_AUTH', 'xxxxxxx'); // auth string for push.ostertun.net
	define('PUSH_SERVERKEY', 'xxxxxxx'); // server key from push.ostertun.net
	
	define('BOATCLASS', 'pirat');
	
	// BOAT CLASSES
	$_CLASS = array(
		'name' => 'Pirat',
		'desc' => 'eine vom DSV gef&ouml;rderte Jugendmeisterschaftsklasse',
		'special' => 'Jugend',
		'youth-age' => 19,
		'youth-german-name' => 'IDJM'
	);
	
?>