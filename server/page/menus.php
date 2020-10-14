<div id="menu-share" class="menu menu-box-bottom menu-box-detached rounded-m" data-menu-height="345" data-menu-effect="menu-over">
	<div class="menu-title mt-n1"><h1>Seite Teilen</h1><p class="color-highlight">Teile diese Seite mit Deinen Freunden!</p><a href="#" class="close-menu"><i class="fa fa-times"></i></a></div>
	<div class="content mb-0">
		<div class="divider mb-0"></div>
		<div class="list-group list-custom-small list-icon-0">
			<a href="#" class="shareToFacebook" target="_blank">
				<i class="font-18 fab fa-facebook color-facebook"></i>
				<span class="font-13">Facebook</span>
				<i class="fa fa-angle-right"></i>
			</a>
			<a href="#" class="shareToTwitter" target="_blank">
				<i class="font-18 fab fa-twitter-square color-twitter"></i>
				<span class="font-13">Twitter</span>
				<i class="fa fa-angle-right"></i>
			</a>
			<a href="#" class="shareToLinkedIn" target="_blank">
				<i class="font-18 fab fa-linkedin color-linkedin"></i>
				<span class="font-13">LinkedIn</span>
				<i class="fa fa-angle-right"></i>
			</a>
			<a href="#" class="shareToWhatsApp" target="_blank">
				<i class="font-18 fab fa-whatsapp-square color-whatsapp"></i>
				<span class="font-13">WhatsApp</span>
				<i class="fa fa-angle-right"></i>
			</a>
			<a href="#" class="shareToMail border-0" target="_blank">
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
				<span id="badge-more-news" class="badge bg-highlight color-white"></span>
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

<div id="menu-settings" class="menu menu-box-bottom menu-box-detached rounded-m" data-menu-height="260">
	<div class="menu-title"><h1>Einstellungen</h1><p class="color-highlight">&nbsp;</p><a href="#" class="close-menu"><i class="fa fa-times"></i></a></div>
	<div class="divider divider-margins mb-n2"></div>
	<div class="content">
		<div class="list-group list-custom-small">
			<?php if (false) { /* DARK MODE DISABLED (set menu height to 310) */ ?>
			<a href="#" data-toggle-theme data-trigger-switch="switch-dark" class="pb-2">
				<i class="fa font-14 fa-moon rounded-s bg-dark1-dark color-white"></i>
				<span>Dark Mode</span>
				<div class="custom-control scale-switch ios-switch">
					<input data-toggle-theme-switch type="checkbox" class="ios-input" id="switch-dark">
					<label class="custom-control-label" for="switch-dark"></label>
				</div>
			</a>
			<?php } ?>
			<a href="#" data-menu="menu-login" class="show-notloggedin">
				<i class="fa font-14 fa-sign-in-alt rounded-s bg-highlight color-white"></i>
				<span>Login</span>
				<i class="fa fa-angle-right"></i>
			</a>
			<a href="#" data-menu="menu-signup" class="show-notloggedin">
				<i class="fa font-14 fa-user-plus rounded-s bg-highlight color-white"></i>
				<span>Registrieren</span>
				<span class="badge bg-red2-dark color-white">FREE</span>
			</a>
			<a href="<?php echo LINK_PRE; ?>account" class="show-loggedin">
				<i class="fa font-14 fa-user rounded-s bg-highlight color-white"></i>
				<span>Account</span>
				<i class="fa fa-angle-right"></i>
			</a>
			<a href="#" onclick="logout();" class="show-loggedin">
				<i class="fa font-14 fa-sign-out-alt rounded-s bg-highlight color-white"></i>
				<span>Logout</span>
				<i class="fa fa-angle-right"></i>
			</a>
			<a href="#" onclick="pushesOpenMenu()" class="border-0">
				<i class="fa font-14 fa-bell rounded-s bg-highlight color-white"></i>
				<span>Benachrichtigungen</span>
				<span id="badge-pushes" class="badge color-white"></span>
				<i class="fa fa-angle-right"></i>
			</a>
		</div>
	</div>
</div>

