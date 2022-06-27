<?php

	$sp['title'] = 'Fakten - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = true;
	$sp['activenav'] = 2;

	// Title, Inputs
	$content = '<h1 id="h1-title"></h1>';
	$content .= '<p id="p-title"></p>';

	$sp['output'] .= $tpl->load('card', [$content]);

	// NO FACTS INFO
	$content = '<p>Es sind keine Fakten zu dieser Veranstaltung hinterlegt. Bitte lies die Ausschreibung.</p>';
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-nofactsinfo']);

	// Meldegeld
	$content = '<h2>Meldegeld</h2>';
	$content .= '<p></p>';
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-entryfee']);

	// Wettfahrten
	$content = '<h2>Wettfahrten</h2>';
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-races']);

	// Zeitplan
	$content = '<h2>Zeitplan</h2>';
	$content .= $tpl->load('table', ['css-class' => 'mb-0 text-nowrap']);
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-times']);

	// Camping
	$content = '<h2>Camping</h2>';
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-camping']);

	// Verpflegung
	$content = '<h2>Verpflegung</h2>';
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-food']);

	// Weitere Infos
	$content = '<h2>Weitere Informationen</h2><p></p>';
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-text']);

	// Disclaimer
	$content = '<p><i>Alle Angaben ohne Gewähr. Änderungen vorbehalten. Am Ende gilt, was in der Ausschreibung / Segelanweisung steht!</i></p>';
	$sp['output'] .= $tpl->load('card', [$content]);

	$sp['scripts'] .= $scripts->load('regatta_facts');

?>
