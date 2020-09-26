<?php
	
	$sp['title'] = 'Kontakt - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = true;
	$sp['activenav'] = 5;
	
	// TITLE
	$content = '<h1>Kontakt</h1>';
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	// Info
	$content = '<p>';
	$content .= 'Du hast eine Frage? Du hast einen Fehler in unserer Software oder in den gespeicherten Daten gefunden? Du willst Regatten.net auch f&uuml;r Deine Bootsklasse nutzen?<br>';
	$content .= 'Egal was es ist, lass es uns wissen! Schreibe uns eine Mail an <a href="mailto:info@regatten.net">info@regatten.net</a> oder nutze einfach dieses Kontakt-Formular.<br>';
	$content .= 'Wir werden Deine Anfrage so schnell wie m&ouml;glich bearbeiten.';
	$content .= '</p>';
	$content .= '<p>';
	$content .= 'Alternativ erreichst Du uns auch telefonisch unter <a href="tel:+4941039659768">+49 (0) 4103 965 976 8</a><br>';
	$content .= 'Mo-Fr: 7-20 Uhr<br>';
	$content .= 'Sa: 9-17 Uhr';
	$content .= '</p>';
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	// Formular
	$content = '<h2>Kontakt-Formular</h2>';
	$content .= $tpl->load('input', ['html-id' => 'input-name', 'placeholder' => 'Dein Name', 'type' => 'text']);
	$content .= $tpl->load('input', ['html-id' => 'input-email', 'placeholder' => 'Email-Adresse', 'type' => 'email']);
	$content .= $tpl->load('input', ['html-id' => 'input-subject', 'placeholder' => 'Betreff', 'type' => 'text']);
	$content .= $tpl->load('textarea', ['html-id' => 'input-message', 'placeholder' => 'Deine Nachricht']);
	$content .= $tpl->load('button', ['Senden', '#', 'html-id' => 'button-send']);
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	$sp['scripts'] .= $scripts->load('contact');
	
?>