<?php
	
	function sendLog($type, $tag, $message) {
		$c = curl_init();
		curl_setopt($c, CURLOPT_URL, 'https://log.ostertun.net/api.php?action=log');
		curl_setopt($c, CURLOPT_POST, 1);
		curl_setopt($c, CURLOPT_POSTFIELDS, 'apikey=' . urlencode(LOGGING_APIKEY) . '&type=' . urlencode($type) . '&tag=' . urlencode($tag) . '&message=' . urlencode($message));
		curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
		$output = curl_exec($c);
		curl_close($c);
		$output = json_decode($output, true);
		if (isset($output['error'])) {
			file_put_contents($_SERVER['DOCUMENT_ROOT'] . '/_log/' . date('Y-m-d') . '.log', date('H:i:s') . "\tsendLog\tFailed to log: " . $output['error'] . "\n", FILE_APPEND);
		}
		return isset($output['success']);
	}
	
	function logE($tag, $msg) {
		sendLog('error', $tag, $msg);
	}
	
	function logW($tag, $msg) {
		sendLog('warning', $tag, $msg);
	}
	
	function LogI($tag, $msg) {
		sendLog('info', $tag, $msg);
	}
	
?>