<?php

	$sp['title'] = 'Umleitung - Regatten.net ' . $_CLASS['name'];

	// Title
	$content = '<h1>Umleitung</h1>';
	$content .= '<p>Wir leiten Dich in K&uuml;rze zur gew&uuml;nschten Website weiter</p>';

	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-title']);

	$sp['scripts'] .= $scripts->load('go2url');

?>
