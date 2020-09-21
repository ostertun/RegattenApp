<?php
	
	$content = "<h1>$_CLASS[name]</h1>";
	$content .= "<p>$_CLASS[desc]</p>";
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	$content = "<h2>Deine Favoriten</h2>";
	$thead = "<tr><th>Segler</th><th>Rangliste 2020</th></tr>";
	$content .= $tpl->load('table', [$thead, 'html-id' => 'table-favorites', 'css-class' => 'mb-0 mt-3']);
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
?>