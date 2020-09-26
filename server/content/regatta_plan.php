<?php
	
	$sp['title'] = 'Saison-Planung - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = 'regattas';
	$sp['activenav'] = 2;
	
	// Title, Inputs
	$content = '<h1 id="h1-title"></h1>';
	$content .= '<p id="p-title"></p>';
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	// Plannings
	$content = '<p id="p-info" class="mb-0"></p>';
	$thead = '<tr><th>Benutzer</th><th>Steuermann/-frau</th><th>Crew</th></tr>';
	$content .= $tpl->load('table', [$thead, 'html-id' => 'table-plannings', 'css-class' => 'mb-0 text-nowrap']);
	
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-plannings']);
	
	// Info
	$content = '<p>Du planst, hier hinzufahren, aber stehst nicht auf dieser Liste?<br>';
	$content .= 'Das kannst Du &auml;ndern! ';
	$content .= '<font class="show-loggedin">Erstelle einfach <a href="' . LINK_PRE . 'planning">hier</a> Deine eigene Saison-Planung.</font>';
	$content .= '<font class="show-notloggedin"><a href="#" data-menu="menu-login">Melde Dich an</a> oder <a href="#" data-menu="menu-signup">registriere Dich kostenlos</a> und erstelle Deine eigene Saison-Planung.</font>';
	$content .= '</p>';
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	$sp['scripts'] .= $scripts->load('regatta_plan');
	
?>