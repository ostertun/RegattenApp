<?php
	
	require_once(__DIR__ . '/../server/config.php');
	require_once(__DIR__ . '/config.php');
	require_once(__DIR__ . '/../server/log.php');
	require_once(__DIR__ . '/database.php');
	require_once(__DIR__ . '/login.php');
	require_once(__DIR__ . '/functions.php');
	
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
	
	function isLoggedIn() {
		global $user_id;
		return $user_id !== false;
	}
	
	function checkLoggedIn() {
		if (!isLoggedIn()) done(DONE_UNAUTHORIZED, ['error' => 'permission denied']);
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
	
	$whereString = false;
	if (isset($_REQUEST['index'], $_REQUEST['value'])) {
		$whereString = '`' . mysqli_real_escape_string($mysqli, $_REQUEST['index']) . '`="' . mysqli_real_escape_string($mysqli, $_REQUEST['value']) . '"';
	}
	
	function sendEntries($table) {
		global $mysqli, $whereString;
		$response = db_get_data($mysqli, $table, '*', $whereString);
		if ($response === false) done(DONE_DATABASE);
		$keys = array_keys($response);
		if (isset($_REQUEST['changed-after'])) {
			$response = db_get_data($mysqli, $table, '*', '`changed` > "' . mysqli_real_escape_string($mysqli, date('Y-m-d H:i:s', $_REQUEST['changed-after'])) . '"' . ($whereString ? (' AND ' . $whereString) : ''));
			if ($response === false) done(DONE_DATABASE);
		}
		$response = array_values($response);
		done(DONE_OKAY, array('data' => replaceChanged($response), 'keys' => $keys));
	}
	
	function sendEntry($table) {
		global $mysqli;
		checkRequest('id');
		$response = db_get_data($mysqli, $table, '*', '`id` = "' . mysqli_real_escape_string($mysqli, $_REQUEST['id']) . '"');
		if ($response === false) done(DONE_DATABASE);
		if (count($response) != 1) done(DONE_BAD_REQUEST, ['error' => 'id not found']);
		$response = array_values($response)[0];
		unset($response['changed']);
		done(DONE_OKAY, ['data' => $response]);
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
			checkLoggedIn();
			auth_logout($mysqli, $_REQUEST['auth']['id']);
			done(DONE_OKAY);
			break;
		
		case 'get_update_time':
			$times = array();
			$response = db_get_data($mysqli, DB_TABLE_UPDATETIMES, '`update`', '`table` = "' . DB_TABLE_CLUBS . '"', 1);
			if (($response !== false) and (count($response) > 0)) {
				$times['clubs'] = strtotime(array_values($response)[0]['update']);
			} else {
				done(DONE_DATABASE);
			}
			$response = db_get_data($mysqli, DB_TABLE_UPDATETIMES, '`update`', '`table` = "' . BOATCLASS . DB_TABLE_SUFFIX_BOATS . '"', 1);
			if (($response !== false) and (count($response) > 0)) {
				$times['boats'] = strtotime(array_values($response)[0]['update']);
			} else {
				done(DONE_DATABASE);
			}
			$response = db_get_data($mysqli, DB_TABLE_UPDATETIMES, '`update`', '`table` = "' . BOATCLASS . DB_TABLE_SUFFIX_SAILORS . '"', 1);
			if (($response !== false) and (count($response) > 0)) {
				$times['sailors'] = strtotime(array_values($response)[0]['update']);
			} else {
				done(DONE_DATABASE);
			}
			$response = db_get_data($mysqli, DB_TABLE_UPDATETIMES, '`update`', '`table` = "' . BOATCLASS . DB_TABLE_SUFFIX_REGATTAS . '"', 1);
			if (($response !== false) and (count($response) > 0)) {
				$times['regattas'] = strtotime(array_values($response)[0]['update']);
			} else {
				done(DONE_DATABASE);
			}
			$response = db_get_data($mysqli, DB_TABLE_UPDATETIMES, '`update`', '`table` = "' . BOATCLASS . DB_TABLE_SUFFIX_RESULTS . '"', 1);
			if (($response !== false) and (count($response) > 0)) {
				$times['results'] = strtotime(array_values($response)[0]['update']);
			} else {
				done(DONE_DATABASE);
			}
			$response = db_get_data($mysqli, DB_TABLE_UPDATETIMES, '`update`', '`table` = "' . BOATCLASS . DB_TABLE_SUFFIX_PLANNING . '"', 1);
			if (($response !== false) and (count($response) > 0)) {
				$times['plannings'] = strtotime(array_values($response)[0]['update']);
			} else {
				done(DONE_DATABASE);
			}
			$response = db_get_data($mysqli, DB_TABLE_UPDATETIMES, '`update`', '`table` = "' . DB_TABLE_TRIM_BOATS . '"', 1);
			if (($response !== false) and (count($response) > 0)) {
				$times['trim_boats'] = strtotime(array_values($response)[0]['update']);
			} else {
				done(DONE_DATABASE);
			}
			$response = db_get_data($mysqli, DB_TABLE_UPDATETIMES, '`update`', '`table` = "' . DB_TABLE_TRIM_USERS . '"', 1);
			if (($response !== false) and (count($response) > 0)) {
				$times['trim_users'] = strtotime(array_values($response)[0]['update']);
			} else {
				done(DONE_DATABASE);
			}
			$response = db_get_data($mysqli, DB_TABLE_UPDATETIMES, '`update`', '`table` = "' . DB_TABLE_TRIM_TRIMS . '"', 1);
			if (($response !== false) and (count($response) > 0)) {
				$times['trim_trims'] = strtotime(array_values($response)[0]['update']);
			} else {
				done(DONE_DATABASE);
			}
			$response = db_get_data($mysqli, DB_TABLE_UPDATETIMES, '`update`', '`table` = "' . DB_TABLE_USERS . '"', 1);
			if (($response !== false) and (count($response) > 0)) {
				$times['users'] = strtotime(array_values($response)[0]['update']);
			} else {
				done(DONE_DATABASE);
			}
			done(DONE_OKAY, $times);
			break;
		
		case 'get_clubs':
			sendEntries(DB_TABLE_CLUBS);
			break;
		
		case 'get_club':
			sendEntry(DB_TABLE_CLUBS);
			break;
		
		case 'get_boats':
			sendEntries(BOATCLASS . DB_TABLE_SUFFIX_BOATS);
			break;
		
		case 'get_boat':
			sendEntry(BOATCLASS . DB_TABLE_SUFFIX_BOATS);
			break;
		
		case 'get_sailors':
			sendEntries(BOATCLASS . DB_TABLE_SUFFIX_SAILORS);
			break;
		
		case 'get_sailor':
			sendEntry(BOATCLASS . DB_TABLE_SUFFIX_SAILORS);
			break;
		
		case 'get_years':
			$response = get_regatta_years($mysqli);
			if ($response === false) done(DONE_DATABASE);
			foreach ($response as $key => $value)
				$response[$key] = ['year' => $value];
			done(DONE_OKAY, ['data' => $response]);
			break;
		
		case 'get_regattas':
			sendEntries(BOATCLASS . DB_TABLE_SUFFIX_REGATTAS);
			break;
		
		case 'get_regatta':
			sendEntry(BOATCLASS . DB_TABLE_SUFFIX_REGATTAS);
			break;
		
		case 'get_results':
			sendEntries(BOATCLASS . DB_TABLE_SUFFIX_RESULTS);
			break;
		
		case 'get_result':
			sendEntry(BOATCLASS . DB_TABLE_SUFFIX_RESULTS);
			break;
		
		case 'get_plannings':
			$response = db_get_data($mysqli, BOATCLASS . DB_TABLE_SUFFIX_PLANNING, '*', $whereString);
			if ($response === false) done(DONE_DATABASE);
			$keys = array_keys($response);
			if (isset($_REQUEST['changed-after'])) {
				$response = db_get_data($mysqli, BOATCLASS . DB_TABLE_SUFFIX_PLANNING, '*', '`changed` > "' . mysqli_real_escape_string($mysqli, date('Y-m-d H:i:s', $_REQUEST['changed-after'])) . '"' . ($whereString ? (' AND ' . $whereString) : ''));
				if ($response === false) done(DONE_DATABASE);
			}
			$response = array_map(function ($entry) {
				global $user_id;
				if (($user_id === false) or ($entry['user'] != $user_id)) {
					unset($entry['gemeldet'], $entry['bezahlt']);
				}
				return $entry;
			}, $response);
			$response = array_values($response);
			done(DONE_OKAY, array('data' => replaceChanged($response), 'keys' => $keys));
			break;
		
		case 'get_planning':
			checkRequest('id');
			$response = db_get_data($mysqli, BOATCLASS . DB_TABLE_SUFFIX_PLANNING, '*', '`id` = "' . mysqli_real_escape_string($mysqli, $_REQUEST['id']) . '"');
			if ($response === false) done(DONE_DATABASE);
			if (count($response) != 1) done(DONE_BAD_REQUEST, ['error' => 'id not found']);
			$response = array_values($response)[0];
			if (($user_id === false) or ($response['user'] != $user_id)) {
				unset($response['gemeldet'], $response['bezahlt']);
			}
			unset($response['changed']);
			done(DONE_OKAY, ['data' => $response]);
			break;
		
		case 'get_trim_boats':
			checkLoggedIn();
			$users = db_get_data($mysqli, DB_TABLE_TRIM_USERS, 'boat', '`user`="' . $user_id . '"');
			$boats = implode(',', array_column($users, 'boat'));
			if ($boats == '') {
				done(DONE_OKAY, array('data' => [], 'keys' => []));
			}
			$response = db_get_data($mysqli, DB_TABLE_TRIM_BOATS, '*', '`id` IN (' . $boats . ')' . ($whereString ? (' AND ' . $whereString) : ''));
			if ($response === false) done(DONE_DATABASE);
			$keys = array_keys($response);
			if (isset($_REQUEST['changed-after'])) {
				$response = db_get_data($mysqli, DB_TABLE_TRIM_BOATS, '*', '`id` IN (' . $boats . ') AND `changed` > "' . mysqli_real_escape_string($mysqli, date('Y-m-d H:i:s', $_REQUEST['changed-after'])) . '"' . ($whereString ? (' AND ' . $whereString) : ''));
				if ($response === false) done(DONE_DATABASE);
			}
			$response = array_values($response);
			done(DONE_OKAY, array('data' => replaceChanged($response), 'keys' => $keys));
			break;
		
		case 'get_trim_boat':
			checkLoggedIn();
			checkRequest('id');
			$response = db_get_data($mysqli, DB_TABLE_TRIM_BOATS, '*', '`id` = "' . mysqli_real_escape_string($mysqli, $_REQUEST['id']) . '"');
			if ($response === false) done(DONE_DATABASE);
			if (count($response) != 1) done(DONE_BAD_REQUEST, ['error' => 'id not found']);
			$response = array_values($response)[0];
			if (count(db_get_data($mysqli, DB_TABLE_TRIM_USERS, 'id', '`user`="' . $user_id . '" AND `boat`="' . $response['id'] . '"')) != 1)
				done(DONE_BAD_REQUEST, ['error' => 'id not found']);
			unset($response['changed']);
			done(DONE_OKAY, ['data' => $response]);
			break;
		
		case 'get_trim_users':
			checkLoggedIn();
			$users = db_get_data($mysqli, DB_TABLE_TRIM_USERS, 'boat', '`user`="' . $user_id . '"');
			$boats = implode(',', array_column($users, 'boat'));
			if ($boats == '') {
				done(DONE_OKAY, array('data' => [], 'keys' => []));
			}
			$response = db_get_data($mysqli, DB_TABLE_TRIM_USERS, '*', '`boat` IN (' . $boats . ')' . ($whereString ? (' AND ' . $whereString) : ''));
			if ($response === false) done(DONE_DATABASE);
			$keys = array_keys($response);
			if (isset($_REQUEST['changed-after'])) {
				$response = db_get_data($mysqli, DB_TABLE_TRIM_USERS, '*', '`boat` IN (' . $boats . ') AND `changed` > "' . mysqli_real_escape_string($mysqli, date('Y-m-d H:i:s', $_REQUEST['changed-after'])) . '"' . ($whereString ? (' AND ' . $whereString) : ''));
				if ($response === false) done(DONE_DATABASE);
			}
			$response = array_values($response);
			done(DONE_OKAY, array('data' => replaceChanged($response), 'keys' => $keys));
			break;
		
		case 'get_trim_user':
			checkLoggedIn();
			checkRequest('id');
			$response = db_get_data($mysqli, DB_TABLE_TRIM_USERS, '*', '`id` = "' . mysqli_real_escape_string($mysqli, $_REQUEST['id']) . '"');
			if ($response === false) done(DONE_DATABASE);
			if (count($response) != 1) done(DONE_BAD_REQUEST, ['error' => 'id not found']);
			$response = array_values($response)[0];
			if (count(db_get_data($mysqli, DB_TABLE_TRIM_USERS, 'id', '`user`="' . $user_id . '" AND `boat`="' . $response['boat'] . '"')) != 1)
				done(DONE_BAD_REQUEST, ['error' => 'id not found']);
			unset($response['changed']);
			done(DONE_OKAY, ['data' => $response]);
			break;
		
		case 'get_trim_trims':
			checkLoggedIn();
			$users = db_get_data($mysqli, DB_TABLE_TRIM_USERS, 'boat', '`user`="' . $user_id . '"');
			$boats = implode(',', array_column($users, 'boat'));
			if ($boats == '') {
				done(DONE_OKAY, array('data' => [], 'keys' => []));
			}
			$response = db_get_data($mysqli, DB_TABLE_TRIM_TRIMS, '*', '`boat` IN (' . $boats . ')' . ($whereString ? (' AND ' . $whereString) : ''));
			if ($response === false) done(DONE_DATABASE);
			$keys = array_keys($response);
			if (isset($_REQUEST['changed-after'])) {
				$response = db_get_data($mysqli, DB_TABLE_TRIM_TRIMS, '*', '`boat` IN (' . $boats . ') AND `changed` > "' . mysqli_real_escape_string($mysqli, date('Y-m-d H:i:s', $_REQUEST['changed-after'])) . '"' . ($whereString ? (' AND ' . $whereString) : ''));
				if ($response === false) done(DONE_DATABASE);
			}
			$response = array_values($response);
			done(DONE_OKAY, array('data' => replaceChanged($response), 'keys' => $keys));
			break;
		
		case 'get_trim_trim':
			checkLoggedIn();
			checkRequest('id');
			$response = db_get_data($mysqli, DB_TABLE_TRIM_TRIMS, '*', '`id` = "' . mysqli_real_escape_string($mysqli, $_REQUEST['id']) . '"');
			if ($response === false) done(DONE_DATABASE);
			if (count($response) != 1) done(DONE_BAD_REQUEST, ['error' => 'id not found']);
			$response = array_values($response)[0];
			if (count(db_get_data($mysqli, DB_TABLE_TRIM_USERS, 'id', '`user`="' . $user_id . '" AND `boat`="' . $response['boat'] . '"')) != 1)
				done(DONE_BAD_REQUEST, ['error' => 'id not found']);
			unset($response['changed']);
			done(DONE_OKAY, ['data' => $response]);
			break;
		
		case 'get_users':
			$followFields = '';
			for ($i = 1; $i <= 5; $i ++) $followFields .= ',' . BOATCLASS . '_sailor' . $i . ' AS sailor' . $i;
			$response = db_get_data($mysqli, DB_TABLE_USERS, 'id,username,email' . $followFields, $whereString);
			if ($response === false) done(DONE_DATABASE);
			$keys = array_keys($response);
			if (isset($_REQUEST['changed-after'])) {
				$response = db_get_data($mysqli, DB_TABLE_USERS, 'id,username,email,' . $followFields, '`changed` > "' . mysqli_real_escape_string($mysqli, date('Y-m-d H:i:s', $_REQUEST['changed-after'])) . '"' . ($whereString ? (' AND ' . $whereString) : ''));
				if ($response === false) done(DONE_DATABASE);
			}
			$response = array_map(function ($entry) {
				global $user_id;
				if ($entry['id'] != $user_id) {
					$entry = ['id' => $entry['id'], 'username' => $entry['username']];
				}
				return $entry;
			}, $response);
			$response = array_values($response);
			done(DONE_OKAY, array('data' => replaceChanged($response), 'keys' => $keys));
			break;
		
		case 'get_user':
			checkRequest('id');
			$followFields = '';
			for ($i = 1; $i <= 5; $i ++) $followFields .= ',' . BOATCLASS . '_sailor' . $i . ' AS sailor' . $i;
			$response = db_get_data($mysqli, DB_TABLE_USERS, 'id,username,email' . $followFields, '`id` = "' . mysqli_real_escape_string($mysqli, $_REQUEST['id']) . '"');
			if ($response === false) done(DONE_DATABASE);
			if (count($response) != 1) done(DONE_BAD_REQUEST, ['error' => 'id not found']);
			$response = array_values($response)[0];
			if ($response['id'] != $user_id) {
				$response = ['id' => $response['id'], 'username' => $response['username']];
			}
			unset($response['changed']);
			done(DONE_OKAY, ['data' => $response]);
			break;
		
		case 'add_subscription':
			checkRequest('subscription');
			$data = [
				'auth' => PUSH_AUTH,
				'subscription' => $_REQUEST['subscription']
			];
			$ch = curl_init('https://push.ostertun.net/add_subscription');
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_POST, true);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
			$result = curl_exec($ch);
			curl_close($ch);
			if ($result == "OK")
				done(DONE_OKAY);
			else {
				logE('add_subscription', $result);
				done(DONE_SERVER_ERROR);
			}
			break;
		
		case 'remove_subscription':
			checkRequest('subscription');
			$data = [
				'auth' => PUSH_AUTH,
				'subscription' => $_REQUEST['subscription']
			];
			$ch = curl_init('https://push.ostertun.net/remove_subscription');
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_POST, true);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
			$result = curl_exec($ch);
			curl_close($ch);
			if ($result == "OK")
				done(DONE_OKAY);
			else {
				logE('remove_subscription', $result);
				done(DONE_SERVER_ERROR);
			}
			break;
		
		default:
			done(DONE_BAD_REQUEST, ['error' => 'action invalid']);
		
	}
	
?>