function onDetailClicked(regatta) {
	location.href = LINK_PRE + 'result?regatta=' + regatta;
}

async function onRankingClicked(id) {
	var sailor = null;
	for (var i in ranking) {
		if (ranking[i].id == id) {
			sailor = ranking[i];
			break;
		}
	}
	if (sailor == null) return;

	$('#menu-rank').find('.menu-title').find('p').text(sailor.name);
	if (lastRanking != null) {
		var lastRank;
		if (sailor.id in lastRanking) {
			lastRank = lastRanking[sailor.id] + '.';
		} else {
			lastRank = 'nicht in der Rangliste';
		}
		$('#menu-item-text').text('Vorheriges Jahr: ' + lastRank);
		$('#menu-item-text').show();
	} else {
		$('#menu-item-text').hide();
	}

	list = '';
	for (var i in sailor.regattas) {
		var entry = sailor.regattas[i];
		var regatta = entry.regatta;
		var boat = await dbGetData('boats', entry.boat);

		var dateFrom = parseDate(regatta.date);
		var dateTo = parseDate(regatta.date);
		dateTo.setDate(dateTo.getDate() + Math.max(parseInt(regatta.length) - 1, 0));

		list += '<div onclick="onDetailClicked(' + regatta.id + ')">';

		// ZEILE 1
		list += '<div><b>' + regatta.name + '</b></div>';

		// ZEILE 2
		list += '<div>';

		// DATE
		list += '<div>' + formatDate('d.m.Y', dateFrom) + ' - ' + formatDate('d.m.Y', dateTo) + '</div>';

		// m
		list += '<div>m: ' + entry.m + '</div>';

		// rlf
		list += '<div>RLF: ' + parseFloat(regatta.rlf).toFixed(2) + '</div>';

		list += '</div>';

		// ZEILE 3
		list += '<div>';

		// Place
		list += '<div>Platz ' + entry.place + ' / ' + entry.fb + '</div>';

		// rlp
		var color;
		if (entry.used == 0) { color = 'color-red2-dark'; }
		else if (entry.used == entry.m) { color = 'color-green2-dark'; }
		else { color = 'color-yellow2-dark'; }
		list += '<div>Punkte: ' + entry.used + ' x <b class="' + color + '">' + parseFloat(entry.rlp).toFixed(2) + '</b></div>';

		list += '</div>';

		// ZEILE 4
		list += '<div>';

		// Sailnumber
		list += '<div>' + boat.sailnumber + '</div>';

		// Boatname
		list += '<div>' + boat.name + '</div>';

		list += '</div>';

		// ZEILE 5...
		var crew = entry.crew.split(',');
		for (var c in crew) {
			var cr = await dbGetData('sailors', crew[c]);
			if (cr != null) {
				list += '<div>';

				// Name
				list += '<div>' + cr.name + '</div>';

				// Year
				list += '<div>' + ((cr.year != null) ? ('(' + cr.year + ')') : '') + '</div>';

				list += '</div>';
			}
		}

		list += '</div>';
	}
	$('#div-details').html(list);

	$('#menu-rank').showMenu();
	$('#menu-rank').scrollTop(0);
}

