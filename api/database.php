<?php
	
	/*
		
		Mysql Database Support
		----------------------
		
		Required defines:
		- DB_HOST (STRING)
		- DB_USER (STRING)
		- DB_PASS (STRING)
		- DB_DATABASE (STRING)
		- DB_USE_UTF8 (BOOL)
		- DB_CHANGE_TIME (BOOL)
		
		Required functions:
		- logE (in /_global/log.php)
		
	*/
	
	$mysqli = mysqli_connect(DB_HOST, DB_USER, DB_PASS);
	
	if ($mysqli === false) {
		logE("database", "Could not connect to database\n" . mysqli_connect_error);
		die('Error: Could not connect to database');
	}
	
	mysqli_select_db($mysqli, DB_DATABASE);
	if (DB_USE_UTF8) {
		mysqli_set_charset($mysqli, 'utf8');
	}
	
	function db_get_data($mysqli, $table, $fields = '*', $where = false, $limit = false) {
		$rest = '';
		if ($where != false) {
			$rest .= ' WHERE ' . $where;
		}
		if ($limit != false) {
			$rest .= sprintf(' LIMIT %d', $limit);
		}
		$query = 'SELECT ' . $fields . ' FROM ' . mysqli_real_escape_string($mysqli, $table) . $rest . ';';
		$response = mysqli_query($mysqli, $query);
		
		if ($response !== false) {
			$result = array();
			if ($response->num_rows > 0) {
				$i = 0;
				while ($row = $response->fetch_assoc()) {
					if (isset($row['id'])) {
						$id = $row['id'];
					} else {
						$id = $i;
						$i ++;
					}
					foreach ($row as $key => $value) {
						$result[$id][$key] = $value;
					}
				}
			}
			return $result;
		} else {
			logE("database", "get_data\nInvalid request\n" . $query . "\n" . mysqli_error($mysqli));
			return false;
		}
	}
	
	function db_update_data($mysqli, $table, $data, $where, $limit = false) {
		$rest = '';
		if ($where != false) {
			$rest .= ' WHERE ' . $where;
		}
		if ($limit != false) {
			$rest .= sprintf(' LIMIT %d', $limit);
		}
		$set = '';
		$first = true;
		foreach ($data as $key => $value) {
			if ($first) {
				$first = false;
			} else {
				$set .= ', ';
			}
			if ($value === null) {
				$set .= '`' . mysqli_real_escape_string($mysqli, $key) . '`=NULL';
			} else {
				$set .= '`' . mysqli_real_escape_string($mysqli, $key) . '`="' . mysqli_real_escape_string($mysqli, $value) . '"';
			}
		}
		if (defined('DB_CHANGE_TIME')) $set .= ', `changed`=NOW()';
		$query = 'UPDATE ' . mysqli_real_escape_string($mysqli, $table) . ' SET ' . $set . $rest . ';';
		$response = mysqli_query($mysqli, $query);
		
		if ($response === false) {
			logE("database", "update_data\nInvalid request\n" . $query . "\n" . mysqli_error($mysqli));
		} elseif (defined('DB_CHANGE_TIME')) {
			mysqli_query($mysqli, 'UPDATE `_updatetimes` SET `update`=NOW() WHERE `table`="' . mysqli_real_escape_string($mysqli, $table) . '";');
		}
		
		return $response;
	}
	
	function db_insert_data($mysqli, $table, $data) {
		$fields = '';
		$values = '';
		$first = true;
		foreach ($data as $key => $value) {
			if ($first) {
				$first = false;
			} else {
				$fields .= ', ';
				$values .= ', ';
			}
			$fields .= '`' . mysqli_real_escape_string($mysqli, $key) . '`';
			if ($value === null) {
				$values .= 'NULL';
			} else {
				$values .= '"' . mysqli_real_escape_string($mysqli, $value) . '"';
			}
		}
		if (defined('DB_CHANGE_TIME')) {
			$fields .= ', `changed`';
			$values .= ', NOW()';
		}
		$query = 'INSERT INTO `' . mysqli_real_escape_string($mysqli, $table) . '` (' . $fields . ') VALUES (' . $values . ');';
		$response = mysqli_query($mysqli, $query);
		if ($response === false) {
			logE("database", "insert_data\nInvalid request\n" . $query . "\n" . mysqli_error($mysqli));
		} else {
			$response = mysqli_insert_id($mysqli);
			if (defined('DB_CHANGE_TIME')) {
				mysqli_query($mysqli, 'UPDATE `_updatetimes` SET `update`=NOW() WHERE `table`="' . mysqli_real_escape_string($mysqli, $table) . '";');
			}
		}
		
		return $response;
	}
	
	function db_delete_data($mysqli, $table, $where, $limit = false) {
		$rest = '';
		if ($where != false) {
			$rest .= ' WHERE ' . $where;
		}
		if ($limit != false) {
			$rest .= sprintf(' LIMIT %d', $limit);
		}
		$query = 'DELETE FROM `' . mysqli_real_escape_string($mysqli, $table) . '`' . $rest . ';';
		$response = mysqli_query($mysqli, $query);
		if ($response === false) {
			logE("database", "delete_data\nInvalid request\n" . $query . "\n" . mysqli_error($mysqli));
		} elseif (defined('DB_CHANGE_TIME')) {
			mysqli_query($mysqli, 'UPDATE `_updatetimes` SET `update`=NOW() WHERE `table`="' . mysqli_real_escape_string($mysqli, $table) . '";');
		}
		
		return $response;
	}
	
?>