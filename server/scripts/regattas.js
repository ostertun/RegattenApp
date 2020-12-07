function selectChange(callSiteScript = true) {
	var val = $('#select-year').val();
	if (val == "user") {
		$('#input-from').trigger('focusin').trigger('focusout').parent().show();
		$('#input-to').trigger('focusin').trigger('focusout').parent().show();
		$('#button-show').show();
	} else {
		$('#input-from').parent().hide();
		$('#input-to').parent().hide();
		$('#button-show').hide();

		$('#input-from').val(val + '-01-01');
		$('#input-to').val(val + '-12-31');

		if (callSiteScript && (typeof siteScript === 'function')) {
			history.replaceState(null, '', '?year=' + val);
			showLoader();
			siteScript();
		}
	}
}

function buttonShowPressed() {
	if (typeof siteScript === 'function') {
		history.replaceState(null, '', '?year=user&from=' + $('#input-from').val() + "&to=" + $('#input-to').val());
		showLoader();
		siteScript();
	}
}

function initYear() {
	return new Promise(async function (resolve) {
		var year = findGetParameter('year');
		if (year === null) year = await dbGetCurrentYear();

		$('#select-year').html('<option value="' + year + '">' + year + '</option>');
		$('#select-year').val(year);

		if (year == "user") {
			var from = findGetParameter('from');
			var to = findGetParameter('to');
			if (from === null) from = formatDate('Y-m-d')
			if (to === null) to = formatDate('Y-m-d')
			$('#input-from').val(from).trigger('focusin').trigger('focusout');
			$('#input-to').val(to).trigger('focusin').trigger('focusout');
		}

		selectChange(false);

		resolve();
	});
}

var firstCall = true;
var rows = [];
var today;

async function drawList () {
	window.setTimeout(function () {
		var list = '';
		rows.forEach(function (entry) {
			if (entry == null) {
				list += '<div><div align="center" class="color-highlight"><b>Heute ist der ' + formatDate('d.m.Y', today) + '</b></div></div>';
			} else if (search($('#input-search').val(), entry.keywords)) {
				list += entry.content;
			}
		});
		$('#div-regattas').html(list);
	}, 0);
}

var siteScript = async function() {
	if (firstCall) {
		firstCall = false;
		await initYear();
		$('#select-year').change(selectChange);
		$('#button-show').click(buttonShowPressed);
		$('#input-search').on('input', drawList);
	}

	today = getToday();

	var minDate = parseDate($('#input-from').val());
	var maxDate = parseDate($('#input-to').val());
	var regattas = await dbGetRegattasRange(minDate, maxDate);

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
		var specialFields = await dbGetClassProp('special-fields');
		if (specialFields === null) specialFields = {};
		var specialShown = {};

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

			row.content += '<div onclick="onRegattaClicked(' + entry['id'] + ');">';

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
			if (entry.special.substr(0, 1) == '#') {
				entry.special = entry.special.substr(1);
				if (typeof specialFields[entry.special] !== 'undefined') {
					specialShown[entry.special] = specialFields[entry.special];
					entry.special = '* ' + entry.special;
				} else {
					entry.special = 'ERROR';
				}
			}
			row.content += '<div>' + entry.special + '</div>';

			// Icons
			var icons = [];
			if (entry['info'] != '')
				icons.push('<i class="fas fa-info"></i>');
			if ((entry['meldung'] != '') && (dateTo >= today) && (entry['meldungOffen'] == '1')) {
				var color = '';
				var planning = null;
				if (isLoggedIn()) {
					var plannings = await dbGetDataIndex('plannings', 'regatta', entry['id']);
					for (id in plannings) {
						if (plannings[id]['user'] == USER_ID) {
							planning = plannings[id];
							break;
						}
					}
				}
				if (entry['meldungSchluss'] != null) {
					if ((planning == null) || (planning['gemeldet'] == '0')) {
						var ms = 0;
						if (entry['meldungEarly'] != null) {
							ms = parseDate(entry['meldungEarly']);
						}
						if (ms < today) {
							ms = parseDate(entry['meldungSchluss']);
						}
						var diff = Math.round((ms - today) / 86400000);
						if (ms < today) {
							color = ' color-red2-dark';
						} else if (diff < 7) {
							color = ' color-yellow2-dark';
						}
					}
				}
				if ((planning != null) && (planning['gemeldet'] == '0')) {
					color += ' fa-blink';
				}
				icons.push('<i class="fas fa-file-signature' + color + '"></i>');
			}
			if (entry['bericht'] != '')
				icons.push('<i class="fas fa-book"></i>');
			if (entry['canceled'] == '1') {
				icons.push('<i class="fas fa-times color-red2-dark"></i>');
			} else if (entry['results'] == '1') {
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

		if (Object.keys(specialShown).length > 0) {
			var specialText = '';
			for (key in specialShown) {
				specialText += '* ' + key + ': ' + specialShown[key] + '<br>';
			}
			$('#card-special').find('p').html(specialText);
			$('#card-special').show();
		} else {
			$('#card-special').hide();
		}

		drawList();

	} else {
		$('#p-count').html('Keine Regatten gefunden!');
		$('#div-regattas').hide();
		$('#input-search').parent().hide();
		$('#card-special').hide();
	}

	hideLoader();
}
