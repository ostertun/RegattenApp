<?php

	$sp['title'] = 'Saison-Planungen - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = true;
	$sp['activenav'] = 4;

	// Title
	$content = '<h1>Saison-Planungen</h1>';
	$content .= $tpl->load('select', ['html-id' => 'select-year', 'placeholder' => 'Jahr', 'css-class' => 'mt-3 mb-0']);

	$sp['output'] .= $tpl->load('card', [$content, 'css-class' => 'show-loggedin']);

	// Not loggedin
	$content = '<h1>Saison-Planungen</h1>';
	$content .= '<p>Um die Saison-Planungen anderer zu sehen, musst Du angemeldet sein.<br><a href="#" data-menu="menu-login">Melde Dich hier an</a> oder <a href="https://regatten.net/#signup">registriere Dich jetzt kostenlos</a>.</p>';

	$sp['output'] .= $tpl->load('card', [$content, 'css-class' => 'show-notloggedin']);

	// Regattas
	$content = $tpl->load('input', ['html-id' => 'input-search', 'placeholder' => 'Suche', 'type' => 'text']);
	$content .= '<div id="div-users" class="normal-list mb-0"></div>';

	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-regattas', 'css-class' => 'show-loggedin']);

	$sp['scripts'] .= $scripts->load('planning_list');

?>
