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
		crew.unshift(entry.helm);
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

var rankings;

function selectChange(callSiteScript = true) {
	return new Promise(async function (resolve) {
		var year = $('#select-year').val();
		if (year == "user") {
			$('#select-type').parent().hide();
			$('#input-from').trigger('focusin').trigger('focusout').parent().show();
			$('#input-to').trigger('focusin').trigger('focusout').parent().show();
			$('#input-altm').trigger('focusin').trigger('focusout').parent().show();
			$('#input-maxage').trigger('focusin').trigger('focusout').parent().show();
			$('#input-agestrict').parent().show();
			$('#input-agecrew').parent().show();
			$('#button-show').show();
			$('#card-special-ranks').hide();
		} else {
			year = parseInt(year);
			var type = $('#select-type').val();
			console.log('[rank] selected', year, type);
			$('#select-type').parent().show();
			$('#input-from').parent().hide();
			$('#input-to').parent().hide();
			$('#input-altm').parent().hide();
			$('#input-maxage').parent().hide();
			$('#input-agestrict').parent().hide();
			$('#input-agecrew').parent().hide();
			$('#button-show').hide();
			$('#card-special-ranks').hide(); // first hide, show only when there are special ranks

			var rankingsShow = {};
			var options = '';
			for (var i in rankings) {
				if (rankings[i].year_from !== null && rankings[i].year_from > year) continue;
				if (rankings[i].year_to !== null && rankings[i].year_to < year) continue;
				var alias = rankings[i].alias;
				options += '<option value="' + alias + '">' + rankings[i].name + '</option>';
				rankingsShow[alias] = rankings[i];
			}
			$('#select-type').html(options);
			if (!(type in rankingsShow)) {
				console.log('[rank] selected type', type, 'not found for year', year, '. Using `year`');
				type = 'year';
			}
			$('#select-type').val(type).trigger('focusin').trigger('focusout');

			// special ranks
			getJSON(QUERY_URL + 'get_special_rankings', function (code, data) {
				if (code == 200) {
					var specialRanks = [];
					for (var i in data.data) {
						var sr = data.data[i];
						if (sr.to < (year + '-01-01')) continue;
						if (sr.to > (year + '-12-31')) continue;
						specialRanks.push(sr);
					}
					if (specialRanks.length > 0) {
						var btns = '';
						for (var i in specialRanks) {
							var sr = specialRanks[i];
							var link = 'https://ranglisten.net/frame.php?class=' + BOATCLASS + '&site=special_rank&rank_id=' + sr.id;
							var name = sr.title;
							var cssclass = i > 0 ? ' mt-3' : '';
							btns += '<a class="btn btn-full rounded-s text-uppercase font-900 shadow-m bg-highlight' + cssclass + '" href="' + link + '">' + name + '</a>';
						}
						$('#card-special-ranks').find('.content').html(btns);
						$('#card-special-ranks').show();
					}
				} else {
					log("[rank] special_ranks: Something went wrong (HTTP " + code + ")");
				}
			});

			var from, to, altm, maxage, agestrict, agecrew;
			altm = 9; maxage = false; agestrict = false; agecrew = false;
			var r = rankingsShow[type];
			console.log('[rank] type', type, '=>', r);
			if (r.max_age !== null) {
				maxage = r.max_age;
				agestrict = r.age_strict == 1;
				agecrew = r.age_crew == 1;
			}
			if (r.alt_m !== null) {
				altm = r.alt_m;
			}
			switch (r.type) {
				case 'year':
					from = (year - 1) + '-12-01';
					to = year + '-11-30';
					break;
				case 'quali':
					// TODO: auslagern in function getRegattaBegin
					var beginn = null;
					var regattas = await dbGetData('regattas');
					regattas.sort(function(a,b){ return b.date.localeCompare(a.date); });
					for (var ri in regattas) {
						var regatta = regattas[ri];
						var date = parseDate(regatta.date);
						if ((date < parseDate('01.01.' + year)) || (date > parseDate('31.12.' + year))) {
							continue;
						}
						if (regatta.name.toLowerCase().indexOf(r.quali_search.toLowerCase()) >= 0) {
							console.log('FOUND', regatta);
							beginn = ((regatta.meldungSchluss != null) ? parseDate(regatta.meldungSchluss) : date);
							break;
						}
					}
					// END OF TODO
					if (beginn !== null) {
						from = new Date(beginn);
						from.setFullYear(from.getFullYear() - 1);
						from.setDate(from.getDate() - 13);
						from = formatDate('Y-m-d', from);
						to = new Date(beginn);
						to.setDate(to.getDate() - 14);
						to = formatDate('Y-m-d', to);
					} else {
						console.log('[rank] no regatta found');
						from = year + '-12-31'; // reverse => no regattas will be found => no ranking
						to = year + '-01-01';
						break; // TODO: bessere Fehlermeldung - keine Regatta gefunden
					}
					break;
				default: // TODO: bessere Fehlermeldung - tritt nur bei Fehlkonfiguration in DB auf
					from = (year - 1) + '-12-01';
					to = year + '-11-30';
					break;
			}

			var personMode = $('#select-personmode').val();

			console.log('[rank] setting', from, to, altm, maxage, agestrict, agecrew);
			$('#input-from').val(from);
			$('#input-to').val(to);
			$('#input-altm').val(altm);
			$('#input-maxage').val(maxage == false ? '' : maxage);
			$('#input-agestrict').prop('checked', agestrict);
			$('#input-agecrew').prop('checked', agecrew);

			if (callSiteScript && (typeof siteScript === 'function')) {
				history.replaceState(null, '', '?year=' + year + '&type=' + type + '&pm=' + personMode);
				showLoader();
				siteScript();
			}
		}
		resolve();
	});
}

