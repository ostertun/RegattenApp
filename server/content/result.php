<?php
	
	$sp['title'] = 'Ergebnisse - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = true;
	
	// Title, Inputs
	$content = '<h1 id="h1-title"></h1>';
	$content .= '<p id="p-title"></p>';
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	// Results
	$content = '<p id="p-info" class="mb-0"></p>';
	$content .= $tpl->load('table', ['html-id' => 'table-results', 'css-class' => 'mb-0 text-nowrap']);
	
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-results']);
	
	$sp['scripts'] .= $scripts->load('result');
	
?>