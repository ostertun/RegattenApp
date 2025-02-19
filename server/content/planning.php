<?php

	$sp['title'] = 'Saison-Planung - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = 'index';
	$sp['activenav'] = 4;

	// Title
	$content = '<h1>Saison-Planung</h1>';
	$content .= $tpl->load('button', ['<i class="fas fa-list"></i>&ensp;Saison-Planungen anderer', 'html-id' => 'a-list-plannings', 'css-class' => 'mt-2 mb-2']);
	$content .= '<p class="mb-1"><b>Hinweis:</b> Diese Seite kannst nur Du sehen.<br>Wenn Du Deine Saison-Planung teilen möchtest, <a id="a-share-planning">klicke hier</a></p>';
	$content .= $tpl->load('button', ['<i class="fas fa-edit"></i>&ensp;bearbeiten', 'html-id' => 'a-edit-planning']);
	$content .= $tpl->load('select', ['html-id' => 'select-year', 'placeholder' => 'Jahr', 'css-class' => 'mt-3 mb-0']);

	$sp['output'] .= $tpl->load('card', [$content, 'css-class' => 'show-loggedin']);

	// Not loggedin
	$content = '<h1>Saison-Planung</h1>';
	$content .= '<p>Um Deine Saison-Planung zu sehen, musst Du angemeldet sein.<br><a href="#" data-menu="menu-login">Melde Dich hier an</a> oder <a href="https://regatten.net/#signup">registriere Dich jetzt kostenlos</a>.</p>';

	$sp['output'] .= $tpl->load('card', [$content, 'css-class' => 'show-notloggedin']);

	// Regattas
	$content = '<p id="p-count" class="mb-0"></p>';
	$content .= $tpl->load('input', ['html-id' => 'input-search', 'placeholder' => 'Suche', 'type' => 'text', 'css-class' => 'mt-2']);
	$content .= '<div id="div-regattas" class="regattas-list mb-0"></div>';

	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-regattas', 'css-class' => 'show-loggedin']);

	// Menu
	$items = '<p id="menu-item-special" class="mb-2 mt-1" style="line-height: 1.5em;"></p>';
	$items .= '<p id="menu-item-yourplanning" class="mb-2 mt-1" style="line-height: 1.5em;"></p>';
	$items .= $tpl->load('menu/item-icon', ['Status bearbeiten', '#', 'html-id' => 'menu-item-status', 'icon' => 'fa-edit']);
	$items .= $tpl->load('menu/item-icon-badge', ['Saison-Planungen', '', 'html-id' => 'menu-item-plannings', 'icon' => 'fa-calendar-alt', 'badge-id' => 'badge-regatta-plannings']);
	$items .= $tpl->load('menu/item-icon-badge', ['Meldeliste', '', 'html-id' => 'menu-item-entrylist', 'icon' => 'fa-file-signature', 'badge-id' => 'badge-regatta-entrylist']);
	$items .= $tpl->load('menu/item-icon', ['Ergebnisse', '', 'html-id' => 'menu-item-results', 'icon' => 'fa-poll']);
	$items .= $tpl->load('menu/item-icon', ['Bericht', '', 'html-id' => 'menu-item-bericht', 'icon' => 'fa-book']);
	$items .= $tpl->load('menu/item-icon', ['Fakten', '', 'html-id' => 'menu-item-facts', 'icon' => 'fa-list']);
	$items .= $tpl->load('menu/item-icon', ['Informationen', '', 'html-id' => 'menu-item-info', 'icon' => 'fa-info']);
	$items .= $tpl->load('menu/item-icon-badge', ['Meldung', '', 'html-id' => 'menu-item-meldung', 'icon' => 'fa-file-signature', 'badge-id' => 'badge-regatta-meldung']);
	$items .= $tpl->load('menu/item-icon', ['offizielle Ergebnisse', '', 'html-id' => 'menu-item-oresults', 'icon' => 'fa-poll']);
	$items .= $tpl->load('menu/item-icon', ['Vereins-Website', '', 'html-id' => 'menu-item-clubwebsite', 'icon' => 'fa-globe']);
	$sp['menus'] .= $tpl->load('menu/bottom', [$items, 'html-id' => 'menu-regatta', 'title' => 'Regatta-Details', 'height' => 400]);

	// Menu Edit status
	$items = $tpl->load('menu/item-switch', ['Gemeldet', 'html-id' => 'switch-status-gemeldet', 'icon' => 'fa-file-signature']);
	$items .= $tpl->load('menu/item-switch', ['Bezahlt', 'html-id' => 'switch-status-bezahlt', 'icon' => 'fa-euro-sign', 'css-class' => 'border-0']);
	$sp['menus'] .= $tpl->load('menu/bottom', [$items, 'html-id' => 'menu-status', 'title' => 'Status bearbeiten', 'height' => 220]);

	$sp['scripts'] .= $scripts->load('onRegattaClicked');
	$sp['scripts'] .= $scripts->load('planning');

?>