function buttonShowPressed() {
	if (typeof siteScript === 'function') {
		var additional = '';
		if ($('#input-maxage').val() != '') additional += '&maxage=' + $('#input-maxage').val();
		if ($('#input-agestrict').prop('checked')) additional += '&agestrict=on';
		if ($('#input-agecrew').prop('checked')) additional += '&agecrew=on';
		history.replaceState(null, '', '?year=user&from=' + $('#input-from').val() + "&to=" + $('#input-to').val() + "&altm=" + $('#input-altm').val() + "&pm=" + $('#select-personmode').val() + additional)
		showLoader();
		siteScript();
	}
}

function initSelects() {
	return new Promise(async function(resolve) {
		var year = findGetParameter('year');
		var type = findGetParameter('type');
		var personMode = parseInt(findGetParameter('pm'));
		if (year === null) year = new Date().getFullYear();
		if (type === null) type = 'year';
		if (isNaN(personMode) || personMode < 0 || personMode > 2) personMode = 0;

		var years = await dbGetData('years');
		years.sort(function (a, b) {
			if (a['year'] > b['year']) return -1;
			if (a['year'] < b['year']) return 1;
			return 0;
		});
		var yearFound = year == 'user';
		var options = '<option value="user">Benutzerdefiniert</option>';
		for (id in years) {
			var y = years[id]['year'];
			options += '<option value="' + y + '">' + y + '</option>';
			if (year == y) yearFound = true;
		}
		$('#select-year').html(options);
		$('#select-year').val(yearFound ? year : years[0]);

		$('#select-type').html('<option value="' + type + '">' + type + '</option>');
		$('#select-type').val(type);

		if (year == "user") {
			var from = findGetParameter('from');
			var to = findGetParameter('to');
			if (from === null) from = formatDate('Y-m-d');
			if (to === null) to = formatDate('Y-m-d');
			$('#input-from').val(from).trigger('focusin').trigger('focusout');
			$('#input-to').val(to).trigger('focusin').trigger('focusout');
			var altm = findGetParameter('altm');
			if (altm === null) altm = 9;
			$('#input-altm').val(altm).trigger('focusin').trigger('focusout');
			var maxage = findGetParameter('maxage');
			if (maxage === null) maxage = '';
			$('#input-maxage').val(maxage).trigger('focusin').trigger('focusout');
			var agestrict = findGetParameter('agestrict');
			var agecrew = findGetParameter('agecrew');
			$('#input-agestrict').prop('checked', agestrict !== null);
			$('#input-agecrew').prop('checked', agecrew !== null);
		}

		options = '<option value="0">Steuerleuten</option>';
		options += '<option value="1">Vorschotern</option>';
		options += '<option value="2">allen Seglern</option>';
		$('#select-personmode').html(options);
		$('#select-personmode').val(personMode);

		await selectChange(false);

		resolve();
	});
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
				var altm = $('#input-altm').val(); if (altm == '') altm = 9; else altm = parseInt(altm);
				if (altm == 9) {
					list += '<div><div align="center" class="color-highlight" style="white-space:normal;"><b>Ende der Rangliste gem&auml;&szlig; DSV-Ranglistenverordnung (min. m = 9 Wertungen)</b></div></div>';
				} else {
					list += '<div><div align="center" class="color-highlight" style="white-space:normal;"><b>Ende der Rangliste (min. m = ' + altm + ' Wertungen)</b></div></div>';
				}
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
		rankings = await dbGetData('rankings');
		await initSelects();
		$('#select-year').change(selectChange);
		$('#select-type').change(selectChange);
		$('#select-personmode').change(selectChange);
		$('#button-show').click(buttonShowPressed);
		$('#input-search').on('input', drawList);
	}

	var minDate = parseDate($('#input-from').val());
	var maxDate = parseDate($('#input-to').val());
	var altm = $('#input-altm').val(); if (altm == '') altm = 9; else altm = parseInt(altm);
	var maxage = $('#input-maxage').val(); if (maxage == '') maxage = false; else maxage = parseInt(maxage);
	var agestrict = $('#input-agestrict').prop('checked');
	var agecrew = $('#input-agecrew').prop('checked');
	var personMode = $('#select-personmode').val();
	console.log('[rank] rank params:', minDate, maxDate, altm, maxage, agestrict, agecrew, personMode);
	var dbRanking = await dbGetRanking(minDate, maxDate, maxage, agestrict, altm, agecrew, personMode);
	ranking = dbRanking[0];

	lastRanking = null; // TODO: also for quali ranks
	if (($('#select-type').val() == 'year') || ($('#select-type').val() == 'youth')) {
		lastRanking = {};
		var lYear = parseInt($('#select-year').val()) - 1;
		var lMinDate = parseDate((lYear - 1) + '-12-01');
		var lMaxDate = parseDate(lYear + '-11-30');
		var lDbRanking = (await dbGetRanking(lMinDate, lMaxDate, maxage, agestrict, altm, agecrew, personMode))[0];
		for (var i in lDbRanking) {
			lastRanking[lDbRanking[i].id] = lDbRanking[i].rank;
		}
	}

	var selectedYear = $('#select-year').val();

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

			if (!dsvEnd && (entry.m < altm)) {
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
