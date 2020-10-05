<?php

	// TODO: Create site

	$sp['title'] = 'Seite noch nicht unterstuuml;tzt - Regatten.net ' . $_CLASS['name'];
	$sp['backbutton'] = true;

	$content = $tpl->load('error', ['404', 'Seite existiert noch nicht']);
	$content .= '<p>';
	$content .= 'Du kannst die Saison-Planung momentan leider noch nicht in der App bearbeiten.<br>';
	$content .= 'Bis diese Funktion implementiert wurde, erstelle Deine Saison-Planung bitte auf <a target="_blank" href="https://regatten.net/' . BOATCLASS . '/planning_edit">unserer Website</a>.<br>';
	$content .= 'Deine Saison-Planung wird dann automatisch synchronisiert und ist dann auch in dieser App verf&uuml;gbar.<br>';
	$content .= 'Wir arbeiten daran, dass Du Deine Saison-Planung bald auch in der App bearbeiten kannst.<br>';
	$content .= '</p>';
	$content .= $tpl->load('button', ['Zur Website', 'https://regatten.net/' . BOATCLASS, 'css-class' => 'mb-3']);
	$content .= $tpl->load('button', ['Zur Startseite', LINK_PRE . 'index', 'css-class' => 'mb-3']);
	$content .= $tpl->load('button', ['Kontakt', LINK_PRE . 'contact']);

	$sp['output'] = $tpl->load('card', [$content, 'css-class' => 'text-center pt-3']);

?>
