function selectChange() {
	var val = $('#select-year').val();

	if (typeof siteScript === 'function') {
		history.replaceState(null, '', '?year=' + val);
		showLoader();
		siteScript();
	}
}

function initYear() {
	var year = findGetParameter('year');
	if (year === null) year = new Date().getFullYear();

	$('#select-year').html('<option value="' + year + '">' + year + '</option>');
	$('#select-year').val(year);
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
	var userid = findGetParameter('user');
	var user = null;
	if (userid !== null) {
		user = await dbGetData('users', userid);
	}
	if (user === null) {
		location.href = LINK_PRE + 'planning_list';
		return;
	}

	$('#p-username').text(user.username);

	if (isLoggedIn() && (userid == USER_ID)) {
		$('#button-share').show();
		$('#button-share').click(function(){
			$('#menu-share').showMenu();
		});
	} else {
		$('#button-share').hide();
	}

	if (firstCall) {
		firstCall = false;
		initYear();
		$('#select-year').change(selectChange);
		$('#input-search').on('input', drawList);
	}

	today = getToday();

	var selectedYear = $('#select-year').val();
	var minDate = parseDate(selectedYear + '-01-01');
	var maxDate = parseDate(selectedYear + '-12-31');
	var regattas = await dbGetRegattasRange(minDate, maxDate);
	var plannings = await dbGetDataIndex('plannings', 'user', user.id);
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

			// Special
			if (entry.special.substr(0, 1) == '#') {
				entry.special = '* ' + entry.special.substr(1);
			}
			row.content += '<div>' + entry['special'] + '</div>';

			// Club
			row.content += '<div>' + ((club != null) ? club['kurz'] : '') + '</div>';

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

			row.content += '</div>';

			// ZEILE 4
			row.content += '<div></div>';

			// ZEILE 5
			row.content += '<div>';
			row.content += '<div>' + (entry.planning.steuermann !== null ? entry.planning.steuermann : 'noch unklar') + '</div>';
			row.content += '</div>';

			// ZEILE 6...
			for (var i in entry.planning.crew) {
				row.content += '<div>';
				row.content += '<div>' + entry.planning.crew[i] + '</div>';
				row.content += '</div>';
			}

			row.content += '</div>';

			rows.push(row);
		}

		if (!heute) {
			rows.push(null);
		}

		drawList();

	} else {
		$('#p-count').html(user.username + ' hat noch keine Regatten in seiner/ihrer Saison-Planung!');
		$('#div-regattas').hide();
		$('#input-search').parent().hide();
	}

	hideLoader();
}
