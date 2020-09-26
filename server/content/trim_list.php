<?php
	
	// TODO: Create site
	
	$sp['title'] = 'Seite noch nicht unterstuuml;tzt - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = true;
	
	$content = $tpl->load('error', ['404', 'Seite existiert noch nicht']);
	$content .= '<p>';
	$content .= 'Die gesuchte Seite ist leider noch nicht verf&uuml;gbar.<br>';
	$content .= 'Wir arbeiten daran, sie schnellstm&ouml;glich zur Verf&uuml;gung zu stellen.<br>';
	$content .= 'Wie w&auml;re es mit der Homepage?';
	$content .= '</p>';
	$content .= $tpl->load('button', ['Zur Startseite', LINK_PRE . 'index', 'css-class' => 'mb-3']);
	$content .= $tpl->load('button', ['Kontakt', LINK_PRE . 'contact']);
	
	$sp['output'] = $tpl->load('card', [$content, 'css-class' => 'text-center pt-3']);
	
?>