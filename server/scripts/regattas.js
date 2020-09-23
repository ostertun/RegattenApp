function selectChange(callSiteScript = true) {
	var val = $('#select-year').val();
	if (val == "user") {
		$('#input-from').show();
		$('#input-to').show();
		$('#button-show').show();
	} else {
		$('#input-from').hide();
		$('#input-to').hide();
		$('#button-show').hide();
		
		$('#input-from').val(val + '-01-01');
		$('#input-to').val(val + '-12-31');
		
		if (callSiteScript && (typeof siteScript === 'function'))
			siteScript();
	}
}

function initYear() {
	var year = findGetParameter('year');
	if (year === null) year = new Date().getFullYear();
	
	$('#select-year').html('<option value="' + year + '">' + year + '</option>');
	$('#select-year').val(year);
	
	selectChange(false);
}

var firstCall = true;
var rows = [];
var heuteLen = 0;
var today;

async function drawTable () {
	//setLoading(true, 'loading');
	
	window.setTimeout(function () {
		tbody = '';
		rows.forEach(function (entry) {
			if (entry == null) {
				tbody += '<tr><td colspan="' + heuteLen + '" class="bg-highlight color-white">';
				tbody += 'Heute ist der ' + formatDate('d.m.Y', today);
				tbody += '</td></tr>';
			} else if (search($('#input-search').val(), entry.keywords)) {
				tbody += '<tr>';
				entry.cells.forEach(function (cell) {
					tbody += '<td>' + cell + '</td>';
				});
				tbody += '</tr>';
			}
		});
		$('#table-regattas').find('tbody').html(tbody);
		
		//setLoading(false, 'loading');
	}, 0);
}

