<?php

	$sp['title'] = 'Startseite - Regatten.net ' . $_CLASS['name'];
	$sp['activenav'] = 1;

	// Title
	$content = "<h1>$_CLASS[name]</h1>";
	$content .= "<p>$_CLASS[desc]</p>";

	$sp['output'] .= $tpl->load('card', [$content]);

	// Favorites
	$content = '<h2>Deine Favoriten</h2>';
	$content .= '<div id="div-favorites" class="normal-list mb-0"></div>';
	$content .= '<p id="p-favorites" class="mt-3">';
	$content .= 'Du folgst <b>keinen</b> Seglern.<br>';
	$content .= 'Um jemandem zu folgen, gehe zur <a href="' . LINK_PRE . 'sailors">Segler-Liste</a> und w&auml;hle bis zu f&uuml;nf Segler aus.';
	$content .= '</p>';

	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-favorites']);

	// Planning next
	$content = '<h2>Deine n&auml;chsten Regatten</h2>';
	$content .= '<div id="div-yournext" class="regattas-list mb-0"></div>';
	$content .= '<p id="p-yournext" class="mt-3">';
	$content .= 'Du f&auml;hrst in den n&auml;chsten vier Wochen auf keine Regatta!';
	$content .= '</p>';

	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-yournext']);

	// Not logged in
	$content = '<h2>Nicht angemeldet</h2>';
	$content .= '<p class="mt-3">';
	$content .= 'Um alle Funktionen dieser Seite nutzen zu k&ouml;nnen, <a href="#" data-menu="menu-login">logge Dich bitte ein</a>.<br>';
	$content .= 'Solltest Du noch kein Benutzerkonto haben, kannst Du Dich kostenlos <a href="#" data-menu="menu-signup">registrieren</a>.';
	$content .= '</p>';

	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-notloggedin']);

	// Notification Info
	$content = '<h2 class="color-white">Push-Benachrichtigungen</h2>';
	$content .= '<p class="mt-3 mb-3 color-white">';
	$content .= '<b>Bleibe immer auf dem Laufendem!</b><br>';
	$content .= 'Aktiviere einfach unsere Push-Benachrichtigungen und wir informieren Dich &uuml;ber alle &Auml;nderungen.<br>';
	$content .= 'Du bestimmst nat&uuml;rlich, welche Benachrichtigungen Du bekommen m&ouml;chtest.';
	$content .= '</p>';
	$content .= $tpl->load('button', ['Jetzt aktivieren', '#', 'html-id' => 'button-notifications-activate', 'css-class' => 'bg-green2-dark']);
	$content .= '<p class="text-center mt-3"><a id="a-notifications-later" class="color-grey2-light text-uppercase font-900">Vielleicht sp&auml;ter</a></p>';

	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-notifications', 'css-class' => 'bg-blue2-dark']);

	// Next
	$content = '<h2>N&auml;chste Regatten</h2>';
	$content .= '<div id="div-next" class="regattas-list mb-0"></div>';
	$content .= '<p id="p-next" class="mt-3">';
	$content .= 'Keine Regatten in den n&auml;chsten zwei Wochen!';
	$content .= '</p>';

	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-next']);

	// Last
	$content = '<h2>Letzte Regatten</h2>';
	$content .= '<div id="div-last" class="regattas-list mb-0"></div>';
	$content .= '<p id="p-last" class="mt-3">';
	$content .= 'Keine Regatten in den letzten zwei Wochen!';
	$content .= '</p>';

	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-last']);

	// Calendar
	$content = '<h2>Regatta-Kalender</h2>';
	$content .= '<p>Du willst alle Regatta-Termine in deinem Kalender, aber nicht alles abtippen?<br>Kein Problem! Abonniere einfach unseren ics-Kalender.</p>';
	$content .= '<p><b>Nur die Regatten, zu denen Du gehst?</b><br>Auch kein Problem! ';
	$content .= '<font class="show-loggedin">Erstelle einfach eine <a href="' . LINK_PRE . 'planning">Saison-Planung</a> und abonniere Deinen persönlichen Kalender.</font>';
	$content .= '<font class="show-notloggedin"><a href="#" data-menu="menu-signup">Registriere Dich einfach kostenlos</a>, erstelle eine Saison-Planung und wir erstellen Dir einen pers&ouml;nlichen Kalender.</font>';
	$content .= '</p>';
	$content .= $tpl->load('button', ['<i class="fas fa-calendar-alt"></i> Regatta-Kalender', 'https://regatten.net/client/calendar/' . BOATCLASS . '/everything.ics', 'css-class' => 'mb-2']);
	$content .= $tpl->load('button', ['<i class="fas fa-calendar-alt"></i> Kalender f&uuml;r <font class="replace-username"></font>', 'https://regatten.net/client/calendar/' . BOATCLASS . '/user_%USERID%.ics', 'css-class' => 'show-loggedin replace-userid-href']);

	$sp['output'] .= $tpl->load('card', [$content]);

	// Regattas Menu
	$items = '<p id="menu-item-yourplanning" class="mb-2 mt-1" style="line-height: 1.5em;"></p>';
	$items .= $tpl->load('menu/item-icon', ['Saison-Planungen', '', 'html-id' => 'menu-item-plannings', 'icon' => 'fa-calendar-alt']);
	$items .= $tpl->load('menu/item-icon', ['Ergebnisse', '', 'html-id' => 'menu-item-results', 'icon' => 'fa-poll']);
	$items .= $tpl->load('menu/item-icon', ['Bericht', '', 'html-id' => 'menu-item-bericht', 'icon' => 'fa-book']);
	$items .= $tpl->load('menu/item-icon', ['Informationen', '', 'html-id' => 'menu-item-info', 'icon' => 'fa-info']);
	$items .= $tpl->load('menu/item-icon-badge', ['Meldung', '', 'html-id' => 'menu-item-meldung', 'icon' => 'fa-file-signature', 'badge-id' => 'badge-regatta-meldung']);
	$items .= $tpl->load('menu/item-icon', ['offizielle Ergebnisse', '', 'html-id' => 'menu-item-oresults', 'icon' => 'fa-poll']);
	$items .= $tpl->load('menu/item-icon', ['Vereins-Website', '', 'html-id' => 'menu-item-clubwebsite', 'icon' => 'fa-globe']);
	$sp['menus'] .= $tpl->load('menu/bottom', [$items, 'html-id' => 'menu-regatta', 'title' => 'Regatta-Details', 'height' => 320]);

	// Favorites Menu
	$items = $tpl->load('menu/item-icon', ['Nicht mehr folgen', '#', 'html-id' => 'menu-item-unfollow', 'icon' => 'fa-heart', 'css-class' => ' border-0']);
	$sp['menus'] .= $tpl->load('menu/bottom', [$items, 'html-id' => 'menu-favorite', 'title' => 'Favorit', 'height' => 150]);

	$sp['scripts'] .= $scripts->load('onRegattaClicked');
	$sp['scripts'] .= $scripts->load('index');

?>
