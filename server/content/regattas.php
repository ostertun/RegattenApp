<?php

	$sp['title'] = 'Regatten - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = 'index';
	$sp['activenav'] = 2;

	// Title, Inputs
	$content = "<h1>Regatten</h1>";

	$content .= $tpl->load('select', ['html-id' => 'select-year', 'placeholder' => 'Jahr', 'css-class' => 'mt-3 mb-0']);
	$content .= $tpl->load('input', ['html-id' => 'input-from', 'placeholder' => 'Von', 'type' => 'date', 'css-class' => 'mt-3']);
	$content .= $tpl->load('input', ['html-id' => 'input-to', 'placeholder' => 'Bis', 'type' => 'date']);
	$content .= $tpl->load('button', ['Anzeigen', '#', 'html-id' => 'button-show']);

	$sp['output'] .= $tpl->load('card', [$content]);

	// Regattas
	$content = '<p id="p-count" class="mb-0"></p>';
	$content .= $tpl->load('input', ['html-id' => 'input-search', 'placeholder' => 'Suche', 'type' => 'text', 'css-class' => 'mt-2']);
	$content .= '<div id="div-regattas" class="regattas-list mb-0"></div>';

	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-regattas']);

	$sp['output'] .= $tpl->load('card', ['<p></p>', 'html-id' => 'card-special']);

	// Menu
	$items = '<p id="menu-item-special" class="mb-2 mt-1" style="line-height: 1.5em;"></p>';
	$items .= '<p id="menu-item-yourplanning" class="mb-2 mt-1" style="line-height: 1.5em;"></p>';
	$items .= $tpl->load('menu/item-icon', ['Saison-Planungen', '', 'html-id' => 'menu-item-plannings', 'icon' => 'fa-calendar-alt']);
	$items .= $tpl->load('menu/item-icon', ['Ergebnisse', '', 'html-id' => 'menu-item-results', 'icon' => 'fa-poll']);
	$items .= $tpl->load('menu/item-icon', ['Bericht', '', 'html-id' => 'menu-item-bericht', 'icon' => 'fa-book']);
	$items .= $tpl->load('menu/item-icon', ['Informationen', '', 'html-id' => 'menu-item-info', 'icon' => 'fa-info']);
	$items .= $tpl->load('menu/item-icon-badge', ['Meldung', '', 'html-id' => 'menu-item-meldung', 'icon' => 'fa-file-signature', 'badge-id' => 'badge-regatta-meldung']);
	$items .= $tpl->load('menu/item-icon', ['offizielle Ergebnisse', '', 'html-id' => 'menu-item-oresults', 'icon' => 'fa-poll']);
	$items .= $tpl->load('menu/item-icon', ['Vereins-Website', '', 'html-id' => 'menu-item-clubwebsite', 'icon' => 'fa-globe']);
	$sp['menus'] .= $tpl->load('menu/bottom', [$items, 'html-id' => 'menu-regatta', 'title' => 'Regatta-Details', 'height' => 320]);

	$sp['scripts'] .= $scripts->load('onRegattaClicked');
	$sp['scripts'] .= $scripts->load('regattas');

?>