async function selectChange(callSiteScript = true) {
	var type = $('#select-type').val();
	var year = parseInt($('#select-year').val());
	if (type == "user") {
		$('#select-year').parent().hide();
		$('#input-from').trigger('focusin').trigger('focusout').parent().show();
		$('#input-to').trigger('focusin').trigger('focusout').parent().show();
		$('#input-jugend').parent().parent().show();
		$('#input-jugstrict').parent().parent().show();
		$('#button-show').show();
	} else {
		$('#select-year').parent().show();
		$('#input-from').parent().hide();
		$('#input-to').parent().hide();
		$('#input-jugend').parent().parent().hide();
		$('#input-jugstrict').parent().parent().hide();
		$('#button-show').hide();

		var from, to, jugend, jugstrict;
		switch (type) {
			case 'year':
				from = (year - 1) + '-12-01';
				to = year + '-11-30';
				jugend = jugstrict = false;
				break;
			case 'youth':
				from = (year - 1) + '-12-01';
				to = year + '-11-30';
				jugend = jugstrict = true;
				break;
			case 'idjm':
				var youthGermanName = await dbGetClassProp('youth-german-name');
				var beginn = null;
				var regattas = await dbGetData('regattas');
				regattas.sort(function(a,b){ return b.date.localeCompare(a.date); });
				for (var r in regattas) {
					var regatta = regattas[r];
					var date = parseDate(regatta.date);
					if ((date < parseDate('01.01.' + year)) || (date > parseDate('31.12.' + year))) {
						continue;
					}
					if (regatta.name.indexOf(youthGermanName) >= 0) {
						beginn = ((regatta.meldungSchluss != null) ? parseDate(regatta.meldungSchluss) : date);
						break;
					}
				}
				if (beginn != null) {
					from = new Date(beginn);
					from.setFullYear(from.getFullYear() - 1);
					from.setDate(from.getDate() - 13);
					from = formatDate('Y-m-d', from);
					to = new Date(beginn);
					to.setDate(to.getDate() - 14);
					to = formatDate('Y-m-d', to);
					jugend = true;
					jugstrict = false;
				} else {
					$('#div-rank').html('Keine ' + youthGermanName + ' gefunden!');
					$('#input-search').parent().hide();
					return;
				}
				break;
		}

		$('#input-from').val(from);
		$('#input-to').val(to);
		$('#input-jugend').prop('checked', jugend);
		$('#input-jugstrict').prop('checked', jugstrict);

		if (callSiteScript && (typeof siteScript === 'function')) {
			history.replaceState(null, '', '?type=' + type + '&year=' + year);
			showLoader();
			siteScript();
		}
	}
}

function buttonShowPressed() {
	if (typeof siteScript === 'function') {
		var chboxes = '';
		if ($('#input-jugend').prop('checked')) chboxes += '&jugend=on'
		if ($('#input-jugstrict').prop('checked')) chboxes += '&jugstrict=on'
		history.replaceState(null, '', '?type=user&from=' + $('#input-from').val() + "&to=" + $('#input-to').val() + chboxes)
		showLoader();
		siteScript();
	}
}

function initSelects() {
	var type = findGetParameter('type');
	var year = findGetParameter('year');
	if (type === null) type = 'year';
	if (year === null) year = new Date().getFullYear();

	$('#select-type').val(type);

	$('#select-year').html('<option value="' + year + '">' + year + '</option>');
	$('#select-year').val(year);

	if (type == "user") {
		var from = findGetParameter('from');
		var to = findGetParameter('to');
		if (from === null) from = formatDate('Y-m-d')
		if (to === null) to = formatDate('Y-m-d')
		$('#input-from').val(from).trigger('focusin').trigger('focusout');
		$('#input-to').val(to).trigger('focusin').trigger('focusout');
		var jugend = findGetParameter('jugend');
		var jugstrict = findGetParameter('jugstrict');
		$('#input-jugend').prop('checked', jugend !== null);
		$('#input-jugstrict').prop('checked', jugstrict !== null);
	}

	selectChange(false);
}

var firstCall = true;
var rows = [];
var ranking;
var lastRanking;

async function drawList () {
	window.setTimeout(function () {
		var list = '';
		rows.forEach(function (entry) {
			if (entry == null) {
				list += '<div><div align="center" class="color-highlight" style="white-space:normal;"><b>Ende der Rangliste gem&auml;&szlig; DSV-Ranglistenverordnung (min. m = 9 Wertungen)</b></div></div>';
			} else if (search($('#input-search').val(), entry.keywords)) {
				list += entry.content;
			}
		});
		$('#div-rank').html(list);
	}, 0);
}

