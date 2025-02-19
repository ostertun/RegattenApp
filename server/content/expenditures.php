<?php

$sp['title'] = 'Ausgaben-Verwaltung - Regatten.net ' . $_CLASS['name'];
$sp['backbutton'] = 'index';
$sp['activenav'] = 5;

// Title
$content = "<h1>Ausgaben-Verwaltung</h1>";
$content .= $tpl->load('button', ['<i class="fas fa-plus"></i>&ensp;Neue Ausgabe', '#', 'html-id' => 'button-add', 'css-class' => 'mt-3 mb-2']);
$content .= $tpl->load('button', ['<i class="fas fa-plus"></i>&ensp;Neuer Geldtransfer', '#', 'html-id' => 'button-add-transfer', 'css-class' => 'mt-3 mb-0']);

$sp['output'] .= $tpl->load('card', [$content, 'css-class' => 'show-loggedin']);

// Not loggedin
$content = '<h1>Ausgaben-Verwaltung</h1>';
$content .= '<p>Um die Ausgaben-Verwaltung nutzen zu können, musst Du angemeldet sein.<br><a href="#" data-menu="menu-login">Melde Dich hier an</a> oder <a href="https://regatten.net/#signup">registriere Dich jetzt kostenlos</a>.</p>';

$sp['output'] .= $tpl->load('card', [$content, 'css-class' => 'show-notloggedin']);

// List
$content = '<p id="p-count" class="mb-0"></p>';
$content .= $tpl->load('input', ['html-id' => 'input-search', 'placeholder' => 'Suche', 'type' => 'text', 'css-class' => 'mt-2']);
$content .= '<div id="div-list" class="normal-list mb-0"></div>';

$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-list', 'css-class' => 'show-loggedin']);

// Pagination
$sp['output'] .= $tpl->load('pagination', ['html-id' => 'pagination', 'css-class' => 'show-loggedin']);

// Menu Add
$items = $tpl->load('menu/item-simple', ['bezahlt von: ', '#', 'html-id' => 'item-add-user-from']);
$items .= $tpl->load('input', ['html-id' => 'input-add-date', 'placeholder' => 'Datum des Transfers', 'type' => 'date', 'css-class' => 'mt-3']);
$items .= $tpl->load('input', ['html-id' => 'input-add-amount', 'placeholder' => 'Betrag in Euro', 'type' => 'number" min="0.01" step="0.01']);
$options = '<option value="entryfee">Meldegeld</option>';
$options .= '<option value="camping">Camping</option>';
$options .= '<option value="food">Essen</option>';
$options .= '<option value="other">andere</option>';
$items .= $tpl->load('select', ['html-id' => 'select-add-purpose', 'placeholder' => 'Verwendung', 'options' => $options]);
$items .= $tpl->load('input', ['html-id' => 'input-add-regatta-name', 'placeholder' => 'Name der Regatta (optional)', 'type' => 'text']);
$items .= $tpl->load('input', ['html-id' => 'input-add-purpose-text', 'placeholder' => 'Verwendungszweck (optional)', 'type' => 'text']);
$items .= '<p style="line-height: normal; margin-bottom: 0;">Für wen wurde das Geld ausgegeben? (z.B. Du und Dein Segelpartner)<br>Hinweis: Der angegebene Betrag wird durch die Personen geteilt, die Du hier auswählst.</p>';
$items .= $tpl->load('menu/item-simple', ['<span style="font-style:italic;">Weiteren Benutzer hinzuf&uuml;gen</span>', '#', 'html-id' => 'item-add-user-to']);
$items .= $tpl->load('button', ['Speichern', '#', 'html-id' => 'button-add-save', 'css-class' => 'mb-3']);
$sp['menus'] .= $tpl->load('menu/modal', [$items, 'html-id' => 'menu-add', 'title' => 'Neue Ausgabe', 'height' => '90vh', 'width' => '90vw']);

// Menu Add Transfer
$items = $tpl->load('menu/item-switch', ['Geld bekommen', 'html-id' => 'switch-add-transfer-received', 'icon' => 'fa-arrow-left']);
$items .= $tpl->load('menu/item-simple', ['von: <font style="font-style:italic;">bitte auswählen</font>', '#', 'html-id' => 'item-add-transfer-user']);
$items .= $tpl->load('input', ['html-id' => 'input-add-transfer-date', 'placeholder' => 'Datum des Transfers', 'type' => 'date', 'css-class' => 'mt-3']);
$items .= $tpl->load('input', ['html-id' => 'input-add-transfer-amount', 'placeholder' => 'Betrag in Euro', 'type' => 'number" min="0.01" step="0.01']);
$items .= $tpl->load('input', ['html-id' => 'input-add-transfer-purpose-text', 'placeholder' => 'Verwendungszweck (optional)', 'type' => 'text']);
$items .= $tpl->load('button', ['Speichern', '#', 'html-id' => 'button-add-transfer-save']);
$sp['menus'] .= $tpl->load('menu/modal', [$items, 'html-id' => 'menu-add-transfer', 'title' => 'Neuer Geldtransfer', 'height' => 470, 'width' => '90vw']);

// Select user
$items = $tpl->load('input', ['html-id' => 'input-user-search', 'placeholder' => 'Suche...', 'type' => 'text']);
$sp['menus'] .= $tpl->load('menu/modal', [$items, 'html-id' => 'menu-select-user', 'title' => 'Benutzer auswählen', 'height' => 500, 'width' => '90vw']);

$sp['scripts'] .= $scripts->load('pagination', ['pageChange', 'page', 'pageCount', 'pagination']);
$sp['scripts'] .= $scripts->load('expenditures-add');
$sp['scripts'] .= $scripts->load('expenditures');

?>