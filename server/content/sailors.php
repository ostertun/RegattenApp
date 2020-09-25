<?php
	
	$sp['title'] = 'Segler - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = 'index';
	$sp['activenav'] = 4;
	
	// Title
	$content = "<h1>Segler</h1>";
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	// Info Years
	$content = '<h2>Jahrg&auml;nge</h2>';
	$content .= '<p>';
	$content .= 'Zu vielen Seglern fehlen uns leider noch die Jahrg&auml;nge. Diese ben&ouml;tigen wir jedoch, um die Ranglisten vern&uuml;nftig zu erstellen.<br>';
	$content .= 'Solltest Du jemanden kennen, dessen Jahrgang hier in der Liste noch nicht hinterlegt ist oder der wom&ouml;glich falsch ist, <b>hilf uns bitte</b>, indem Du diesen eintr&auml;gst!<br>';
	$content .= 'Klicke dazu einfach auf den entsprechenden Segler und w&auml;hle Jahrgang bearbeiten aus.<br>';
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
	// TODO: add entries for jump2rank jump2club
	$items = $tpl->load('menu/item-icon', ['', '#', 'html-id' => 'menu-item-year', 'icon' => 'fa-edit']);
	$items .= $tpl->load('menu/item-icon', ['Vereins-Website', '', 'html-id' => 'menu-item-clubwebsite', 'icon' => 'fa-globe']);
	$sp['menus'] .= $tpl->load('menu/bottom', [$items, 'html-id' => 'menu-sailor', 'title' => 'Segler-Details', 'height' => 320]);
	
	$sp['scripts'] .= $scripts->load('pagination', ['pageChange', 'page', 'pageCount', 'pagination']);
	$sp['scripts'] .= $scripts->load('sailors');
	
?>