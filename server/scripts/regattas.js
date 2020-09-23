function selectChange(callSiteScript = true) {
	var val = $('#select-year').val();
	if (val == "user") {
		$('#input-from').parent().show();
		$('#input-to').parent().show();
		$('#button-show').show();
	} else {
		$('#input-from').parent().hide();
		$('#input-to').parent().hide();
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
var today;

async function drawTable () {
	//setLoading(true, 'loading');
	
	window.setTimeout(function () {
		var list = '';
		rows.forEach(function (entry) {
			if (entry == null) {
				list += '<div><div align="center" class="color-highlight"><b>Heute ist der ' + formatDate('d.m.Y', today) + '</b></div></div>';
				//tbody += '<tr><td colspan="' + heuteLen + '" class="bg-highlight color-white">';
				//tbody += 'Heute ist der ' + formatDate('d.m.Y', today);
				//tbody += '</td></tr>';
			} else if (search($('#input-search').val(), entry.keywords)) {
				list += entry.content;
			}
		});
		$('#div-regattas').html(list);
		
		//setLoading(false, 'loading');
	}, 0);
}

async function regattaClicked(id) {
	var regatta = await dbGetData('regattas', id);
	console.log(regatta);
	
	$('#menu-regatta').find('.menu-title').find('p').text(regatta.name);
	
	// Results
	var results = await dbGetDataIndex('results', 'regatta', regatta['id']);
	if (results.length > 0) {
		$('#menu-item-results').show();
		$('#menu-item-results').attr('href', LINK_PRE + 'result/' + regatta['id']);
	} else {
		$('#menu-item-results').hide();
	}
	
	// Bericht
	if (regatta['bericht'] != '') {
		$('#menu-item-bericht').show();
		$('#menu-item-bericht').attr('href', regatta['bericht']);
		$('#menu-item-bericht').attr('target', '_blank');
	} else {
		$('#menu-item-bericht').hide();
	}
	
	// Info
	if (regatta['info'] != '') {
		$('#menu-item-info').show();
		$('#menu-item-info').attr('href', regatta['info']);
		$('#menu-item-info').attr('target', '_blank');
	} else {
		$('#menu-item-info').hide();
	}
	
	// Meldung
	var dateTo = parseDate(regatta['date']);
	dateTo.setDate(dateTo.getDate() + Math.max(parseInt(regatta['length']) - 1, 0));
	if ((regatta['meldung'] != '') && (dateTo >= today)) {
		$('#menu-item-meldung').show();
		$('#menu-item-meldung').attr('href', regatta['meldung']);
		$('#menu-item-meldung').attr('target', '_blank');
		var planning = null;
		if (isLoggedIn()) {
			var plannings = await dbGetDataIndex('plannings', 'regatta', regatta['id']);
			for (id in plannings) {
				if (plannings[id]['user'] == USER_ID) {
					planning = plannings[id];
					break;
				}
			}
		}
		if ((planning != null) && (planning['gemeldet'] == '1')) {
			$('#badge-regatta-meldung').text('schon gemeldet');
			$('#badge-regatta-meldung').addClass('bg-green2-dark').removeClass('bg-highlight bg-red2-dark bg-yellow2-dark');
		} else if (regatta['meldungOffen'] == '0') {
			$('#badge-regatta-meldung').text('geschlossen');
			$('#badge-regatta-meldung').addClass('bg-highlight').removeClass('bg-green2-dark bg-red2-dark bg-yellow2-dark');
		} else if (regatta['meldungSchluss'] != null) {
			var early = false;
			var ms;
			if (regatta['meldungEarly'] != null) {
				ms = parseDate(regatta['meldungEarly']);
				if (ms >= today) {
					early = true;
				}
			}
			if (!early)
				ms = parseDate(regatta['meldungSchluss']);
			if (ms >= today) {
				var diff = Math.round((ms - today) / 86400000);
				var red = (diff < 7);
				var txt;
				if (diff <= 14) {
					txt = diff + ' Tag' + (diff != 1 ? 'e' : '');
				} else if (diff < 35) {
					diff = Math.floor(diff / 7);
					txt = diff + ' Woche' + (diff != 1 ? 'n' : '');
				} else {
					diff = Math.floor(diff / 30.5);
					txt = diff + ' Monat' + (diff != 1 ? 'e' : '');
				}
				if (early)
					txt += ' vergünstigt';
				$('#badge-regatta-meldung').text(txt);
				if (red) {
					if (early) {
						$('#badge-regatta-meldung').addClass('bg-yellow2-dark').removeClass('bg-highlight bg-green2-dark bg-red2-dark');
					} else {
						$('#badge-regatta-meldung').addClass('bg-red2-dark').removeClass('bg-highlight bg-green2-dark bg-yellow2-dark');
					}
				} else {
					$('#badge-regatta-meldung').addClass('bg-highlight').removeClass('bg-green2-dark bg-red2-dark bg-yellow2-dark');
				}
			} else {
				$('#badge-regatta-meldung').text('Meldeschluss abgelaufen');
				$('#badge-regatta-meldung').addClass('bg-highlight').removeClass('bg-green2-dark bg-red2-dark bg-yellow2-dark');
			}
		} else {
			$('#badge-regatta-meldung').text('');
		}
	} else {
		$('#menu-item-meldung').hide();
	}
	
	// off. results
	if (regatta['oresults'] != '') {
		$('#menu-item-oresults').show();
		$('#menu-item-oresults').attr('href', regatta['oresults']);
		$('#menu-item-oresults').attr('target', '_blank');
	} else {
		$('#menu-item-oresults').hide();
	}
	
	// club website
	var clubwebsite = '';
	if (regatta['club'] != null) {
		clubwebsite = (await dbGetData('clubs', regatta['club'])).website;
	}
	if (clubwebsite != '') {
		$('#menu-item-clubwebsite').show();
		$('#menu-item-clubwebsite').attr('href', clubwebsite);
		$('#menu-item-clubwebsite').attr('target', '_blank');
	} else {
		$('#menu-item-clubwebsite').hide();
	}
	
	$('#menu-regatta').showMenu();
	$('#menu-regatta').scrollTop(0);
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
	for (id in regattas) {
		var entry = regattas[id];
		var results = await dbGetDataIndex('results', 'regatta', entry['id']);
		regattaResults[entry['id']] = (results.length > 0);
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
		$('#div-regattas').show();
		$('#input-search').parent().show();
		
		var heute = false;
		
		rows = [];
		
		for (id in regattas) {
			var entry = regattas[id];
			var club = null;
			if (entry['club'] != null)
				club = await dbGetData('clubs', entry['club']);
			var plannings = await dbGetDataIndex('plannings', 'regatta', entry['id']);
			
			var dateFrom = entry['dateFrom'];
			var dateTo = entry['dateTo'];
			
			var row = { keywords: [], content: '' };
			row.keywords.push(entry['name']);
			if (entry['number'] != null) row.keywords.push(entry['number']);
			if (club != null) row.keywords.push(club['kurz'], club['name']);
			
			if (!heute && (today <= dateFrom)) {
				rows.push(null);
				heute = true;
			}
			
			row.content += '<div onclick="regattaClicked(' + entry['id'] + ');">';
			
			// ZEILE 1
			// Name
			row.content += '<div><b>' + (entry['canceled'] == 1 ? '<s>' : '') + entry['name'] + (entry['canceled'] == 1 ? '</s>' : '') + '</b></div>';
			
			// ZEILE 2
			row.content += '<div>';
			
			// Number
			row.content += '<div>' + ((entry['number'] != null) ? ('# ' + entry['number']) : '') + '</div>';
			
			// Club
			row.content += '<div>' + ((club != null) ? club['kurz'] : '') + '</div>';
			
			// Special
			row.content += '<div>' + entry['special'] + '</div>';
			
			// Icons
			var icons = [];
			if (entry['info'] != '')
				icons.push('<i class="fas fa-info"></i>');
			if ((entry['meldung'] != '') && (dateTo >= today) && (entry['meldungOffen'] == '1')) {
				var color = '';
				if (entry['meldungSchluss'] != null) {
					var ms = parseDate(entry['meldungSchluss']);
					var diff = Math.round((ms - today) / 86400000);
					if ((ms >= today) && (diff < 7))
						color = ' color-red2-dark';
				}
				icons.push('<i class="fas fa-file-signature' + color + '"></i>');
			}
			if (entry['bericht'] != '')
				icons.push('<i class="fas fa-book"></i>');
			if (entry['canceled'] == '1') {
				icons.push('<i class="fas fa-times color-red2-dark"></i>');
			} else if (regattaResults[entry['id']]) {
				icons.push('<i class="fas fa-poll"></i>');
			}
			row.content += '<div class="color-green2-dark">' + icons.join('&ensp;') + '</div>';
			
			row.content += '</div>';
			
			// ZEILE 3
			row.content += '<div>';
			
			// Date
			if (entry['length'] < 1) {
				if (formatDate('d.m', dateFrom) == '01.01') {
					row.content += '<div><font class="color-red2-dark">Datum noch unklar</font></div>';
				} else {
					row.content += '<div>' + formatDate("d.m.Y", dateFrom) + ' - <font class="color-red2-dark">Datum nicht final</font></div>';
				}
			} else {
				row.content += '<div>' + formatDate("d.m.Y", dateFrom) + ' - ' + formatDate("d.m.Y", dateTo) + '</div>';
			}
			
			// RLF
			row.content += '<div>' + parseFloat(entry['rlf']).toFixed(2) + '</div>';
			
			row.content += '</div></div>';
			
			rows.push(row);
		}
		
		if (!heute) {
			rows.push(null);
		}
		
		drawTable();
		
	} else {
		$('#p-count').html('Keine Regatten gefunden!');
		$('#div-regattas').hide();
		$('#input-search').parent().hide();
	}
	
	hideLoader();
}