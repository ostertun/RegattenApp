var siteScript = async function() {
	$('#card-nofactsinfo').hide();
	$('#card-entryfee').hide();
	$('#card-races').hide();
	$('#card-races').find('p').remove();
	$('#card-races').find('table').remove();
	$('#card-times').hide();
	$('#card-camping').hide();
	$('#card-food').hide();
	$('#card-text').hide();

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

	if (regatta.facts != null) {
		var facts = JSON.parse(regatta.facts);

		// Meldegeld
		if ('entry' in facts && 'price' in facts.entry) {
			$('#card-entryfee').show();
			var content = 'Meldegeld: <b>' + (new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(facts.entry.price)) + '</b>';
			if ('early' in facts.entry) {
				content += '<br />vergünstigt: <b>' + (new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(facts.entry.early)) + '</b> (bis ' + formatDate('d.m.Y', parseDate(regatta.meldungEarly)) + ')';
			}
			if ('late' in facts.entry) {
				content += '<br />nach Meldeschluss (' + formatDate('d.m.Y', parseDate(regatta.meldungSchluss)) + '): <b>' + (new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(facts.entry.late)) + '</b>';
			}
			$('#card-entryfee').find('p').html(content);
		}

		// Wettfahrten / Anzahl
		if ('races' in facts && 'cnt' in facts.races) {
			$('#card-races').show();
			$('#card-races').find('.content').append('<p>Anzahl Wettfahrten: <b>' + facts.races.cnt + '</b></p>');
			if ('days' in facts.races) {
				var table = $('<table class="table table-striped table-bordered text-nowrap">');
				var tbody = $('<tbody>');
				for (var day in facts.races.days) {
					var cnt = facts.races.days[day];
					day = formatDate('D, j.', parseDate(day));
					tbody.append('<tr><td>' + day + '</td><td><b>' + cnt + '</b></td></tr>')
				}
				table.append(tbody);
				$('#card-races').find('.content').append(table);
			}
		}

		// Wettfahrten / Racetimes
		if ('racetimes' in facts) {
			$('#card-races').show();
			var table = $('<table class="table table-striped table-bordered mb-0 text-nowrap">');
			var tbody = $('<tbody>');
			if ('sollzeit' in facts.racetimes) {
				tbody.append('<tr><td>Sollzeit</td><td>' + facts.racetimes.sollzeit + ' min</td></tr>');
			}
			if ('zeitlimit' in facts.racetimes) {
				tbody.append('<tr><td>Zeitlimit</td><td>' + facts.racetimes.zeitlimit + ' min</td></tr>');
			}
			if ('zielzeitfenster' in facts.racetimes) {
				tbody.append('<tr><td>Zielzeitfenster</td><td>' + facts.racetimes.zielzeitfenster + ' min</td></tr>');
			}
			table.append(tbody);
			$('#card-races').find('.content').append(table);
		}

		// Zeitplan
		if ('times' in facts) {
			$('#card-times').show();
			var tbody = $('#card-times').find('table').find('tbody');
			tbody.html('');
			if ('checkin' in facts.times) {
				tbody.append('<tr><td colspan="2" style="text-align: center; font-weight: bold;">Registrierung</td></tr>');
				for (var day in facts.times.checkin) {
					var times = facts.times.checkin[day];
					day = formatDate('D, j.', parseDate(day));
					var content = '';
					if ('from' in times && 'to' in times) content = times.from + ' bis ' + times.to; // TODO:
					else if ('from' in times) content = 'ab ' + times.from;
					else if ('to' in times) content = 'bis ' + times.to;
					tbody.append('<tr><td>' + day + '</td><td>' + content + '</td></tr>')
				}
			}
			if ('measurements' in facts.times) {
				tbody.append('<tr><td colspan="2" style="text-align: center; font-weight: bold;">Vermessung</td></tr>');
				for (var day in facts.times.measurements) {
					var times = facts.times.measurements[day];
					day = formatDate('D, j.', parseDate(day));
					var content = '';
					if ('from' in times && 'to' in times) content = times.from + ' bis ' + times.to; // TODO:
					else if ('from' in times) content = 'ab ' + times.from;
					else if ('to' in times) content = 'bis ' + times.to;
					tbody.append('<tr><td>' + day + '</td><td>' + content + '</td></tr>')
				}
			}
			if ('helmmeeting' in facts.times) {
				tbody.append('<tr><td colspan="2" style="text-align: center; font-weight: bold;">Steuerleutebesprechung</td></tr>');
				for (var day in facts.times.helmmeeting) {
					var time = facts.times.helmmeeting[day];
					day = formatDate('D, j.', parseDate(day));
					tbody.append('<tr><td>' + day + '</td><td>' + time + '</td></tr>')
				}
			}
			if ('firststart' in facts.times) {
				tbody.append('<tr><td colspan="2" style="text-align: center; font-weight: bold;">Erster Start</td></tr>');
				for (var day in facts.times.firststart) {
					var time = facts.times.firststart[day];
					day = formatDate('D, j.', parseDate(day));
					tbody.append('<tr><td>' + day + '</td><td>' + time + '</td></tr>')
				}
			}
			if ('laststart' in facts.times) {
				tbody.append('<tr><td colspan="2" style="text-align: center; font-weight: bold;">Letzter Start</td></tr>');
				for (var day in facts.times.laststart) {
					var time = facts.times.laststart[day];
					day = formatDate('D, j.', parseDate(day));
					tbody.append('<tr><td>' + day + '</td><td>' + time + '</td></tr>')
				}
			}
		}

		// Camping
		if ('camping' in facts) {
			$('#card-camping').show();
			$('#card-camping').find('p').remove();
			if ('tent' in facts.camping) {
				var content = '';
				if ('price' in facts.camping.tent && facts.camping.tent.price > 0) {
					content += 'Zelten möglich für <b>' + (new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(facts.camping.tent.price)) + '</b>';
				}
				else if ('pricepernight' in facts.camping.tent) {
					content += 'Zelten möglich für <b>' + (new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(facts.camping.tent.pricepernight)) + ' pro Nacht</b>';
				}
				else {
					content += 'Zelten möglich und im Preis enthalten';
				}
				if ('electricity' in facts.camping.tent) {
					content += '<br />';
					if (facts.camping.tent.electricity > 0) {
						content += 'Strom: <b>' + (new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(facts.camping.tent.electricity)) + '</b>';
					}
					else {
						content += 'Strom inklusive';
					}
				}
				$('#card-camping').find('.content').append('<p>' + content + '</p>');
			}
			if ('van' in facts.camping) {
				var content = '';
				if ('price' in facts.camping.van && facts.camping.van.price > 0) {
					content += 'Wohnwagen/-mobil möglich für <b>' + (new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(facts.camping.van.price)) + '</b>';
				}
				else if ('pricepernight' in facts.camping.van) {
					content += 'Wohnwagen/-mobil möglich für <b>' + (new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(facts.camping.van.pricepernight)) + ' pro Nacht</b>';
				}
				else {
					content += 'Wohnwagen/-mobil möglich und im Preis enthalten';
				}
				if ('electricity' in facts.camping.van) {
					content += '<br />';
					if (facts.camping.van.electricity > 0) {
						content += 'Strom: <b>' + (new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(facts.camping.van.electricity)) + '</b>';
					}
					else {
						content += 'Strom inklusive';
					}
				}
				$('#card-camping').find('.content').append('<p>' + content + '</p>');
			}
			if ('beds' in facts.camping) {
				var content = '';
				if ('price' in facts.camping.beds && facts.camping.beds.price > 0) {
					content += 'Betten im Clubhaus vorhanden für <b>' + (new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(facts.camping.beds.price)) + '</b>';
				}
				else if ('pricepernight' in facts.camping.beds) {
					content += 'Betten im Clubhaus vorhanden für <b>' + (new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(facts.camping.beds.pricepernight)) + ' pro Nacht</b>';
				}
				else {
					content += 'Betten im Clubhaus vorhanden und im Preis enthalten';
				}
				$('#card-camping').find('.content').append('<p>' + content + '</p>');
			}
			if ('text' in facts.camping) {
				var p = $('<p>');
				p.text(facts.camping.text);
				p.html(p.html().replace(/\n/g, '<br />'));
				$('#card-camping').find('.content').append(p);
			}
		}

		// Verpflegung
		if ('food' in facts) {
			$('#card-food').show();
			$('#card-food').find('p').remove();
			for (var day in facts.food) {
				var food = facts.food[day];
				if (day == 'text') {
					var p = $('<p>');
					p.text(food);
					p.html(p.html().replace(/\n/g, '<br />'));
					$('#card-food').find('.content').append(p);
				}
				else {
					day = formatDate('D, j.', parseDate(day));
					var content = '';
					if ('breakfast' in food) {
						content += 'Frühstück am ' + day;
						if (food.breakfast > 0) content += ' für <b>' + (new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(food.breakfast)) + '</b><br />';
						else content += ' inklusive<br />';
					}
					if ('dinner' in food) {
						content += 'Abendessen';
						if ('dinnerdesc' in food) content += ' (' + food.dinnerdesc + ')';
						content += ' am ' + day;
						if (food.dinner > 0) content += ' für <b>' + (new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(food.dinner)) + '</b><br />';
						else content += ' inklusive<br />';
					}
					$('#card-food').find('.content').append('<p>' + content + '</p>');
				}
			}
		}

		// Weitere Informationen
		if ('text' in facts) {
			$('#card-text').show();
			var p = $('#card-text').find('p');
			p.text(facts.text);
			p.html(p.html().replace(/\n/g, '<br />'));
		}
	} else {
		$('#card-nofactsinfo').show();
	}

	hideLoader();
}
