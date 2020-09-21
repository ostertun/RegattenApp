<?php
	
	// Title
	$content = "<h1>$_CLASS[name]</h1>";
	$content .= "<p>$_CLASS[desc]</p>";
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	// Favorites
	$content = "<h2>Deine Favoriten</h2>";
	$thead = "<tr><th>Segler</th><th>Rangliste 2020</th></tr>";
	$content .= $tpl->load('table', [$thead, 'html-id' => 'table-favorites', 'css-class' => 'mb-0 mt-3']);
	
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-favorites']);
	
	// Planning next
	$content = "<h2>Deine n&auml;chsten Regatten</h2>";
	$thead = "<tr><th>Datum</th><th>Regatta</th><th>Informationen</th><th>RLF</th><th>Segler</th></tr>";
	$content .= $tpl->load('table', [$thead, 'html-id' => 'table-yournext', 'css-class' => 'mb-0 mt-3']);
	
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-yournext']);
	
	// Next
	$content = "<h2>N&auml;chste Regatten</h2>";
	$thead = "<tr><th>Datum</th><th>Regatta</th><th>Informationen</th><th>RLF</th></tr>";
	$content .= $tpl->load('table', [$thead, 'html-id' => 'table-next', 'css-class' => 'mb-0 mt-3']);
	
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-next']);
	
	// Last
	$content = "<h2>Letzte Regatten</h2>";
	$thead = "<tr><th>Datum</th><th>Regatta</th><th>Ergebnisse</th><th>RLF</th></tr>";
	$content .= $tpl->load('table', [$thead, 'html-id' => 'table-last', 'css-class' => 'mb-0 mt-3']);
	
	$sp['output'] .= $tpl->load('card', [$content, 'html-id' => 'card-last']);
	
	// Calendar
	$content = "<h2>Regatta-Kalender</h2>";
	$content .= "<p>Du willst alle Regatta-Termine in deinem Kalender, aber nicht alles abtippen?<br>Kein Problem! Abonniere einfach unseren ics-Kalender.</p>";
	$content .= "<p><b>Nur die Regatten, zu denen Du gehst?</b><br>Auch kein Problem! Erstelle einfach eine <a href=\"#\">Saison-Planung</a> und abonniere Deinen persönlichen Kalender.</p>";
	$content .= $tpl->load('button', ['Regatta-Kalender', '#', 'css-class' => 'mb-2']);
	$content .= $tpl->load('button', ['Kalender f&uuml;r Timon', '#']);
	
	$sp['output'] .= $tpl->load('card', [$content]);
	
	$sp['scripts'] = '
<script>
	var siteScript = function() {
		if (loggedin) {
			$(\'#table-favorites\').find(\'tbody\').html(\'<tr><td>Finn Soetebier</td><td>noch nicht verf&uuml;gbar</td></tr>\');
			$(\'#table-yournext\').find(\'tbody\').html(\'<tr><td style="white-space:nowrap;">10. Oct \\\'20<br>14. Oct \\\'20</td><td><a href="#">BSC</a><br>VERSCHOBEN: IDJM, Blankenese</td><td><a href="#">Informationen</a><br><a href="#">Meldung</a> <font style="color:red;">(noch 5 Tage)</a></td><td>1,26</td><td>Finn Soetebier<br>Timon Ostertun</td></tr>\');
		} else {
			$(\'#card-favorites\').hide();
			$(\'#card-yournext\').hide();
		}
		$(\'#table-next\').find(\'tbody\').html(\'<tr><td style="white-space:nowrap;">10. Oct \\\'20<br>14. Oct \\\'20</td><td><a href="#">BSC</a><br>VERSCHOBEN: IDJM, Blankenese</td><td><a href="#">Informationen</a><br><a href="#">Meldung</a> <font style="color:red;">(noch 5 Tage)</a></td><td>1,26</td></tr>\');
		$(\'#table-last\').find(\'tbody\').html(\'<tr><td style="white-space:nowrap;">10. Oct \\\'20<br>14. Oct \\\'20</td><td><a href="#">BSC</a><br>VERSCHOBEN: IDJM, Blankenese</td><td><i style="color:green;" class="fas fa-check"></i> <a href="#">Ergebnisse</a></td><td>1,26</td></tr>\');
	}
</script>
	';
	
?>