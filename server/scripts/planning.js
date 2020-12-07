async function planningSwitchChanged() {
	showLoader();
	var id = $('#switch-status-gemeldet').data('regatta');
	var gemeldet = $('#switch-status-gemeldet').prop('checked');
	var bezahlt = $('#switch-status-bezahlt').prop('checked');
	var auth = {
		id: localStorage.getItem('auth_id'),
		hash: localStorage.getItem('auth_hash')
	}
	$.ajax({
		url: QUERY_URL + 'planning_set_state',
		method: 'POST',
		data: {
			auth: auth,
			regatta: id,
			gemeldet: gemeldet,
			bezahlt: bezahlt
		},
		error: function (xhr, status, error) {
			if (xhr.status == 401) {
				log('authentification failed');
				toastError('Authentifizierung fehlgeschlagen. Versuche es erneut.');
			} else if (xhr.status == 0) {
				toastError('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um den Status zu &auml;ndern');
			} else {
				log('Login: unbekannter Fehler', status, error);
				log(xhr);
				toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
			}
			$('#menu-status').hideMenu();
			hideLoader();
		},
		success: function (data, status, xhr) {
			sync();
			hideLoader();
		}
	});
}

async function planningEditStatus(id) {
	$('#menu-regatta').hideMenu();

	var regatta = await dbGetData('regattas', id);

	$('#menu-status').find('.menu-title').find('p').text(regatta.name);

	var plannings = await dbGetDataIndex('plannings', 'regatta', regatta['id']);
	var planning = null;
	if (isLoggedIn()) {
		for (i in plannings) {
			if (plannings[i]['user'] == USER_ID) {
				planning = plannings[i];
				break;
			}
		}
	}

	if (planning !== null) {
		$('#switch-status-gemeldet').data('regatta', id);
		$('#switch-status-gemeldet').prop('checked', planning.gemeldet == '1');
		$('#switch-status-bezahlt').prop('checked', planning.bezahlt == '1');
		$('#menu-status').showMenu();
	}
}

function selectChange() {
	var val = $('#select-year').val();

	if (typeof siteScript === 'function') {
		history.replaceState(null, '', '?year=' + val);
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
	if (!isLoggedIn()) {
		hideLoader();
		return;
	}

	if (firstCall) {
		firstCall = false;
		await initYear();
		$('#select-year').change(selectChange);
		$('#input-search').on('input', drawList);
		$('#switch-status-gemeldet').parent().parent().click(planningSwitchChanged);
		$('#switch-status-bezahlt').parent().parent().click(planningSwitchChanged);
	}

	var selectedYear = $('#select-year').val();

	$('#a-share-planning').attr('href', LINK_PRE + 'planning_view?user=' + USER_ID + '&year=' + selectedYear);
	$('#a-edit-planning').attr('href', LINK_PRE + 'planning_edit?year=' + selectedYear);
	$('#a-list-plannings').attr('href', LINK_PRE + 'planning_list?year=' + selectedYear);

	today = getToday();

	var minDate = parseDate(selectedYear + '-01-01');
	var maxDate = parseDate(selectedYear + '-12-31');
	var regattas = await dbGetRegattasRange(minDate, maxDate);
	var plannings = await dbGetDataIndex('plannings', 'user', USER_ID);
	for (var i = regattas.length - 1; i >= 0; i --) {
		var entry = regattas[i];
		var okay = false;
		for (p in plannings) {
			if (plannings[p].regatta == entry.id) {
				regattas[i].planning = plannings[p];
				okay = true;
				break;
			}
		}
		if (!okay) {
			regattas.splice(i, 1);
		}
	}

	var years = await dbGetData('years');
	years.sort(function (a, b) {
		if (a['year'] > b['year']) return -1;
		if (a['year'] < b['year']) return 1;
		return 0;
	});
	var options = '';
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
			if (entry.planning.steuermann !== null) {
				entry.planning.steuermann = (await dbGetData('sailors', entry.planning.steuermann)).name;
			}
			var crewString = entry.planning.crew.split(',');
			entry.planning.crew = [];
			for (c in crewString) {
				var sailor = await dbGetData('sailors', crewString[c]);
				if (sailor !== null) {
					entry.planning.crew.push(sailor.name);
				}
			}

			var dateFrom = entry['dateFrom'];
			var dateTo = entry['dateTo'];

			var row = { keywords: [], content: '' };
			row.keywords.push(entry['name']);
			if (entry['number'] != null) row.keywords.push(entry['number']);
			if (club != null) row.keywords.push(club['kurz'], club['name']);
			if (entry.planning.steuermann != null) row.keywords.push(entry.planning.steuermann);
			for (c in entry.planning.crew) row.keywords.push(entry.planning.crew[c]);

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
				entry.special = '* ' + entry.special.substr(1);
			}
			row.content += '<div>' + entry['special'] + '</div>';

			// Icons
			var icons = [];
			if ((entry['meldung'] != '') && (dateTo >= today) && (entry['meldungOffen'] == '1') && (entry.planning.gemeldet != '1')) {
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
			if (entry.planning.gemeldet == '1') {
				icons.push('<i class="fas fa-file-signature color-highlight"></i>');
			}
			if (entry.planning.bezahlt == '1') {
				icons.push('<i class="fas fa-euro-sign color-highlight"></i>');
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

		drawList();

	} else {
		$('#p-count').html('Du hast noch keine Regatten in Deiner Saison-Planung!');
		$('#div-regattas').hide();
		$('#input-search').parent().hide();
	}

	hideLoader();
}