<div id="menu-pushes" class="menu menu-box-bottom menu-box-detached rounded-m" data-menu-height="500">
	<div class="menu-title"><h1>Benachrichtigungen</h1><p class="color-highlight">Bleibe immer auf dem aktuellen Stand</p><a href="#" class="close-menu"><i class="fa fa-times"></i></a></div>
	<div class="divider divider-margins mb-n2"></div>
	<div class="content">
		<div class="list-group list-custom-small">
			<a id="a-switch-pushes" href="#" data-trigger-switch="switch-pushes" class="pb-2">
				<i class="fa font-14 fa-bell rounded-s bg-highlight color-white"></i>
				<span>Benachrichtigungen aktivieren</span>
				<div class="custom-control scale-switch ios-switch">
					<input type="checkbox" class="ios-input" id="switch-pushes">
					<label class="custom-control-label" for="switch-pushes"></label>
				</div>
			</a>
			<div class="divider"></div>
			<p style="line-height: 1.5em;" id="p-pushes-info">
				W&auml;hle hier, &uuml;ber was Du informiert werden m&ouml;chtest.<br>
				(meine) bezieht sich auf die Regatten, die in Deiner Saison-Planung sind,<br>
				(alle) informiert Dich &uuml;ber alle Regatten
			</p>
			<a href="#" data-trigger-switch="switch-pushes-news" class="pb-2 a-switch-pushes-channel-all">
				<i class="fa font-14 fa-newspaper rounded-s bg-highlight color-white"></i>
				<span>Neuigkeiten</span>
				<div class="custom-control scale-switch ios-switch">
					<input type="checkbox" class="ios-input" id="switch-pushes-news">
					<label class="custom-control-label" for="switch-pushes-news"></label>
				</div>
			</a>
			<a href="#" data-trigger-switch="switch-pushes-regatta-changed-my" class="pb-2 a-switch-pushes-channel-my">
				<i class="fa font-14 fa-calendar-check rounded-s bg-highlight color-white"></i>
				<span>Regatta verschoben (meine)</span>
				<span class="badge bg-red2-dark color-white"></span>
				<div class="custom-control scale-switch ios-switch">
					<input type="checkbox" class="ios-input" id="switch-pushes-regatta-changed-my">
					<label class="custom-control-label" for="switch-pushes-regatta-changed-my"></label>
				</div>
			</a>
			<a href="#" data-trigger-switch="switch-pushes-regatta-changed-all" class="pb-2 a-switch-pushes-channel-all">
				<i class="fa font-14 fa-calendar-check rounded-s bg-highlight color-white"></i>
				<span>Regatta verschoben (alle)</span>
				<div class="custom-control scale-switch ios-switch">
					<input type="checkbox" class="ios-input" id="switch-pushes-regatta-changed-all">
					<label class="custom-control-label" for="switch-pushes-regatta-changed-all"></label>
				</div>
			</a>
			<a href="#" data-trigger-switch="switch-pushes-result-ready-my" class="pb-2 a-switch-pushes-channel-my">
				<i class="fa font-14 fa-poll rounded-s bg-highlight color-white"></i>
				<span>Ergebnisse verf&uuml;gbar (meine)</span>
				<span class="badge bg-red2-dark color-white"></span>
				<div class="custom-control scale-switch ios-switch">
					<input type="checkbox" class="ios-input" id="switch-pushes-result-ready-my">
					<label class="custom-control-label" for="switch-pushes-result-ready-my"></label>
				</div>
			</a>
			<a href="#" data-trigger-switch="switch-pushes-result-ready-all" class="pb-2 a-switch-pushes-channel-all">
				<i class="fa font-14 fa-poll rounded-s bg-highlight color-white"></i>
				<span>Ergebnisse verf&uuml;gbar (alle)</span>
				<div class="custom-control scale-switch ios-switch">
					<input type="checkbox" class="ios-input" id="switch-pushes-result-ready-all">
					<label class="custom-control-label" for="switch-pushes-result-ready-all"></label>
				</div>
			</a>
			<a href="#" data-trigger-switch="switch-pushes-meldeschluss" class="pb-2 a-switch-pushes-channel-my">
				<i class="fa font-14 fa-file-signature rounded-s bg-highlight color-white"></i>
				<span>Melde-Erinnerungen</span>
				<span class="badge bg-red2-dark color-white"></span>
				<div class="custom-control scale-switch ios-switch">
					<input type="checkbox" class="ios-input" id="switch-pushes-meldeschluss">
					<label class="custom-control-label" for="switch-pushes-meldeschluss"></label>
				</div>
			</a>
		</div>
	</div>
</div>

<div id="menu-developer" class="menu menu-box-bottom menu-box-detached rounded-m" data-menu-height="360">
	<div class="menu-title"><h1>Entwickler-Optionen</h1><p class="color-highlight">Version <?php echo PWA_VERSION; ?></p><a href="#" class="close-menu"><i class="fa fa-times"></i></a></div>
	<div class="divider divider-margins mb-n2"></div>
	<div class="content">
		<div class="list-group list-custom-small">
			<a href="https://github.com/ostertun/RegattenApp/wiki">
				<i class="fa font-14 fa-info rounded-s bg-highlight color-white"></i>
				<span>App-Wiki</span>
				<i class="fa fa-angle-right"></i>
			</a>
			<a href="javascript:deleteDb();">
				<i class="fa font-14 fa-database rounded-s bg-highlight color-white"></i>
				<span>Reset Database</span>
				<i class="fa fa-angle-right"></i>
			</a>
			<a href="javascript:deleteCache();">
				<i class="fa font-14 fa-trash-alt rounded-s bg-highlight color-white"></i>
				<span>Reset Cache</span>
				<i class="fa fa-angle-right"></i>
			</a>
			<a href="https://github.com/ostertun/RegattenApp/issues">
				<i class="fa font-14 fa-bug rounded-s bg-highlight color-white"></i>
				<span>Problem melden</span>
				<i class="fa fa-angle-right"></i>
			</a>
			<a href="#" onclick="mobileConsole.displayConsole(); return false;" class="border-0 menu-close">
				<i class="fa font-14 fa-terminal rounded-s bg-highlight color-white"></i>
				<span>Console anzeigen</span>
				<i class="fa fa-angle-right"></i>
			</a>
		</div>
	</div>
