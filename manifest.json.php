<?php
	
	header('Content-Type: application/json');
	
	require_once(__DIR__ . '/server/config.php');
	
?>
{
  "version": "1.0",
  "lang" : "de",
  "name" : "Regatten.net <?php echo $_CLASS['name'] ?>",
  "scope" : "<?php echo SERVER_ADDR; ?>/",
  "display" : "standalone",
  "start_url" : "<?php echo SERVER_ADDR; ?>/index",
  "short_name" : "<?php echo $_CLASS['name'] ?>",
  "description" : "Regatta-Termine, Ergebnisse und Ranglisten",
  "orientation" : "portrait",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "generated" : "true",
  "icons": [
    {
      "src": "client/app/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "client/app/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "client/app/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "client/app/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "client/app/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "client/app/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "client/app/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "client/app/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}