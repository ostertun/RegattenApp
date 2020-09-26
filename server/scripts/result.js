var siteScript = async function() {
	var regattaId = findGetParameter('regatta');
	if (regattaId == null) {
		$('#h1-title').text('Regatta nicht gefunden');
		hideLoader();
		return;
	}
	var regatta = await dbGetData('regattas', regattaId);
	if (regatta == null) {
		$('#h1-title').text('Regatta nicht gefunden');
		hideLoader();
		return;
	}
	var dateFrom = parseDate(regatta['date']);
	var dateTo = parseDate(regatta['date']);
	dateTo.setDate(dateTo.getDate() + Math.max(parseInt(regatta['length']) - 1, 0));
	
	$('#h1-title').text(regatta.name);
	$('#p-title').text(formatDate('d.m.Y', dateFrom) + ' - ' + formatDate('d.m.Y', dateTo));
	
	var results = await dbGetResultCalculated(regatta);
	if (results.length > 0) {
		var m;
		if (regatta.m > 0) {
			m = regatta.m;
		} else if (regatta.races <= 4) {
			m = regatta.races;
		} else {
			if ((regatta.length > 2) && (regatta.races >= 6)) {
				m = 5;
			} else {
				m = 4;
			}
		}
		$('#p-info').text(regatta.races + ' Wettfahrten, ' + regatta.streicher + ' Streicher, m = ' + m);
		
		$('#table-results').show();
		var thead = '<tr><th>#</th><th>Boot</th><th>Crew</th><th></th>';
		for (var i = 1; i <= regatta.races; i ++) thead += '<th>WF ' + i + '</th>';
		thead += '<th></th><th>Summe</th><th>Netto</th><th>#</th><th>RLP</th></tr>';
		$('#table-results').find('thead').html(thead);
		
		var tbody = '';
		for (var r in results) {
			var result = results[r];
			var boat = await dbGetData('boats', result.boat);
			var steuermann = (await dbGetData('sailors', result.steuermann)).name;
			var cr = result.crew.split(',');
			var crew = [];
			for (c in cr) {
				var s = await dbGetData('sailors', cr[c]);
				if (s != null) crew.push(s.name);
			}
			
			tbody += '<tr>';
			tbody += '<td>' + result.place + '.</td>';
			tbody += '<td>' + boat.sailnumber + '<br>' + boat.name + '</td>';
			tbody += '<td>' + steuermann + '<br>' + crew.join('<br>') + '</td>';
			tbody += '<td></td>';
			for (var i = 0; i < regatta.races; i ++) {
				tbody += '<td>' + result.texts[i] + '</td>';
			}
			tbody += '<td></td>';
			tbody += '<td>' + result.brutto + '</td>';
			tbody += '<td>' + result.netto + '</td>';
			tbody += '<td>' + result.place + '.</td>';
			tbody += '<td>' + parseFloat(result.rlp).toFixed(2) + '</td>';
			tbody += '</tr>';
		}
		$('#table-results').find('tbody').html(tbody);
	} else {
		$('#p-info').text('Keine Ergebnisse gefunden.');
		$('#table-results').hide();
	}
	
	hideLoader();
}