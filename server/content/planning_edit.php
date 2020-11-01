<?php

	$sp['title'] = 'Saison-Planung bearbeiten - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = true;
	$sp['activenav'] = 5;

	// Title, Inputs
	$content = "<h1>Saison-Planung bearbeiten</h1>";
	$content .= $tpl->load('select', ['html-id' => 'select-year', 'placeholder' => 'Jahr', 'css-class' => 'mt-3 mb-0']);

	$sp['output'] .= $tpl->load('card', [$content]);

	// Regattas
	$content = '<p id="p-count" class="mb-0"></p>';
	$content .= $tpl->load('input', ['html-id' => 'input-search', 'placeholder' => 'Suche', 'type' => 'text', 'css-class' => 'mt-2']);
	$content .= '<div id="div-regattas" class="ranking-detail-list mb-0"></div>';

	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-regattas']);

	// Menu
	$items = $tpl->load('menu/item-switch', ['In die Saison-Planung aufnehmen', 'html-id' => 'switch-planning-include', 'icon' => 'fa-check']);
	$items .= $tpl->load('menu/item-simple', ['', '#', 'html-id' => 'item-steuermann']);
	$sp['menus'] .= $tpl->load('menu/bottom', [$items, 'html-id' => 'menu-edit', 'title' => 'Regatta bearbeiten', 'height' => 320]);

	// Select sailor
	$items = $tpl->load('input', ['html-id' => 'input-edit-search', 'placeholder' => 'Suche', 'type' => 'text']);
	$sp['menus'] .= $tpl->load('menu/modal', [$items, 'html-id' => 'menu-sailor', 'height' => 500, 'width' => 350]);

	$sp['scripts'] .= $scripts->load('planning_edit');

?>