</div>

<div id="menu-login" class="menu menu-box-top menu-box-detached rounded-m" data-menu-height="270">
	<div class="content bottom-0">
		<h1 class="text-center mt-5 font-900">Login</h1>
		<div class="input-style input-style-2 has-icon input-required">
			<i class="input-icon fa fa-user color-theme"></i>
			<span class="color-highlight">Benutzername</span>
			<input id="input-login-username" class="form-control" type="name" placeholder="Benutzername" />
		</div>
		<div class="input-style input-style-2 has-icon input-required">
			<i class="input-icon fa fa-lock color-theme"></i>
			<span class="color-highlight">Passwort</span>
			<input id="input-login-password" class="form-control" type="password" placeholder="Passwort" />
		</div>
		<a class="btn btn-m mt-2 mb-2 btn-full bg-green2-dark text-uppercase font-900" href="#" onclick="login();">Login</a>
	</div>
</div>

<div id="menu-signup" class="menu menu-box-modal menu-box-detached rounded-m" data-menu-height="300">
	<div class="content bottom-0">
		<h1 class="text-center mt-5 font-900">Registrieren</h1>
		<p class="text-center">
			Momentan kannst Du Dich leider nicht in der App registrieren.<br>
			Das ist aber kein Problem, registriere Dich einfach kostenlos auf unserer Website!
		</p>
		<a href="https://regatten.net/de/signup" class="btn btn-center-xl btn-m shadow-xl rounded-s bg-highlight font-900 text-center">Registrieren</a>
		<p class="text-center font-10 bottom-0">Du kannst Dich danach in dieser App anmelden.</p>
	</div>
</div>

<div id="menu-welcome" class="menu menu-box-bottom" style="height: 70vh">
	<div class="content bottom-0">
		<h1 class="text-center font-900">Willkommen</h1>
		<p>
			Diese App befindet sich zur Zeit noch in der Entwicklungs-Phase.<br>
			Dadurch kann es vorkommen, dass bestimmte Funktionen noch nicht richtig funktionieren.<br>
			Wenn Dir etwas ungew&ouml;hnlich vorkommt, melde uns dies bitte. Klicke dazu auf das Entwickler-Icon oben links und w&auml;hle &quot;Problem melden&quot;.<br>
			Vielen Dank f&uuml;r Deine Unterst&uuml;tzung!
		</p>
		<p>
			Mehr Informationen findest Du <a href="https://info.ostertun.net/regatten/beta">hier</a>.
		</p>
		<p>
			Mit der Nutzung dieser App erkl&auml;rst Du Dich au&szlig;erdem damit einverstanden, dass wir Cookies einsetzen.
		</p>
		<a id="menu-welcome-a-okay" class="btn btn-m mt-2 mb-3 btn-full bg-green2-dark text-uppercase font-900" href="#">Alles klar</a>
	</div>
</div>

<div id="menu-nodb-warning" class="menu menu-box-bottom menu-box-detached rounded-m" data-height="500">
	<div class="menu-title"><h1>Warnung</h1><p class="color-highlight">Datenbank nicht unterst&uuml;tzt</p><a href="#" class="close-menu"><i class="fa fa-times"></i></a></div>
	<div class="divider divider-margins mb-n2"></div>
	<div class="content bottom-0">
		<p>
			Das Speichern der ben&ouml;tigten Daten wird von Deinem Ger&auml;t nicht unterst&uuml;tzt.<br>
			Da deshalb die Daten jedesmal direkt vom Server geladen werden m&uuml;ssen, kannst Du die App nicht offline nutzen.<br>
			Das Nachladen kann au&szlig;erdem gerade bei gro&szlig;en Datenmengen (wie Ranglisten) sehr lange dauern.
			Wir empfehlen Dir daher, auf diesem Ger&auml;t unsere normale Website zu benutzen. Diese ist auch f&uuml;r Mobil-Ger&auml;te optimiert.
		</p>
		<a class="btn btn-m mt-2 btn-full bg-highlight text-uppercase font-900" href="https://regatten.net/">Zur Website</a>
		<a id="menu-nodb-warning-okay" class="btn btn-m mt-2 mb-3 btn-full bg-highlight text-uppercase font-900" href="#">Nicht erneut anzeigen</a>
	</div>
</div>

<div id="menu-update">
	<div class="content bottom-0">
		<p class="text-center mt-5"><i class="fa fa-sync-alt fa-7x color-highlight fa-spin"></i></p>
		<h1 class="text-center mt-5 font-900">Update Verfügbar</h1>
		<p class="text-center">
			Eine neue Version unserer App ist verf&uuml;gbar. Keine Sorge, Du musst nichts machen. Wir aktuallisieren den Inhalt in wenigen Sekunden.
		</p>
		<a href="#" class="page-update btn btn-center-xl btn-m shadow-xl rounded-s bg-highlight font-900 text-center">Update</a>
		<p class="text-center font-10 bottom-0">Die App wird neu laden und das Update ist abgeschlossen.</p>
	</div>
</div>