var siteScript = async function() {
	if (firstCall) {
		firstCall = false;
		initYear();
		$('#select-year').change(selectChange);
		$('#button-show').click(siteScript);
		$('#input-search').on('input', drawTable);
	}
	
	today = getToday();
	
	var minDate = parseDate($('#input-from').val());
	var maxDate = parseDate($('#input-to').val());
	var regattas = await dbGetRegattasRange(minDate, maxDate);
	var regattaResults = [];
	var showNumbers = false;
	for (id in regattas) {
		var entry = regattas[id];
		var results = await dbGetDataIndex('results', 'regatta', entry['id']);
		regattaResults[entry['id']] = (results.length > 0);
		if (entry['number'] != null)
			showNumbers = true;
	}
	
	var selectedYear = $('#select-year').val();
	
	var years = await dbGetData('years');
	years.sort(function (a, b) {
		if (a['year'] > b['year']) return -1;
		if (a['year'] < b['year']) return 1;
		return 0;
	});
	var options = '<option value="user">Benutzerdefiniert</option>';
	for (id in years) {
		var year = years[id]['year'];
		options += '<option value="' + year + '">' + year + '</option>';
	}
	$('#select-year').html(options);
	$('#select-year').val(selectedYear);
	
	var count = regattas.length;
	if (count > 0) {
		if (count == 1) {
			$('#p-count').html('Es wurde 1 Regatta gefunden!');
		} else {
			$('#p-count').html('Es wurden ' + count + ' Regatten gefunden!');
		}
		$('#table-regattas').show();
		$('#input-search').show();
		if (showNumbers) {
			$('#th-number').show();
		} else {
			$('#th-number').hide();
		}
		
		var heute = false;
		heuteLen = 5;
		if (showNumbers) heuteLen ++;
		if (showSpecial) heuteLen ++;
		
		rows = [];
		
		for (id in regattas) {
			var entry = regattas[id];
			var club = null;
			if (entry['club'] != null)
				club = await dbGetData('clubs', entry['club']);
			var plannings = await dbGetDataIndex('plannings', 'regatta', entry['id']);
			
			var dateFrom = entry['dateFrom'];
			var dateTo = entry['dateTo'];
			
			var row = { keywords: [], cells: [] };
			row.keywords.push(entry['name']);
			if (entry['number'] != null) row.keywords.push(entry['number']);
			if (club != null) row.keywords.push(club['kurz'], club['name']);
			
			if (!heute && (today <= dateFrom)) {
				rows.push(null);
				heute = true;
			}
			
			if (showNumbers) {
				row.cells.push(entry['number'] != null ? ('<span style="white-space:nowrap;">' + entry['number'] + '</span>') : '');
			}
			
			row.cells.push('<span style="white-space:nowrap;">' + formatDate("j. M 'y", dateFrom) + '<br>' + formatDate("j. M 'y", dateTo) + '</span>');
			
			var content = '';
			if (club != null) {
				content = club['kurz'];
				if (club['website'] != '') {
					content = '<a href="' + club['website'] + '" target="_blank">' + content + '</a>';
				}
			}
			row.cells.push(content + '<br>' + (entry['canceled'] == 1 ? '<s>' : '') + entry['name']) + (entry['canceled'] == 1 ? '</s>' : '');
			
			if (showSpecial) {
				row.cells.push('<span style="white-space:nowrap;">' + entry['special'] + '</span>');
			}
			
			var buf = '';
			if (entry['info'] != '') {
				buf += '<a target="_blank" href="' + entry['info'] + '">Informationen</a>';
			}
			if ((entry['meldung'] != '') && (dateTo >= today)) {
				buf += '<br><a target="_blank" href="' + entry['meldung'] + '">Meldung</a>';
				var planning = null;
				if (isLoggedIn()) {
					for (id in plannings) {
						if (plannings[id]['user'] == USER_ID) {
							planning = plannings[id];
							break;
						}
					}
				}
				
				if ((planning != null) && (planning['gemeldet'] == "1")) {
					buf += ' <i>(du hast gemeldet)</i>';
				} else if (entry['meldungOffen'] == "0") {
					buf += ' <i>(geschlossen)</i>';
				} else if (entry['meldungSchluss'] != null) {
					early = false;
					if (entry['meldungEarly'] != null) {
						ms = parseDate(entry['meldungEarly']);
						if (ms >= today) {
							early = true;
						}
					}
					if (!early)
						ms = parseDate(entry['meldungSchluss']);
					if (ms >= today) {
						diff = Math.round((ms - today) / 86400000);
						red = (diff < 7);
						if (diff <= 14) {
							txt = 'noch ' + diff + ' Tag' + (diff != 1 ? 'e' : '');
						} else if (diff < 35) {
							diff = Math.floor(diff / 7);
							txt = 'noch ' + diff + ' Woche' + (diff != 1 ? 'n' : '');
						} else {
							diff = Math.floor(diff / 30.5);
							txt = 'noch ' + diff + ' Monat' + (diff != 1 ? 'e' : '');
						}
						buf += ' <i>' + (red ? '<b><font style="color:red;">(' : '(') + txt + (early ? ' verg&uuml;nstigt' : '') + (red ? ')</font></b>' : ')') + '</i>';
					} else {
						buf += ' <i>(Meldeschluss abgelaufen)</i>';
					}
				}
			}
			if (entry['bericht'] != '') {
				buf += '<br><a target="_blank" href="' + entry['bericht'] + '">Bericht</a>';
			}
			if (entry['oresults'] != '') {
				buf += '<br><a target="_blank" href="' + entry['oresults'] + '">off. Ergebnisse</a>';
			}
			row.cells.push(buf);
			
			buf = '';
			if (entry['canceled'] == "1") {
				buf = '<i style="color:red;" class="fas fa-times"></i> Ausgefallen</td>';
			} else {
				if (regattaResults[entry['id']]) {
					buf = '<i style="color:green;" class="fas fa-check"></i> <a href="' + LINK_PRE + 'result?regatta=' + entry['id'] + '">Ergebnisse</a></td>';
				} else {
					var pC = plannings.length;
					buf = '<i class="fas fa-calendar-alt"></i> In der Saison-Planung von ' + pC + ' Seglern.';
					if (pC > 0) {
						buf += '<br><a href="' + LINK_PRE + 'regatta_plan?regatta=' + entry['id'] + '">Ansehen</a>';
					}
				}
			}
			row.cells.push(buf);
			
			row.cells.push('<span style="white-space:nowrap;">' + parseFloat(entry['rlf']).toFixed(2) + '</span>');
			
			rows.push(row);
		}
		
		if (!heute) {
			rows.push(null);
		}
		
		drawTable();
		
	} else {
		$('#p-count').html('Keine Regatten gefunden!');
		$('#table-regattas').hide();
		$('#input-search').hide();
	}
	
	hideLoader();
}