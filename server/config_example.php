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
	$_CLASSES = array(
		'pirat' => [
			'name' => [
				'de' => 'Pirat',
				'en' => 'Pirate'
			],
			'desc' => [
				'de' => 'eine vom DSV gef&ouml;rderte Jugendmeisterschaftsklasse',
				'en' => 'a DSV sponsored youth championship class'
			],
			'special' => [
				'de' => 'Jugend',
				'en' => 'Youth'
			],
			'youth-age' => 19,
			'youth-german-name' => 'IDJM'
		],
		'teeny' => [
			'name' => [
				'de' => 'Teeny',
				'en' => 'Teeny'
			],
			'desc' => [
				'de' => 'die offizielle 2-Mann Bootsklasse des DSV f&uuml;r den J&uuml;ngstenbereich',
				'en' => 'the official 2-man boat class of the DSV for the youngest area'
			],
			'special' => false,
			'youth-age' => 15,
			'youth-german-name' => 'IDJüM'
		]
	);
	
?>