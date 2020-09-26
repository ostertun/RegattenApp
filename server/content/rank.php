<?php
	
	$sp['title'] = 'Ranglisten - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = 'index';
	$sp['activenav'] = 3;
	
	// Title, Inputs
	$content = "<h1>Ranglisten</h1>";
	
	$options = '<option value="year">Jahres-Rangliste</option>';
	$options .= '<option value="youth">Jugend-Rangliste</option>';
	$options .= '<option value="idjm">' . $_CLASS['youth-german-name'] . '-Rangliste</option>';
	$options .= '<option value="user">Benutzerdefiniert</option>';
	$content .= $tpl->load('select', ['html-id' => 'select-type', 'placeholder' => 'Rangliste', 'options' => $options, 'css-class' => 'mt-3 mb-0']);
	$content .= $tpl->load('select', ['html-id' => 'select-year', 'placeholder' => 'Jahr', 'css-class' => 'mt-3 mb-0']);
	$content .= $tpl->load('input', ['html-id' => 'input-from', 'placeholder' => 'Von', 'type' => 'date', 'css-class' => 'mt-3']);
	$content .= $tpl->load('input', ['html-id' => 'input-to', 'placeholder' => 'Bis', 'type' => 'date']);
	$chbox = $tpl->load('checkbox', ['html-id' => 'input-jugend', 'placeholder' => 'Jugend']);
	$content .= '<div class="mb-3" style="display:inline-block; width:50%;">' . $chbox . '</div>';
	$chbox = $tpl->load('checkbox', ['html-id' => 'input-jugstrict', 'placeholder' => 'Streng']);
	$content .= '<div class="mb-3" style="display:inline-block; width:50%;">' . $chbox . '</div>';
	$content .= $tpl->load('button', ['Anzeigen', '#', 'html-id' => 'button-show']);
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	// No Results
	$content = '<h2 class="color-white">ACHTUNG</h2>';
	$content .= '<p class="color-white">Zu folgenden Regatten wurden noch keine Ergebnisse hinterlegt:</p>';
	$content .= '<ul id="ul-noresults"></ul>';
	
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-noresults', 'css-class' => 'bg-red2-dark']);
	
	// Ranking
	$content = $tpl->load('input', ['html-id' => 'input-search', 'placeholder' => 'Suche', 'type' => 'text']);
	$content .= '<div id="div-rank" class="ranking-list mb-0"></div>';
	
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-rank']);
	
	// Menu
	$items = '<p id="menu-item-text" class="mb-2 mt-1" style="line-height: 1.5em;"></p>';
	$items .= '<div id="div-details" class="ranking-detail-list mb-3" style="line-height: 2em;"></div>';
	$sp['menus'] .= $tpl->load('menu/bottom', [$items, 'html-id' => 'menu-rank', 'title' => 'Ranglisten-Details', 'height' => 500]);
	
	$sp['scripts'] .= $scripts->load('rank');
	
?>