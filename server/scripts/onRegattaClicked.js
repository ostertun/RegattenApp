async function onRegattaClicked(id) {
	var regatta = await dbGetData('regattas', id);

	$('#menu-regatta').find('.menu-title').find('p').text(regatta.name);

	var dateTo = parseDate(regatta['date']);
	dateTo.setDate(dateTo.getDate() + Math.max(parseInt(regatta['length']) - 1, 0));

	var text = [];
	var specialFields = await dbGetClassProp('special-fields');
	if (specialFields === null) specialFields = {};
	if (regatta.special.substr(0, 1) == '#') {
		regatta.special = regatta.special.substr(1);
		if (typeof specialFields[regatta.special] !== 'undefined') {
			text.push(specialFields[regatta.special]);
		}
	}
	var pos;
	while ((pos = regatta.special.indexOf('$')) >= 0) {
		var pos2 = regatta.special.indexOf('$', pos + 1);
		if (pos2 < 0) break;
		var key = regatta.special.substring(pos + 1, pos2);

		// age class
		if ((key.substr(0, 1) == 'U') && (!isNaN(value = parseInt(key.substr(1))))) {
			var year = parseDate(regatta.date).getFullYear();
			year = year - value + 1;
			text.push('Jahrgänge ' + year + ' und jünger');
		} else {
			break;
		}

		regatta.special = regatta.special.replace('$' + key + '$', '');
	}
	if (text.length > 0) {
		text.sort();
		for (i in text) {
			text[i] = $('<div />').text(text[i]).html();
		}
		$('#menu-item-special').html(text.join('<br>'));
		$('#menu-item-special').show();
	} else {
		$('#menu-item-special').hide();
	}

	var plannings = await dbGetDataIndex('plannings', 'regatta', regatta['id']);
	var planning = null;
	if (isLoggedIn()) {
		for (id in plannings) {
			if (plannings[id]['user'] == USER_ID) {
				planning = plannings[id];
				break;
			}
		}
	}

	// Your Planning
	if (planning != null) {
		$('#menu-item-yourplanning').show();
		var steuermann = null;
		if (planning.steuermann != null) {
			steuermann = (await dbGetData('sailors', planning.steuermann)).name;
		}
		var crew = [steuermann == null ? '[noch unklar]' : steuermann];
		crewA = planning.crew.split(',');
		for (i in crewA) {
			var sailor = await dbGetData('sailors', crewA[i]);
			if (sailor != null) {
				crew.push(sailor.name);
			}
		}
		var status = '';
		if (planning.gemeldet == '1') status = 'gemeldet';
		if (planning.bezahlt == '1') {
			if (status != '') status += ' und ';
			status += 'bezahlt';
		}
		if (status != '') crew.push('<font style="font-style:italic;">' + status + '</font>');
		$('#menu-item-yourplanning').html(crew.join('<br>'));
	} else {
		$('#menu-item-yourplanning').hide();
	}

	// Planning: Edit Status
	if ((planning != null) && (typeof planningEditStatus === 'function')) {
		$('#menu-item-status').show();
		$('#menu-item-status').attr('onclick', 'planningEditStatus(' + regatta['id'] + ')');
	} else {
		$('#menu-item-status').hide();
	}

	// Planning
	if ((plannings.length > 0) && (dateTo >= today)) {
		$('#badge-regatta-plannings').text(plannings.length);
		$('#menu-item-plannings').attr('href', LINK_PRE + 'regatta_plan?regatta=' + regatta['id']);
		$('#menu-item-plannings').show();
	} else {
		$('#menu-item-plannings').hide();
	}

	// Entrylist
	var extServiceData;
	try {
		extServiceData = JSON.parse(regatta.extServiceData);
	} catch {
		extServiceData = {};
	}
	if ((regatta.extService !== null) && ('entryCount' in extServiceData)) {
		$('#badge-regatta-entrylist').text(extServiceData.entryCount);
		$('#menu-item-entrylist').attr('href', extServiceGetLink(regatta.extService, 'entrylist', extServiceData.eventId)); // TODO
		$('#menu-item-entrylist').show();
	} else {
		$('#menu-item-entrylist').hide();
	}

	// Results
	if (regatta['results'] == '1') {
		$('#menu-item-results').show();
		$('#menu-item-results').attr('href', LINK_PRE + 'result?regatta=' + regatta['id']);
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
	if ((regatta['meldung'] != '') && (dateTo >= today)) {
		$('#menu-item-meldung').show();
		$('#menu-item-meldung').attr('href', regatta['meldung']);
		$('#menu-item-meldung').attr('target', '_blank');
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
