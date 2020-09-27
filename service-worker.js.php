<?php
	
	header('Content-Type: text/javascript');
	
	require_once(__DIR__ . '/server/config.php');
	
?>
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

//Workbox Config
workbox.setConfig({
	debug: false //set to true if you want to see SW in action.
});


workbox.core.setCacheNameDetails({
	prefix: 'regatten-<?php echo BOATCLASS; ?>',
	suffix: 'v1',
	precache: 'regatten-<?php echo BOATCLASS; ?>-precache',
	runtime: 'regatten-<?php echo BOATCLASS; ?>-runtime'
});


workbox.precaching.precacheAndRoute([
<?php
	// CONTENT
	function getDirHash($path) {
		$hash = '';
		if ($dir = opendir($path)) {
			while (($file = readdir($dir)) !== false) {
				if ($file == '.') continue;
				if ($file == '..') continue;
				if (is_dir($path . '/' . $file)) {
					$hash .= getDirHash($path . '/' . $file);
				} else {
					$hash .= md5_file($path . '/' . $file);
				}
			}
			closedir($dir);
		}
		return $hash;
	}
	$hash = md5(getDirHash(__DIR__));
	
	$path = __DIR__ . '/server/content/';
	$dir = opendir($path);
	while ($file = readdir($dir)) {
		if (($file == '.') or ($file == '..') or (pathinfo($file, PATHINFO_EXTENSION) != 'php')) continue;
		$file = SERVER_ADDR . '/' . pathinfo($file, PATHINFO_FILENAME);
		echo "\t{url: '$file', revision: '$hash'},\n";
	}
	closedir($dir);
	
	// ASSETS
	$filesToCache = [
		'/manifest.json.php',
	];
	$dirsToCache = [
		'/client',
	];
	
	function addDir($path) {
		global $filesToCache;
		if ($dir = opendir(__DIR__ . $path)) {
			while (($file = readdir($dir)) !== false) {
				if ($file == '.') continue;
				if ($file == '..') continue;
				if (is_dir(__DIR__ . $path . '/' . $file)) {
					addDir($path . '/' . $file);
				} else {
					$filesToCache[] = $path . '/' . $file;
				}
			}
			closedir($dir);
		}
	}
	
	foreach ($dirsToCache as $path) {
		addDir($path);
	}
	
	foreach ($filesToCache as $file) {
		$revision = md5_file(__DIR__ . $file);
		$file = SERVER_ADDR . $file;
		echo "\t{url: '$file', revision: '$revision'},\n";
	}
?>
], {
	ignoreURLParametersMatching: [/.*/]
});


workbox.routing.registerRoute(
	({request}) => {
		if (request.destination === 'style') return true;
		if (request.destination === 'script') return true;
		if (request.destination === 'image') return true;
		if (request.destination === 'font') return true;
		return false;
	},
	new workbox.strategies.StaleWhileRevalidate({
	})
);


//Learn more about Service Workers and Configurations
//https://developers.google.com/web/tools/workbox/


// DB

var db = null;
if (indexedDB) {
	var request = indexedDB.open('regatten_app_db_<?php echo BOATCLASS; ?>');
	request.onerror = function (e) {
		console.log('[sW] Cannot open DB:', e.target.errorCode);
	};
	request.onupgradeneeded = function (e) {
		console.log('[sW] DB does not exist');
		e.target.transaction.abort();
	};
	request.onsuccess = function (e) {
		console.log('[sW] DB loaded');
		db = e.target.result;
		db.onerror = function (e) {
			console.log('[sW] DB Error:', e)
		}
	};
}

function dbSettingsGet(key) {
	return new Promise(function(resolve) {
		if (db != null) {
			var request = db.transaction('settings').objectStore('settings').get(key);
			request.onsuccess = function (event) {
				resolve(typeof request.result != 'undefined' ? request.result.value : null);
			}
		} else {
			resolve(null);
		}
	});
}

function dbSettingsSet(key, value) {
	if (db != null) {
		var os = db.transaction('settings', 'readwrite').objectStore('settings');
		os.put({ key: key, value: value});
	}
}




// PUSHES

function getEntry(data, index, defaultValue) {
	return ((typeof data[index] !== "undefined") ? data[index] : defaultValue);
}

function isMyRegatta(id) {
	return new Promise(async function (resolve) {
		var regattas = await dbSettingsGet('myregattas_<?php echo BOATCLASS; ?>');
		if (regattas == null) resolve(false);
		else resolve(regattas.includes(id.toString()));
	});
}

self.addEventListener('push', async function(event) {
	console.log('[sW] Push received:', event.data.text());
	
	var data;
	try {
		data = JSON.parse(event.data.text());
	} catch(e) {
		console.log(e);
		data = undefined;
	}
	
	if (typeof data.type !== "undefined") {
		switch (data.type) {
			case 'notification':
				if (typeof data.title === "undefined") break;
				if (typeof data.body === "undefined") break;
				if (typeof data.channel === "undefined") break;
				
				// check channel
				var okay = false;
				switch (data.channel) {
					case 'news':
						if (await dbSettingsGet('notify_channel_<?php echo BOATCLASS; ?>_news')) okay = true;
						break;
					case 'regatta_changed':
						if (await dbSettingsGet('notify_channel_<?php echo BOATCLASS; ?>_regatta_changed_all')) okay = true;
						else if (await dbSettingsGet('notify_channel_<?php echo BOATCLASS; ?>_regatta_changed_my')) {
							if (await isMyRegatta(getEntry(data, 'id', ''))) okay = true;
						}
						break;
					case 'result_ready':
						if (await dbSettingsGet('notify_channel_<?php echo BOATCLASS; ?>_result_ready_all')) okay = true;
						else if (await dbSettingsGet('notify_channel_<?php echo BOATCLASS; ?>_result_ready_my')) {
							if (await isMyRegatta(getEntry(data, 'id', ''))) okay = true;
						}
						break;
					case 'meldeschluss':
						if (await dbSettingsGet('notify_channel_<?php echo BOATCLASS; ?>_meldeschluss')) {
							if (await isMyRegatta(getEntry(data, 'id', ''))) okay = true;
						}
						break;
					default:
						console.log('Unknown channel:', data.channel);
						break;
				}
				if (!okay) {
					console.log('Notification channel not subscribed');
					return;
				}
				
				const options = {
					data: data,
					body: data.body,
					icon: getEntry(data, 'icon', '<?php echo SERVER_ADDR; ?>/client/app/icons/icon-512x512.png'),
					badge: '<?php echo SERVER_ADDR; ?>/client/app/icons/icon-96x96.png',
					vibrate: [500,100,500]
				};
				if ((image = getEntry(data, 'image', null)) !== null) {
					options.image = image;
				}
				
				console.log('Showing notification');
				self.registration.showNotification(data.title, options);
				break;
		}
	}
});

self.addEventListener('notificationclick', function(event) {
	var data = event.notification.data;
	
	event.notification.close();
	
	var url = '<?php echo SERVER_ADDR; ?>' + getEntry(data, 'url', '');
	
	event.waitUntil(
		clients.openWindow(url)
	);
});