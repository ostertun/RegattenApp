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
		<link href="https://fonts.googleapis.com/css?family=Roboto:300,300i,400,400i,500,500i,700,700i,900,900i|Source+Sans+Pro:300,300i,400,400i,600,600i,700,700i,900,900i&display=swap" rel="stylesheet">
		<link rel="stylesheet" type="text/css" href="<?php echo SERVER_ADDR; ?>/client/fonts/css/fontawesome-all.min.css">    
		<link rel="manifest" href="<?php echo SERVER_ADDR; ?>/manifest.json.php" data-pwa-version="<?php echo PWA_VERSION; ?>">
		<link rel="icon" type="image/x-icon" href="<?php echo SERVER_ADDR; ?>/client/app/icons/favicon.ico">
		<link rel="apple-touch-icon" sizes="180x180" href="<?php echo SERVER_ADDR; ?>/client/app/icons/icon-192x192.png">
	</head>
    
	<body class="detect-theme" data-background="none" data-highlight="blue2">
		
		<div id="preloader"><div class="spinner-border color-highlight" role="status"></div></div>
		
		<div id="page">
			
			<!-- header and footer bar go here-->
			<div class="header header-fixed header-logo-center">
				<a href="<?php echo LINK_PRE; ?>index" class="header-title">Regatten.net <?php echo $_CLASSES[BOATCLASS]['name']['de']; ?></a>
				<?php if ($sp['backbutton'] !== false) {
					if ($sp['backbutton'] === true)
						echo '<a href="#" class="back-button header-icon header-icon-1"><i class="fas fa-arrow-left"></i></a>';
					else
						echo '<a href="' . LINK_PRE . $sp['backbutton'] . '" class="header-icon header-icon-1"><i class="fas fa-arrow-left"></i></a>';
				} ?>
				<a href="#" data-menu="menu-settings" class="header-icon header-icon-4"><i class="fas fa-cog"></i></a>
			</div>
			<div id="footer-bar" class="footer-bar-1">
				<a href="<?php echo LINK_PRE; ?>index"<?php if ($sp['activenav'] == 1) echo ' class="active-nav"'; ?>><i class="fa fa-home"></i><span>Start</span></a>
				<a href="<?php echo LINK_PRE; ?>regattas"<?php if ($sp['activenav'] == 2) echo ' class="active-nav"'; ?>><i class="fa fa-flag-checkered"></i><span>Regatten</span></a>
				<a href="<?php echo LINK_PRE; ?>rank"<?php if ($sp['activenav'] == 3) echo ' class="active-nav"'; ?>><i class="fa fa-trophy"></i><span>Ranglisten</span></a>
				<a href="#" data-menu="menu-lists"<?php if ($sp['activenav'] == 4) echo ' class="active-nav"'; ?>><i class="fa fa-list"></i><span>Listen</span></a>
				<a href="#" data-menu="menu-more"<?php if ($sp['activenav'] == 5) echo ' class="active-nav"'; ?>><i class="fa fa-ellipsis-h"></i><span>Mehr</span></a>
			</div>
			
			<!--start of page content, add your stuff here-->
			<div class="page-content header-clear-medium">
				<?php echo $sp['output']; ?>
			</div>    
			<!--end of page content, off canvas elements here-->
			
			<div id="menu-share" class="menu menu-box-bottom menu-box-detached rounded-m" data-menu-height="345" data-menu-effect="menu-over">
				<div class="menu-title mt-n1"><h1>Share the Love</h1><p class="color-highlight">Just Tap the Social Icon. We'll add the Link</p><a href="#" class="close-menu"><i class="fa fa-times"></i></a></div>
				<div class="content mb-0">
					<div class="divider mb-0"></div>
					<div class="list-group list-custom-small list-icon-0">
						<a href="#" class="shareToFacebook">
							<i class="font-18 fab fa-facebook color-facebook"></i>
							<span class="font-13">Facebook</span>
							<i class="fa fa-angle-right"></i>
						</a>
						<a href="#" class="shareToTwitter">
							<i class="font-18 fab fa-twitter-square color-twitter"></i>
							<span class="font-13">Twitter</span>
							<i class="fa fa-angle-right"></i>
						</a>
						<a href="#" class="shareToLinkedIn">
							<i class="font-18 fab fa-linkedin color-linkedin"></i>
							<span class="font-13">LinkedIn</span>
							<i class="fa fa-angle-right"></i>
						</a>        
						<a href="#" class="shareToWhatsApp">
							<i class="font-18 fab fa-whatsapp-square color-whatsapp"></i>
							<span class="font-13">WhatsApp</span>
							<i class="fa fa-angle-right"></i>
						</a>   
						<a href="#" class="shareToMail border-0">
							<i class="font-18 fa fa-envelope-square color-mail"></i>
							<span class="font-13">Email</span>
							<i class="fa fa-angle-right"></i>
						</a>
					</div>
				</div>
			</div>
			
			<!-- All Menus, Action Sheets, Modals, Notifications, Toasts get Placed outside the <div class="page-content"> -->
			<div id="menu-lists" class="menu menu-box-bottom menu-box-detached rounded-m" data-menu-height="260" >
				<div class="menu-title"><h1>Listen</h1><p class="color-highlight">&nbsp;</p><a href="#" class="close-menu"><i class="fa fa-times"></i></a></div>
				<div class="divider divider-margins mb-n2"></div>
				<div class="content">
					<div class="list-group list-custom-small">
						<a href="<?php echo LINK_PRE; ?>sailors">
							<i class="fa font-14 fa-users rounded-s bg-highlight color-white"></i>
							<span>Segler</span>
							<i class="fa fa-angle-right"></i>
						</a>
						<a href="<?php echo LINK_PRE; ?>boats">
							<i class="fa font-14 fa-ship rounded-s bg-highlight color-white"></i>
							<span>Boote</span>
							<i class="fa fa-angle-right"></i>
						</a>
						<a href="<?php echo LINK_PRE; ?>clubs" class="border-0">
							<i class="fa font-14 fa-home rounded-s bg-highlight color-white"></i>
							<span>Vereine</span>
							<i class="fa fa-angle-right"></i>
						</a>
					</div>
				</div>
			</div>
			
			<div id="menu-more" class="menu menu-box-bottom menu-box-detached rounded-m" data-menu-height="360" >
				<div class="menu-title"><h1>Mehr</h1><p class="color-highlight">&nbsp;</p><a href="#" class="close-menu"><i class="fa fa-times"></i></a></div>
				<div class="divider divider-margins mb-n2"></div>
				<div class="content">
					<div class="list-group list-custom-small">
						<a href="<?php echo LINK_PRE; ?>news">
							<i class="fa font-14 fa-newspaper rounded-s bg-highlight color-white"></i>
							<span>Neuigkeiten</span>
							<i class="fa fa-angle-right"></i>
						</a>
						<a href="<?php echo LINK_PRE; ?>planning">
							<i class="fa font-14 fa-calendar-alt rounded-s bg-highlight color-white"></i>
							<span>Saison-Planung</span>
							<i class="fa fa-angle-right"></i>
						</a>
						<a href="<?php echo LINK_PRE; ?>trim_list">
							<i class="fa font-14 fa-book rounded-s bg-highlight color-white"></i>
							<span>Trimm-B&uuml;cher</span>
							<i class="fa fa-angle-right"></i>
						</a>
						<a href="<?php echo LINK_PRE; ?>calc">
							<i class="fa font-14 fa-calculator rounded-s bg-highlight color-white"></i>
							<span>RLP-Rechner</span>
							<i class="fa fa-angle-right"></i>
						</a>
						<a href="<?php echo LINK_PRE; ?>contact" class="border-0">
							<i class="fa font-14 fa-phone rounded-s bg-highlight color-white"></i>
							<span>Kontakt</span>
							<i class="fa fa-angle-right"></i>
						</a>
					</div>
				</div>
			</div>
			
			<div id="menu-settings" class="menu menu-box-bottom menu-box-detached rounded-m" data-menu-height="270">
				<div class="menu-title"><h1>Einstellungen</h1><p class="color-highlight">&nbsp;</p><a href="#" class="close-menu"><i class="fa fa-times"></i></a></div>
				<div class="divider divider-margins mb-n2"></div>
				<div class="content">
					<div class="list-group list-custom-small">
						<a href="#" data-toggle-theme data-trigger-switch="switch-dark" class="pb-2">
							<i class="fa font-14 fa-moon rounded-s bg-dark1-dark color-white"></i>
							<span>Dark Mode</span>
							<div class="custom-control scale-switch ios-switch">
								<input data-toggle-theme-switch type="checkbox" class="ios-input" id="switch-dark">
								<label class="custom-control-label" for="switch-dark"></label>
							</div>
						</a>
						<a href="<?php echo LINK_PRE; ?>login">
							<i class="fa font-14 fa-sign-in-alt rounded-s bg-highlight color-white"></i>
							<span>Login</span>
							<i class="fa fa-angle-right"></i>
						</a>        
						<a href="<?php echo LINK_PRE; ?>signup" class="border-0">
							<i class="fa font-14 fa-user-plus rounded-s bg-highlight color-white"></i>
							<span>Registrieren</span>
							<span class="badge bg-red2-dark color-white">FREE</span>
						</a>        
					</div>
				</div>
			</div>
			
			<?php echo $sp['menus']; ?>
			
			<?php
				if ($site == 'index') {
					include(__DIR__ . '/install.php');
				}
			?>
			
			<!--end of div id page-->
		</div>    
		
		<script type="text/javascript" src="<?php echo SERVER_ADDR; ?>/client/scripts/jquery.js"></script>
		<script type="text/javascript" src="<?php echo SERVER_ADDR; ?>/client/scripts/bootstrap.min.js"></script>
		<script type="text/javascript" src="<?php echo SERVER_ADDR; ?>/client/scripts/custom.js"></script>
	</body>
	
</html>