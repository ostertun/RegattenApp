<?php
	
	$sp['title'] = 'RLP Rechner - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = 'index';
	$sp['activenav'] = 5;
	
	// Title
	$content = "<h1>RLP Rechner</h1>";
	$content .= '<p>Einfach Ranglistenpunkte berechnen</p>';
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	// Inputs
	$content = $tpl->load('input', ['html-id' => 'input-rlf', 'placeholder' => 'Ranglistenfaktor (rlf)', 'type' => 'number']);
	$content .= $tpl->load('input', ['html-id' => 'input-m', 'placeholder' => 'Multiplikator (m)', 'type' => 'number']);
	$content .= $tpl->load('input', ['html-id' => 'input-fb', 'placeholder' => 'Gezeitete Boote (fb)', 'type' => 'number']);
	$content .= $tpl->load('input', ['html-id' => 'input-pl', 'placeholder' => 'Platzierung (pl)', 'type' => 'number']);
	$content .= $tpl->load('button', ['Hinzuf&uuml;gen', '#', 'html-id' => 'button-add']);
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	// Table
	$thead = '<tr><th>RLF</th><th>m</th><th>fb</th><th>pl</th><th>RLP</th><th></th></tr>';
	$content = $tpl->load('table', [$thead, 'html-id' => 'table-races']);
	$content .= '<p id="p-result"></p>';
	
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-races']);
	
	// Infos
	$content = '<h2>Hinweise zum Ausf&uuml;llen</h2>';
	$content .= '<p><b>Ranglistenfaktor (RLF)</b><br>';
	$content .= 'Der Ranglistenfaktor ist ein von der KV vorgegebener Faktor zwischen 1,0 und 1,6 zur Gewichtung der Regatten.<br>';
	$content .= 'Du findest ihn in der <a href="' . LINK_PRE . 'regattas">Regatten-Liste</a>.';
	$content .= '</p>';
	$content .= '<p><b>Multiplikator (m)</b><br>';
	$content .= 'Der Multiplikator gibt an, wie oft eine Regatta in die Wertung eingeht.<br>';
	$content .= 'Er ist abh&auml;ngig von den tats&auml;chlich gesegelten Wettfahrten. Dabei gilt:<br>';
	$content .= '<b>1</b> Wettfahrt => <b>m = 1</b><br>';
	$content .= '<b>2</b> Wettfahrten => <b>m = 2</b><br>';
	$content .= '<b>3</b> Wettfahrten => <b>m = 3</b><br>';
	$content .= '<b>4 oder mehr</b> Wettfahrten => <b>m = 4</b><br>';
	$content .= 'Ist die Regatta f&uuml;r mehr als 2 Tage ausgeschrieben, gilt au&szlig;erdem:<br>';
	$content .= '<b>6 oder mehr</b> Wettfahrten => <b>m = 5</b>';
	$content .= '</p>';
	$content .= '<p><b>Gezeitete Boote (fb)</b><br>';
	$content .= 'Die Anzahl der Boote, die in mindestens einer Wettfahrt ins Ziel gefahren sind.';
	$content .= '</p>';
	$content .= '<p><b>Platzierung (pl)</b><br>';
	$content .= 'Deine Platzierung in den Endergebnissen';
	$content .= '</p>';
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	$content = '<h2>Berechnung</h2>';
	$content .= '<p>Die Ranglistenpunkte (RLP) f&uuml;r eine Regatta berechnen sich nach folgender Formel:<br>';
	$content .= '<i>RLP = RLF * 100 * ((fb + 1 - pl) / fb)</i><br>';
	$content .= 'Diese Ranglistenpunkte k&ouml;nnen je nach Multiplikator bis zu 5 mal in die Wertung eingehen.<br>';
	$content .= 'Der Mittelwert der 9 besten Wertungen ergibt die Ranglistenpunkte.';
	$content .= '</p>';
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	$sp['scripts'] .= $scripts->load('calc');
	
?>