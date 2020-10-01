var today;

var siteScript = async function() {
	today = getToday();

	if (isLoggedIn()) {
		$('#card-notloggedin').hide();

		var user = await dbGetData('users', localStorage.getItem('auth_user'));

		// Favorites
		var watched = [];
		for (var i = 1; i <= 5; i ++) {
			sailor_id = user['sailor' + i];
			if (sailor_id != null) {
				watched.push(await dbGetData('sailors', sailor_id));
			}
		}
		if (watched.length > 0) {
			var year = (new Date()).getFullYear();
			$('#th-ranking').html('Rangliste ' + year);
			var ranking = (await dbGetRanking(parseDate('01.12.' + (year - 1)), parseDate('30.11.' + year), false, false))[0];
			tbody = '';
			for (i in watched) {
				sailor = watched[i];
				tbody += '<tr><td>' + sailor.name + '</td><td>';
				var rank = null;
				for (r in ranking) {
					if (ranking[r].id == sailor.id) {
						rank = ranking[r].rank;
						break;
					}
				}
				if (rank == null) {
					tbody += '<i>nicht in der Rangliste</i>';
				} else {
					tbody += '<b>' + rank + '.</b> Platz';
				}
				tbody += '</td></tr>';
			}
			$('#table-favorites').find('tbody').html(tbody);
			$('#p-favorites').hide();
			$('#table-favorites').show();
		} else {
			$('#table-favorites').hide();
			$('#p-favorites').show();
		}
		$('#card-favorites').show();

		// Your next
		var planningsDB = await dbGetDataIndex('plannings', 'user', user.id);
		var minDate = getToday();
		minDate.setDate(minDate.getDate() - 1);
		var maxDate = getToday();
		maxDate.setDate(maxDate.getDate() + 28);
		var regattas = await dbGetRegattasRange(minDate, maxDate);
		var plannings = [];
		for (i = planningsDB.length - 1; i >= 0; i --) {
			var planning = planningsDB[i];
			for (j in regattas) {
				var regatta = regattas[j];
				if (regatta.id == planning.regatta) {
					planning.regatta = regatta;
					plannings.push(planning);
				}
			}
		}
		plannings.sort(function (a, b) {
			if (a.regatta.date < b.regatta.date) return -1;
			if (a.regatta.date > b.regatta.date) return 1;
			return 0;
		});
		if (plannings.length > 0) {
			list = '';
			for (i in plannings) {
				var planning = plannings[i];
				var regatta = planning.regatta;

				if (regatta['length'] < 1) continue;

				var club = null;
				if (regatta['club'] != null)
					club = await dbGetData('clubs', regatta['club']);
				var dateFrom = regatta['dateFrom'];
				var dateTo = regatta['dateTo'];

				// output

				list += '<div onclick="onRegattaClicked(' + regatta['id'] + ');">';

				// ZEILE 1
				// Name
				list += '<div><b>' + (regatta['canceled'] == 1 ? '<s>' : '') + regatta['name'] + (regatta['canceled'] == 1 ? '</s>' : '') + '</b></div>';

				// ZEILE 2
				list += '<div>';

				// Number
				list += '<div>' + ((regatta['number'] != null) ? ('# ' + regatta['number']) : '') + '</div>';

				// Club
				list += '<div>' + ((club != null) ? club['kurz'] : '') + '</div>';

				// Special
				list += '<div>' + regatta['special'] + '</div>';

				// Icons
				var icons = [];
				if (regatta['info'] != '')
					icons.push('<i class="fas fa-info"></i>');
				if ((regatta['meldung'] != '') && (dateTo >= today) && (regatta['meldungOffen'] == '1')) {
					var color = '';
					if (regatta['meldungSchluss'] != null) {
						if (planning['gemeldet'] == '0') {
							var ms = 0;
							if (regatta['meldungEarly'] != null) {
								ms = parseDate(regatta['meldungEarly']);
							}
							if (ms < today) {
								ms = parseDate(regatta['meldungSchluss']);
							}
							var diff = Math.round((ms - today) / 86400000);
							if (ms < today) {
								color = ' color-red2-dark';
							} else if (diff < 7) {
								color = ' color-yellow2-dark';
							}
						}
					}
					if (planning['gemeldet'] == '0') {
						color += ' fa-blink';
					}
					icons.push('<i class="fas fa-file-signature' + color + '"></i>');
				}
				if (regatta['canceled'] == '1') {
					icons.push('<i class="fas fa-times color-red2-dark"></i>');
				}
				list += '<div class="color-green2-dark">' + icons.join('&ensp;') + '</div>';

				list += '</div>';

				// ZEILE 3
				list += '<div>';

				// Date
				list += '<div>' + formatDate("d.m.Y", dateFrom) + ' - ' + formatDate("d.m.Y", dateTo) + '</div>';

				// RLF
				list += '<div>' + parseFloat(regatta['rlf']).toFixed(2) + '</div>';

				list += '</div></div>';
			}
			$('#div-yournext').html(list);
			$('#p-yournext').hide();
			$('#div-yournext').show();
		} else {
			$('#div-yournext').hide();
			$('#p-yournext').show();
		}
		$('#card-yournext').show();
	} else {
		$('#card-favorites').hide();
		$('#card-yournext').hide();
		$('#card-notloggedin').show();
	}

	// Next
	var minDate = getToday();
	minDate.setDate(minDate.getDate() - 1);
	var maxDate = getToday();
	maxDate.setDate(maxDate.getDate() + 14);
	var regattas = await dbGetRegattasRange(minDate, maxDate);
	if (regattas.length > 0) {
		list = '';
		for (i in regattas) {
			var regatta = regattas[i];

			if (regatta['length'] < 1) continue;

			var club = null;
			if (regatta['club'] != null)
				club = await dbGetData('clubs', regatta['club']);
			var plannings = await dbGetDataIndex('plannings', 'regatta', regatta['id']);
			var dateFrom = regatta['dateFrom'];
			var dateTo = regatta['dateTo'];

			// output
			list += '<div onclick="onRegattaClicked(' + regatta['id'] + ');">';

			// ZEILE 1
			// Name
			list += '<div><b>' + (regatta['canceled'] == 1 ? '<s>' : '') + regatta['name'] + (regatta['canceled'] == 1 ? '</s>' : '') + '</b></div>';

			// ZEILE 2
			list += '<div>';

			// Number
			list += '<div>' + ((regatta['number'] != null) ? ('# ' + regatta['number']) : '') + '</div>';

			// Club
			list += '<div>' + ((club != null) ? club['kurz'] : '') + '</div>';

			// Special
			list += '<div>' + regatta['special'] + '</div>';

			// Icons
			var icons = [];
			if (regatta['info'] != '')
				icons.push('<i class="fas fa-info"></i>');
			if ((regatta['meldung'] != '') && (dateTo >= today) && (regatta['meldungOffen'] == '1')) {
				var color = '';
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
				if (regatta['meldungSchluss'] != null) {
					if ((planning == null) || (planning['gemeldet'] == '0')) {
						var ms = 0;
						if (regatta['meldungEarly'] != null) {
							ms = parseDate(regatta['meldungEarly']);
						}
						if (ms < today) {
							ms = parseDate(regatta['meldungSchluss']);
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
			if (regatta['canceled'] == '1') {
				icons.push('<i class="fas fa-times color-red2-dark"></i>');
			}
			list += '<div class="color-green2-dark">' + icons.join('&ensp;') + '</div>';

			list += '</div>';

			// ZEILE 3
			list += '<div>';

			// Date
			list += '<div>' + formatDate("d.m.Y", dateFrom) + ' - ' + formatDate("d.m.Y", dateTo) + '</div>';

			// RLF
			list += '<div>' + parseFloat(regatta['rlf']).toFixed(2) + '</div>';

			list += '</div></div>';
		}
		$('#div-next').html(list);
		$('#p-next').hide();
		$('#div-next').show();
	} else {
		$('#div-next').hide();
		$('#p-next').show();
	}

	// Last
	var minDate = getToday();
	minDate.setDate(minDate.getDate() - 14);
	var maxDate = getToday();
	maxDate.setDate(maxDate.getDate() - 1);
	var regattas = await dbGetRegattasRange(minDate, maxDate);
	var regattaResults = [];
	for (id in regattas) {
		var entry = regattas[id];
		var results = await dbGetDataIndex('results', 'regatta', entry['id']);
		regattaResults[entry['id']] = (results.length > 0);
	}
	if (regattas.length > 0) {
		list = '';
		for (i in regattas) {
			var regatta = regattas[i];

			if (regatta['length'] < 1) continue;

			var club = null;
			if (regatta['club'] != null)
				club = await dbGetData('clubs', regatta['club']);
			var dateFrom = regatta['dateFrom'];
			var dateTo = regatta['dateTo'];

			// output

			list += '<div onclick="onRegattaClicked(' + regatta['id'] + ');">';

			// ZEILE 1
			// Name
			list += '<div><b>' + (regatta['canceled'] == 1 ? '<s>' : '') + regatta['name'] + (regatta['canceled'] == 1 ? '</s>' : '') + '</b></div>';

			// ZEILE 2
			list += '<div>';

			// Number
			list += '<div>' + ((regatta['number'] != null) ? ('# ' + regatta['number']) : '') + '</div>';

			// Club
			list += '<div>' + ((club != null) ? club['kurz'] : '') + '</div>';

			// Special
			list += '<div>' + regatta['special'] + '</div>';

			// Icons
			var icons = [];
			if (regatta['info'] != '')
				icons.push('<i class="fas fa-info"></i>');
			if (regatta['bericht'] != '')
				icons.push('<i class="fas fa-book"></i>');
			if (regatta['canceled'] == '1') {
				icons.push('<i class="fas fa-times color-red2-dark"></i>');
			} else if (regattaResults[regatta['id']]) {
				icons.push('<i class="fas fa-poll"></i>');
			}
			list += '<div class="color-green2-dark">' + icons.join('&ensp;') + '</div>';

			list += '</div>';

			// ZEILE 3
			list += '<div>';

			// Date
			list += '<div>' + formatDate("d.m.Y", dateFrom) + ' - ' + formatDate("d.m.Y", dateTo) + '</div>';

			// RLF
			list += '<div>' + parseFloat(regatta['rlf']).toFixed(2) + '</div>';

			list += '</div></div>';
		}
		$('#div-last').html(list);
		$('#p-last').hide();
		$('#div-last').show();
	} else {
		$('#div-last').hide();
		$('#p-last').show();
	}

	hideLoader();
}
