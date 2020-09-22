<?php
	
	// Title
	$content = "<h1>$_CLASS[name]</h1>";
	$content .= "<p>$_CLASS[desc]</p>";
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	// Favorites
	$content = '<h2>Deine Favoriten</h2>';
	$thead = '<tr><th>Segler</th><th id="th-ranking">Rangliste</th></tr>';
	$content .= $tpl->load('table', [$thead, 'html-id' => 'table-favorites', 'css-class' => 'mb-0 mt-3']);
	$content .= '<p id="p-favorites" class="mt-3">';
	$content .= 'Du folgst <b>keinen</b> Seglern.<br>';
	$content .= 'Um jemandem zu folgen, gehe zur <a href="' . LINK_PRE . 'sailors">Segler-Liste</a> und w&auml;hle bis zu f&uuml;nf Segler aus.';
	$content .= '</p>';
	
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-favorites']);
	
	// Planning next
	$content = '<h2>Deine n&auml;chsten Regatten</h2>';
	$thead = '<tr><th>Datum</th><th>Regatta</th><th>Informationen</th><th>RLF</th><th>Segler</th></tr>';
	$content .= $tpl->load('table', [$thead, 'html-id' => 'table-yournext', 'css-class' => 'mb-0 mt-3']);
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
	
	// Next
	$content = '<h2>N&auml;chste Regatten</h2>';
	$thead = '<tr><th>Datum</th><th>Regatta</th><th>Informationen</th><th>RLF</th></tr>';
	$content .= $tpl->load('table', [$thead, 'html-id' => 'table-next', 'css-class' => 'mb-0 mt-3']);
	$content .= '<p id="p-next" class="mt-3">';
	$content .= 'Keine Regatten in den n&auml;chsten zwei Wochen!';
	$content .= '</p>';
	
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-next']);
	
	// Last
	$content = '<h2>Letzte Regatten</h2>';
	$thead = '<tr><th>Datum</th><th>Regatta</th><th>Ergebnisse</th><th>RLF</th></tr>';
	$content .= $tpl->load('table', [$thead, 'html-id' => 'table-last', 'css-class' => 'mb-0 mt-3']);
	$content .= '<p id="p-last" class="mt-3">';
	$content .= 'Keine Regatten in den letzten zwei Wochen!';
	$content .= '</p>';
	
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-last']);
	
	// Calendar
	$content = '<h2>Regatta-Kalender</h2>';
	$content .= '<p>Du willst alle Regatta-Termine in deinem Kalender, aber nicht alles abtippen?<br>Kein Problem! Abonniere einfach unseren ics-Kalender.</p>';
	$content .= '<p><b>Nur die Regatten, zu denen Du gehst?</b><br>Auch kein Problem! ';
	$content .= '<span class="show-loggedin">Erstelle einfach eine <a href="' . LINK_PRE . 'planning">Saison-Planung</a> und abonniere Deinen persönlichen Kalender.</span>';
	$content .= '<span class="show-notloggedin"><a href="#" data-menu="menu-signup">Registriere Dich einfach kostenlos</a>, erstelle eine Saison-Planung und wir erstellen Dir einen pers&ouml;nlichen Kalender.</span>';
	$content .= '</p>';
	$content .= $tpl->load('button', ['<i class="fas fa-calendar-alt"></i> Regatta-Kalender', 'https://regatten.net/client/calendar/' . BOATCLASS . '/everything.ics', 'css-class' => 'mb-2']);
	$content .= $tpl->load('button', ['<i class="fas fa-calendar-alt"></i> Kalender f&uuml;r <span class="replace-username"></span>', 'https://regatten.net/client/calendar/' . BOATCLASS . '/user_%USERID%.ics', 'css-class' => 'show-loggedin replace-userid-href']);
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	$sp['scripts'] = '<!-- DEBUG -->' . $scripts->load('index');
	
?>