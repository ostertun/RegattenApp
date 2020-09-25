<?php
	
	$sp['title'] = 'Vereine - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = 'index';
	$sp['activenav'] = 4;
	
	// Title
	$content = "<h1>Vereine</h1>";
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	// List
	$content = '<p id="p-count" class="mb-0"></p>';
	$content .= $tpl->load('input', ['html-id' => 'input-search', 'placeholder' => 'Suche', 'type' => 'text', 'css-class' => 'mt-2']);
	$content .= '<div id="div-list" class="normal-list mb-0"></div>';
	
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-list']);
	
	// Pagination
	$sp['output'] .= $tpl->load('pagination', ['html-id' => 'pagination']);
	
	// Menu
	// TODO: add entries for jump2rank jump2club
	$items = $tpl->load('menu/item-icon', ['Vereins-Website', '', 'html-id' => 'menu-item-clubwebsite', 'icon' => 'fa-globe']);
	$sp['menus'] .= $tpl->load('menu/bottom', [$items, 'html-id' => 'menu-club', 'title' => 'Vereins-Details', 'height' => 320]);
	
	$sp['scripts'] .= $scripts->load('pagination', ['pageChange', 'page', 'pageCount', 'pagination']);
	$sp['scripts'] .= $scripts->load('clubs');
	
?>