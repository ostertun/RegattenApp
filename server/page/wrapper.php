<!DOCTYPE HTML>
<html lang="de">
	
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
		<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover" />
		<title><?php echo $sp['title']; ?></title>
		<link rel="stylesheet" type="text/css" href="<?php echo SERVER_ADDR; ?>/client/styles/bootstrap.css">
		<link rel="stylesheet" type="text/css" href="<?php echo SERVER_ADDR; ?>/client/styles/style.css">
		<link rel="stylesheet" type="text/css" href="<?php echo SERVER_ADDR; ?>/client/styles/regatten.css">
		<link href="https://fonts.googleapis.com/css?family=Roboto:300,300i,400,400i,500,500i,700,700i,900,900i|Source+Sans+Pro:300,300i,400,400i,600,600i,700,700i,900,900i&display=swap" rel="stylesheet">
		<link rel="stylesheet" type="text/css" href="<?php echo SERVER_ADDR; ?>/client/fonts/css/fontawesome-all.min.css">
		<link rel="manifest" href="<?php echo SERVER_ADDR; ?>/manifest.json.php" data-pwa-version="<?php echo PWA_VERSION; ?>">
		<link rel="icon" type="image/x-icon" href="<?php echo SERVER_ADDR; ?>/client/app/icons/favicon.ico">
		<link rel="apple-touch-icon" sizes="180x180" href="<?php echo SERVER_ADDR; ?>/client/app/icons/icon-192x192.png">
	</head>
	
	<body class="detect-theme" data-background="none" data-highlight="blue2">
		
		<div id="preloader"><div class="spinner-border color-highlight" role="status"></div></div>
		
		<div id="page">
			
			<?php include(__DIR__ . '/headerfooter.php'); ?>
			
			<!--start of page content, add your stuff here-->
			<div class="page-content header-clear-medium">
				<?php echo $sp['output']; ?>
			</div>
			<!--end of page content, off canvas elements here-->
			
			<?php include(__DIR__ . '/menus.php'); ?>
			
			<?php echo $sp['menus']; ?>
			
			<?php
				if ($site == 'index') {
					include(__DIR__ . '/install.php');
				}
			?>
			
			<!--end of div id page-->
		</div>
		
		<?php echo $sp['scripts']; ?>
		
		<script type="text/javascript" src="<?php echo SERVER_ADDR; ?>/client/scripts/jquery.js"></script>
		<script type="text/javascript" src="<?php echo SERVER_ADDR; ?>/client/scripts/bootstrap.min.js"></script>
		<script type="text/javascript" src="<?php echo SERVER_ADDR; ?>/client/scripts/strings.js.php"></script>
		<script type="text/javascript" src="<?php echo SERVER_ADDR; ?>/client/scripts/regatten.js.php"></script>
		<script type="text/javascript" src="<?php echo SERVER_ADDR; ?>/client/scripts/datetime.js"></script>
		<script type="text/javascript" src="<?php echo SERVER_ADDR; ?>/client/scripts/database.js"></script>
		<script type="text/javascript" src="<?php echo SERVER_ADDR; ?>/client/scripts/custom.js.php"></script>
		<script type="text/javascript" src="<?php echo SERVER_ADDR; ?>/client/scripts/pwa.js.php"></script>
	</body>
	
</html>