var siteScript = async function() {
	if (firstCall) {
		firstCall = false;
		initSelects();
		$('#select-type').change(selectChange);
		$('#select-year').change(selectChange);
		$('#button-show').click(buttonShowPressed);
		$('#input-search').on('input', drawList);
	}

	var minDate = parseDate($('#input-from').val());
	var maxDate = parseDate($('#input-to').val());
	var jugend = $('#input-jugend').prop('checked');
	var jugstrict = $('#input-jugstrict').prop('checked');
	var dbRanking = await dbGetRanking(minDate, maxDate, jugend, jugstrict);
	ranking = dbRanking[0];

	lastRanking = null;
	if (($('#select-type').val() == 'year') || ($('#select-type').val() == 'youth')) {
		lastRanking = {};
		var lYear = parseInt($('#select-year').val()) - 1;
		var lMinDate = parseDate((lYear - 1) + '-12-01');
		var lMaxDate = parseDate(lYear + '-11-30');
		var lDbRanking = (await dbGetRanking(lMinDate, lMaxDate, jugend, jugstrict))[0];
		for (var i in lDbRanking) {
			lastRanking[lDbRanking[i].id] = lDbRanking[i].rank;
		}
	}

	var selectedYear = $('#select-year').val();

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

	if (dbRanking[1].length > 0) {
		$('#card-noresults').show();
		list = '';
		for (id in dbRanking[1]) {
			list += '<li>';
			list += dbRanking[1][id].name;
			list += '</li>';
		}
		$('#ul-noresults').html(list);
	} else {
		$('#card-noresults').hide();
	}

	var count = ranking.length;
	if (count > 0) {
		$('#input-search').parent().show();

		var dsvEnd = false;

		rows = [];

		for (id in ranking) {
			var entry = ranking[id];

			for (var i in entry.regattas) {
				entry.regattas[i].regatta = await dbGetData('regattas', entry.regattas[i].regatta);
			}
			entry.regattas = Object.values(entry.regattas);
			entry.regattas.sort(function (a,b) {
				return a.regatta.date.localeCompare(b.regatta.date);
			});

			var club = null;
			if (entry['club'] != null)
				club = await dbGetData('clubs', entry['club']);

			var row = { keywords: [], content: '' };
			row.keywords.push(entry['name']);
			if (entry['year'] != null) row.keywords.push(entry['year']);
			if (club != null) row.keywords.push(club['kurz'], club['name']);

			if (!dsvEnd && (entry.m < 9)) {
				rows.push(null);
				dsvEnd = true;
			}

			row.content += '<div onclick="onRankingClicked(' + entry['id'] + ');">';

			// ZEILE 1
			row.content += '<div>';

			// Rank
			var icon = '';
			if (lastRanking != null) {
				if (entry.id in lastRanking) {
					if (entry.rank < lastRanking[entry.id]) { icon = 'color-green2-dark fa-caret-up'; }
					else if (entry.rank > lastRanking[entry.id]) { icon = 'color-red2-dark fa-caret-down'; }
					else { icon = 'color-yellow2-dark fa-minus'; }
				} else {
					icon = 'color-green2-dark fa-caret-up';
				}
				icon = '<i class="font-16 fas ' + icon + '" style="width: 1.1em; text-align: center;"></i> ';
			}
			row.content += '<div>' + icon + '<b>' + entry.rank + '.</b></div>';

			// m
			row.content += '<div>m = ' + entry.m + '</div>';

			// rlp
			row.content += '<div>' + entry.rlp.toFixed(3) + '</div>';

			row.content += '</div>';

			// ZEILE 2
			row.content += '<div>';

			// Name
			row.content += '<div><b>' + entry.name + '</b></div>';

			// Year
			row.content += '<div>' + ((entry.year != null) ? ('(' + entry.year + ')') : '') + '</div>';

			row.content += '</div></div>';

			rows.push(row);
		}

		if (!dsvEnd) {
			rows.push(null);
		}

		drawList();

	} else {
		$('#div-rank').html('Keine Ergebnisse gefunden!');
		$('#input-search').parent().hide();
	}

	hideLoader();
}
