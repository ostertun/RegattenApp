<?php
	
	$sp['title'] = 'Regatten - Regatten.net Pirat';
	$sp['backbutton'] = 'index';
	$sp['activenav'] = 2;
	
	// Title, Inputs
	$content = "<h1>Regatten</h1>";
	
	$content .= $tpl->load('select', ['html-id' => 'select-year', 'placeholder' => 'Jahr', 'css-class' => 'mt-3 mb-0']);
	$content .= $tpl->load('input', ['html-id' => 'input-from', 'placeholder' => 'Von', 'type' => 'date', 'css-class' => 'mt-3']);
	$content .= $tpl->load('input', ['html-id' => 'input-to', 'placeholder' => 'Bis', 'type' => 'date']);
	$content .= $tpl->load('button', ['Anzeigen', '#', 'html-id' => 'button-show']);
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	// Regattas
	$content = '<p id="p-count" class="mb-0"></p>';
	$content .= $tpl->load('input', ['html-id' => 'input-search', 'placeholder' => 'Suche', 'type' => 'text', 'css-class' => 'mt-2']);
	$thead = '<tr><th id="th-number">#</th><th>Datum</th><th>Regatta</th>';
	if (($showSpecial = $_CLASS['special']) !== false) {
		$thead .= '<th>' . $_CLASS['special'] . '</th>';
	}
	$thead .= '<th>Informationen</th><th>Ergebnisse</th><th>RLF</th></tr>';
	$content .= $tpl->load('table', [$thead, 'html-id' => 'table-regattas', 'css-class' => 'mb-0']);
	
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-regattas']);
	
	$sp['scripts'] = '<script>const showSpecial = ' . ($showSpecial ? 'true' : 'false') . ';</script>';
	$sp['scripts'] .= $scripts->load('regattas');
	
?>