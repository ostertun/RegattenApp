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
	if (regatta.length < 1) {
		if (formatDate('d.m', dateFrom) == '01.01') {
			$('#p-title').html('<font class="color-red2-dark">Datum noch unklar</font>');
		} else {
			$('#p-title').html(formatDate('d.m.Y', dateFrom) + ' - <font class="color-red2-dark">Datum nicht final</font>');
		}
	} else {
		$('#p-title').html(formatDate('d.m.Y', dateFrom) + ' - ' + formatDate('d.m.Y', dateTo));
	}
	
	var plannings = await dbGetDataIndex('plannings', 'regatta', regatta.id);
	if (plannings.length > 0) {
		$('#table-plannings').show();
		$('#p-info').hide();
		var tbody = '';
		for (var p in plannings) {
			var planning = plannings[p];
			
			tbody += '<tr>';
			
			tbody += '<td>' + (await dbGetData('users', planning.user)).username + '</td>';
			
			if (planning.steuermann != null) {
				tbody += '<td>' + (await dbGetData('sailors', planning.steuermann)).name + '</td>';
			} else {
				tbody += '<td>(noch unklar)</td>';
			}
			
			var crew = [];
			var cr = planning.crew.split(',');
			for (c in cr) {
				var s = await dbGetData('sailors', cr[c]);
				if (s != null) crew.push(s.name);
			}
			tbody += '<td>' + crew.join('<br>') + '</td>';
			
			tbody += '</tr>';
		}
		$('#table-plannings').find('tbody').html(tbody);
	} else {
		$('#p-info').text('Niemand plant bisher, hier hinzufahren!');
		$('#p-info').show();
		$('#table-plannings').hide();
	}
	
	hideLoader();
}