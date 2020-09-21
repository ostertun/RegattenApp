<?php
	
	$content = $tpl->load('error', ['404', 'Seite nicht gefunden']);
	$content .= '<p>';
	$content .= 'Die gesuchte Seite wurde nicht gefunden.<br>';
	$content .= 'Wie w&auml;re es mit der Homepage?';
	$content .= '</p>';
	$content .= $tpl->load('button', ['Zur Startseite', LINK_PRE . 'index', 'css-class' => 'mb-3']);
	$content .= $tpl->load('button', ['Kontakt', LINK_PRE . 'contact']);
	
	$sp['output'] = $tpl->load('card', [$content, 'css-class' => 'text-center pt-3']);
	
?>