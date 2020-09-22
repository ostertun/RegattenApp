<?php
	
	require_once(__DIR__ . '/../server/config.php');
	require_once(__DIR__ . '/config.php');
	require_once(__DIR__ . '/../server/log.php');
	require_once(__DIR__ . '/database.php');
	require_once(__DIR__ . '/login.php');
	
	$request = false;
	if (isset($_GET['request'])) {
		$request = explode('/', $_GET['request']);
	}
	if ($request === false) {
		$request = array();
	}
	if (count($request) >= 1) {
		$action = array_shift($request);
	} else {
		$action = '';
	}
	
	define('DONE_OKAY', 0);
	define('DONE_EMPTY', 1);
	define('DONE_DATABASE', 2);
	define('DONE_UNAUTHORIZED', 3);
	define('DONE_BAD_REQUEST', 4);
	define('DONE_CONFLICT', 5);
	define('DONE_SERVER_ERROR', 6);
	function done($donecode, $content = null) {
		switch ($donecode) {
			case DONE_OKAY:
				header('HTTP/1.0 200 OK');
				break;
			case DONE_EMPTY:
				header('HTTP/1.0 204 No Content');
				break;
			case DONE_DATABASE:
				header('HTTP/1.0 500 Internal Server Error');
				if ($content === null) {
					$content = array('error' => 'database error');
				}
				break;
			case DONE_UNAUTHORIZED:
				header('HTTP/1.0 401 Unauthorized');
				if ($content === null) {
					$content = array('error' => 'unauthorized');
				}
				break;
			case DONE_BAD_REQUEST:
				header('HTTP/1.0 400 Bad Request');
				if ($content === null) {
					$content = array('error' => 'bad request');
				}
				break;
			case DONE_CONFLICT:
				header('HTTP/1.0 409 Conflict');
				break;
			case DONE_SERVER_ERROR:
				header('HTTP/1.0 500 Internal Server Error');
				break;
			default:
				header('HTTP/1.0 500 Internal Server Error');
				break;
		}
		header('Content-Type: application/json');
		if ($content !== null) {
			echo json_encode($content);
		} else {
			echo '{  }';
		}
		exit;
	}
	
	if (isset($_REQUEST['auth']['id'], $_REQUEST['auth']['hash'])) {
		$user_id = auth_check($mysqli, $_REQUEST['auth']['id'], $_REQUEST['auth']['hash']);
	} else {
		$user_id = false;
	}
	$perm = get_perm($mysqli, $user_id);
	
	function has_perm($permission) {
		global $perm;
		return ($perm & $permission) == $permission;
	}
	
	function checkPermission($perm) {
		if (!has_perm($perm)) done(DONE_UNAUTHORIZED, ['error' => 'permission denied']);
	}
	
	function checkRequest($param) {
		if (!isset($_REQUEST[$param])) done(DONE_BAD_REQUEST, ['error' => 'missing parameter: ' . $param]);
	}
	
	function replaceChanged($array) {
		return array_map(function ($entry) {
			unset($entry['changed']);
			return $entry;
		}, $array);
	}
	
	switch ($action) {
		
		case 'login':
			checkRequest('username');
			checkRequest('password');
			checkRequest('device');
			$auth = auth_login($mysqli, $_REQUEST['username'], $_REQUEST['password'], $_REQUEST['device']);
			if ($auth === false) done(DONE_UNAUTHORIZED);
			done(DONE_OKAY, $auth);
			break;
		
		case 'logout':
			checkPermission(PERM_REGISTERED);
			auth_logout($mysqli, $_REQUEST['auth']['id']);
			done(DONE_OKAY);
			break;
		
		default:
			done(DONE_BAD_REQUEST, ['error' => 'action invalid']);
		
	}
	
?>