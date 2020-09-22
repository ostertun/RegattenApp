<?php
	
	function get_user($mysqli, $username = null) {
		if ($username === null) {
			return db_get_data($mysqli, DB_TABLE_USERS);
		} else {
			$user = db_get_data($mysqli, DB_TABLE_USERS, '*', '`username` = "' . mysqli_real_escape_string($mysqli, $username) . '"', 1);
			if (($user === false) or (count($user) != 1)) return false;
			return array_values($user)[0];
		}
	}
	
	function get_user_by_id($mysqli, $user_id) {
		$res = db_get_data($mysqli, DB_TABLE_USERS, '*', '`id` = "' . mysqli_real_escape_string($mysqli, $user_id) . '"', 1);
		if (($res !== false) and (count($res) == 1)) {
			return array_values($res)[0];
		}
		return false;
	}
	
	//function signup($mysqli, $username, $email, $password) {
	//	if (($username == '') or ($email == '') or ($password == '')) {
	//		return 1;
	//	}
	//	if (get_user($mysqli, $username) !== false) {
	//		return 1;
	//	}
	//	$salt = hash('sha512', uniqid(openssl_random_pseudo_bytes(16), true));
	//	$hashpassword = hash('sha512', $password . $salt);
	//	
	//	$user = array();
	//	$user['username'] = $username;
	//	$user['email'] = $email;
	//	$user['password'] = $hashpassword;
	//	$user['salt'] = $salt;
	//	if (db_insert_data($mysqli, DB_TABLE_USERS, $user) !== false) {
	//		$values = array();
	//		$values['USERNAME'] = $username;
	//		$message = createMail('signup', STRING_SIGNUP_EMAIL_SUBJECT, $values);
	//		smtp_send_mail(['Regatten.net', MAIL_FROM_ADDRESS], [[$username, $email]], [], [], STRING_SIGNUP_EMAIL_SUBJECT, $message, [['Content-Type', 'text/html; charset="UTF-8"']]);
	//		// Analytics
	//		matomo_event('Login', 'SignUp', $username);
	//		return true;
	//	} else {
	//		return 2;
	//	}
	//}
	
	function get_perm($mysqli, $user_id) {
		if ($user_id !== false) {
			$result = get_user_by_id($mysqli, $user_id);
			if ($result !== false) {
				return $result[DB_FIELD_PERM];
			} else {
				return 0;
			}
		} else {
			return 0;
		}
	}
	
	// ### NEW LOGIN ####################################
	
	function auth_login($mysqli, $username, $password, $device) {
		$user = get_user($mysqli, $username);
		if ($user === false) {
			// User does not exist
			return false;
		}
		$hashpassword = hash('sha512', $password . $user['salt']);
		if ($hashpassword !== $user['password']) {
			// Password incorrect
			return false;
		}
		// All correct
		$auth = [];
		$auth['user'] = $user['id'];
		$auth['username'] = $user['username'];
		$auth['auth'] = str_replace('/', '-', str_replace('+', '_', base64_encode(openssl_random_pseudo_bytes(24))));
		$salt = base64_encode(openssl_random_pseudo_bytes(24));
		$hash = hash('sha512', $auth['auth'] . $salt);
		$data = [
			'user' => $user['id'],
			'salt' => $salt,
			'authhash' => $hash,
			'device' => $device
		];
		$auth['id'] = db_insert_data($mysqli, DB_TABLE_LOGINS, $data);
		return $auth;
	}
	
	function auth_logout($mysqli, $id) {
		db_delete_data($mysqli, DB_TABLE_LOGINS, 'id = "' . mysqli_real_escape_string($mysqli, $id) . '"', 1);
		return true;
	}
	
	function auth_check($mysqli, $id, $hash) {
		$auth = db_get_data($mysqli, DB_TABLE_LOGINS, '*', 'id="' . mysqli_real_escape_string($mysqli, $id) . '"', 1);
		if (($auth === false) or (count($auth) != 1)) return false;
		$auth = array_values($auth)[0];
		$hash = hash('sha512', $hash . $auth['salt']);
		if ($hash != $auth['authhash']) return false;
		db_update_data($mysqli, DB_TABLE_LOGINS, ['id' => $auth['id']], 'id="' . $auth['id'] . '"', 1); // update changed field => last login
		return $auth['user'];
	}
	
?>