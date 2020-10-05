<?php

	$sp['title'] = 'News - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = true;
	$sp['activenav'] = 5;

	// Title
	$content = "<h1>Neuigkeiten</h1>";
	$content .= '<p>Aktuelles der letzten zw&ouml;lf Monate</p>';

	$sp['output'] .= $tpl->load('card', [$content]);

	$sp['output'] .= '<div id="news-entries"></div>';

	// Pagination
	$sp['output'] .= $tpl->load('pagination', ['html-id' => 'pagination']);

	// Menu
	$sp['menus'] .= $tpl->load('menu/modal', ['html-id' => 'menu-news', 'title' => 'Details']);

	$sp['scripts'] .= $scripts->load('pagination', ['pageChange', 'page', 'pageCount', 'pagination']);
	$cardTemplate = $tpl->load('card', ['%CONTENT%', 'html-id' => '%ID%', 'css-class' => 'card-news']);
	$cardTemplate = str_replace("\n", '', $cardTemplate);
	$cardTemplate = str_replace("\r", '', $cardTemplate);
	$sp['scripts'] .= "<script>const cardTemplate = '" . $cardTemplate . "';</script>";
	$sp['scripts'] .= $scripts->load('news');

?>
