<?php

	require_once(__DIR__ . '/server/version.php');
	require_once(__DIR__ . '/server/config.php');
	require_once(__DIR__ . '/server/log.php');
	require_once(__DIR__ . '/server/templates.php');
	require_once(__DIR__ . '/server/scripts.php');

	define('LINK_PRE', SERVER_ADDR . '/');

	$request = false;
	if (isset($_GET['request'])) {
		$request = explode('/', $_GET['request']);
	}
	if ($request === false) {
		$request = array();
	}
	if (count($request) >= 1) {
		$site = array_shift($request);
	} else {
		$site = '';
	}
	if ($site == '') {
		header('Location: ' . LINK_PRE . 'index');
		exit;
	}

	if (!file_exists(__DIR__ . '/server/content/' . $site . '.php')) {
		$site = '404';
	}

	$sp = [
		'title' => 'Regatten.net ' . $_CLASS['name'],     // This is the page title
		'backbutton' => false,               // Show a back button (true, false, string). If a string is given, the back button is a link to this page.
		'activenav' => false,                // Select which entry of bottom nav should be active (1-5). false for none
		'output' => '',                      // This is where the site content goes
		'menus' => '',                       // Additional menus go here
		'scripts' => ''                      // Site specific scripts
	];

	$tpl = new Templates(__DIR__ . '/server/templates/');
	$scripts = new Scripts(__DIR__ . '/server/scripts/');

	require_once(__DIR__ . '/server/content/' . $site . '.php');

	require_once(__DIR__ . '/server/buildpage.php');

?>
