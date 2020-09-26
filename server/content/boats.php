<?php
	
	$sp['title'] = 'Boote - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = 'index';
	$sp['activenav'] = 4;
	
	// Title
	$content = "<h1>Boote</h1>";
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	// Info Years
	$content = '<h2>Bootsnamen</h2>';
	$content .= '<p>';
	$content .= 'Genauso wie bei den Jahrg&auml;ngen der Segler fehlen uns auch viele Bootsnamen.<br>';
	$content .= 'Kennst Du ein Boot, dessen Name hier noch nicht hinterlegt ist oder das vielleicht umgetauft wurde, <b>hilf uns bitte</b>, indem Du den Namen eintr&auml;gst!<br>';
	$content .= 'Klicke dazu einfach auf das entsprechende Boot und w&auml;hle Bootsnamen bearbeiten aus.<br>';
	$content .= 'Vielen Dank f&uuml;r Deine Unterst&uuml;tzung!';
	$content .= '</p>';
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	// List
	$content = '<p id="p-count" class="mb-0"></p>';
	$content .= $tpl->load('input', ['html-id' => 'input-search', 'placeholder' => 'Suche', 'type' => 'text', 'css-class' => 'mt-2']);
	$content .= '<div id="div-list" class="normal-list mb-0"></div>';
	
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-list']);
	
	// Pagination
	$sp['output'] .= $tpl->load('pagination', ['html-id' => 'pagination']);
	
	// Menu
	// TODO: add entries for jump2club and more?
	$items = $tpl->load('menu/item-icon', ['', '#', 'html-id' => 'menu-item-boatname', 'icon' => 'fa-edit']);
	$items .= $tpl->load('menu/item-icon', ['Vereins-Website', '', 'html-id' => 'menu-item-clubwebsite', 'icon' => 'fa-globe']);
	$sp['menus'] .= $tpl->load('menu/bottom', [$items, 'html-id' => 'menu-boat', 'title' => 'Boots-Details', 'height' => 320]);
	
	$sp['scripts'] .= $scripts->load('pagination', ['pageChange', 'page', 'pageCount', 'pagination']);
	$sp['scripts'] .= $scripts->load('boats');
	
?>