var siteScript = async function() {
	if (isLoggedIn()) {
		$('#card-notloggedin').hide();
		
		var user = await dbGetData('users', localStorage.getItem('auth_user'));
		var today = getToday();
		
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
			// TODO: get ranking
			tbody = '';
			for (i in watched) {
				sailor = watched[i];
				tbody += '<tr><td>' + sailor.name + '</td><td>';
				// TODO: check if ranking and output
				//tbody += '<i>nicht in der Rangliste</i>';
				tbody += '<i>Ranglisten werden aktuell noch nicht unterst&uuml;tzt</i>';
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
			tbody = '';
			for (i in plannings) {
				var planning = plannings[i];
				var regatta = planning.regatta;
				var club = null;
				if (regatta['club'] != null)
					club = await dbGetData('clubs', regatta['club']);
				var dateFrom = regatta['dateFrom'];
				var dateTo = regatta['dateTo'];
				// TODO: get steuermann and crew
				var steuermann = '<i>noch unklar</i>';
				if (planning.steuermann !== null) {
					steuermann = (await dbGetData('sailors', planning.steuermann)).name;
				}
				var crew = [];
				if (planning.crew !== '') {
					crewIds = planning.crew.split(',');
					for (j in crewIds) {
						crew.push((await dbGetData('sailors', crewIds[j])).name);
					}
				}
				
				// output
				tbody += '<tr>';
				
				tbody += '<td><span style="white-space:nowrap;">' + formatDate("j. M 'y", dateFrom) + '<br>' + formatDate("j. M 'y", dateTo) + '</span></td>';
				
				var content = '';
				if (club != null) {
					content = club['kurz'];
					if (club['website'] != '') {
						content = '<a href="' + club['website'] + '" target="_blank">' + content + '</a>';
					}
				}
				tbody += '<td>' + content + '<br>' + (regatta['canceled'] == 1 ? '<s>' : '') + regatta['name'] + (regatta['canceled'] == 1 ? '</s>' : '') + '</td>';
				
				var buf = '';
				if (regatta['info'] != '') {
					buf += '<a target="_blank" href="' + regatta['info'] + '">Informationen</a>';
				}
				if ((regatta['meldung'] != '') && (dateTo >= today)) {
					buf += '<br><a target="_blank" href="' + regatta['meldung'] + '">Meldung</a>';
					
					if ((planning != null) && (planning['gemeldet'] == "1")) {
						buf += ' <i>(du hast gemeldet)</i>';
					} else if (regatta['meldungOffen'] == "0") {
						buf += ' <i>(geschlossen)</i>';
					} else if (regatta['meldungSchluss'] != null) {
						early = false;
						if (regatta['meldungEarly'] != null) {
							ms = parseDate(regatta['meldungEarly']);
							if (ms >= today) {
								early = true;
							}
						}
						if (!early)
							ms = parseDate(regatta['meldungSchluss']);
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
				if (regatta['bericht'] != '') {
					buf += '<br><a target="_blank" href="' + regatta['bericht'] + '">Bericht</a>';
				}
				if (regatta['oresults'] != '') {
					buf += '<br><a target="_blank" href="' + regatta['oresults'] + '">off. Ergebnisse</a>';
				}
				tbody += '<td>' + buf + '</td>';
				
				tbody += '<td><span style="white-space:nowrap;">' + parseFloat(regatta['rlf']).toFixed(2) + '</span></td>';
				
				tbody += '<td>' + steuermann + '<br>' + crew.join('<br>') + '</td>';
				
				tbody += '</tr>';
			}
			$('#table-yournext').find('tbody').html(tbody);
			$('#p-yournext').hide();
			$('#table_yournext').show();
		} else {
			$('#table-yournext').hide();
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
		tbody = '';
		for (i in regattas) {
			var regatta = regattas[i];
			var club = null;
			if (regatta['club'] != null)
				club = await dbGetData('clubs', regatta['club']);
			var plannings = await dbGetDataIndex('plannings', 'regatta', regatta['id']);
			var dateFrom = regatta['dateFrom'];
			var dateTo = regatta['dateTo'];
			
			// output
			tbody += '<tr>';
			
			tbody += '<td><span style="white-space:nowrap;">' + formatDate("j. M 'y", dateFrom) + '<br>' + formatDate("j. M 'y", dateTo) + '</span></td>';
			
			var content = '';
			if (club != null) {
				content = club['kurz'];
				if (club['website'] != '') {
					content = '<a href="' + club['website'] + '" target="_blank">' + content + '</a>';
				}
			}
			tbody += '<td>' + content + '<br>' + (regatta['canceled'] == 1 ? '<s>' : '') + regatta['name'] + (regatta['canceled'] == 1 ? '</s>' : '') + '</td>';
			
			var buf = '';
			if (regatta['info'] != '') {
				buf += '<a target="_blank" href="' + regatta['info'] + '">Informationen</a>';
			}
			if ((regatta['meldung'] != '') && (dateTo >= today)) {
				buf += '<br><a target="_blank" href="' + regatta['meldung'] + '">Meldung</a>';
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
				} else if (regatta['meldungOffen'] == "0") {
					buf += ' <i>(geschlossen)</i>';
				} else if (regatta['meldungSchluss'] != null) {
					early = false;
					if (regatta['meldungEarly'] != null) {
						ms = parseDate(regatta['meldungEarly']);
						if (ms >= today) {
							early = true;
						}
					}
					if (!early)
						ms = parseDate(regatta['meldungSchluss']);
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
			if (regatta['bericht'] != '') {
				buf += '<br><a target="_blank" href="' + regatta['bericht'] + '">Bericht</a>';
			}
			if (regatta['oresults'] != '') {
				buf += '<br><a target="_blank" href="' + regatta['oresults'] + '">off. Ergebnisse</a>';
			}
			tbody += '<td>' + buf + '</td>';
			
			tbody += '<td><span style="white-space:nowrap;">' + parseFloat(regatta['rlf']).toFixed(2) + '</span></td>';
			
			tbody += '</tr>';
		}
		$('#table-next').find('tbody').html(tbody);
		$('#p-next').hide();
		$('#table-next').show();
	} else {
		$('#table-next').hide();
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
		tbody = '';
		for (i in regattas) {
			var regatta = regattas[i];
			var club = null;
			if (regatta['club'] != null)
				club = await dbGetData('clubs', regatta['club']);
			var dateFrom = regatta['dateFrom'];
			var dateTo = regatta['dateTo'];
			
			// output
			tbody += '<tr>';
			
			tbody += '<td><span style="white-space:nowrap;">' + formatDate("j. M 'y", dateFrom) + '<br>' + formatDate("j. M 'y", dateTo) + '</span></td>';
			
			var content = '';
			if (club != null) {
				content = club['kurz'];
				if (club['website'] != '') {
					content = '<a href="' + club['website'] + '" target="_blank">' + content + '</a>';
				}
			}
			tbody += '<td>' + content + '<br>' + (regatta['canceled'] == 1 ? '<s>' : '') + regatta['name'] + (regatta['canceled'] == 1 ? '</s>' : '') + '</td>';
			
			var buf = '';
			if (regatta['canceled'] == "1") {
				buf = '<i style="color:red;" class="fas fa-times"></i> Ausgefallen</td>';
			} else {
				if (regattaResults[regatta['id']]) {
					buf = '<i style="color:green;" class="fas fa-check"></i> <a href="' + LINK_PRE + 'result?regatta=' + regatta['id'] + '">Ergebnisse</a></td>';
				} else {
					buf = 'Nicht verf&uuml;gbar';
				}
			}
			tbody += '<td>' + buf + '</td>';
			
			tbody += '<td><span style="white-space:nowrap;">' + parseFloat(regatta['rlf']).toFixed(2) + '</span></td>';
			
			tbody += '</tr>';
		}
		$('#table-last').find('tbody').html(tbody);
		$('#p-last').hide();
		$('#table-last').show();
	} else {
		$('#table-last').hide();
		$('#p-last').show();
	}
}