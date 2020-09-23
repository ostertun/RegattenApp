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
	$path = __DIR__ . '/content/';
	$dir = opendir($path);
	while ($file = readdir($dir)) {
		if (($file == '.') or ($file == '..') or (pathinfo($file, PATHINFO_EXTENSION) != 'php')) continue;
		$revision = filemtime($path . $file);
		$file = SERVER_ADDR . '/' . pathinfo($file, PATHINFO_FILENAME);
		echo "\t{url: '$file', revision: '$revision'},\n";
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
		$revision = filemtime(__DIR__ . $file);
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