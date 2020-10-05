async function planningSwitchChanged() {
	showLoader();
	var id = $('#switch-planning-include').data('regatta');
	var include = $('#switch-planning-include').prop('checked');
	var auth = {
		id: localStorage.getItem('auth_id'),
		hash: localStorage.getItem('auth_hash')
	}
	if (include) {
		// add to planning
		$.ajax({
			url: QUERY_URL + 'planning_add',
			method: 'POST',
			data: {
				auth: auth,
				regatta: id
			},
			error: function (xhr, status, error) {
				if (xhr.status == 401) {
					log('authentification failed');
					toastError('Authentifizierung fehlgeschlagen. Versuche es erneut.');
				} else if (xhr.status == 0) {
					toastError('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um die &Auml;nderungen zu speichern');
				} else {
					log('planning_add: unbekannter Fehler', status, error);
					log(xhr);
					toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
				}
				$('#menu-edit').hideMenu();
				hideLoader();
			},
			success: async function (data, status, xhr) {
				await sync();
				planningEdit(id);
				hideLoader();
			}
		});
	} else {
		// remove from planning
		$.ajax({
			url: QUERY_URL + 'planning_remove',
			method: 'POST',
			data: {
				auth: auth,
				regatta: id
			},
			error: function (xhr, status, error) {
				if (xhr.status == 401) {
					log('authentification failed');
					toastError('Authentifizierung fehlgeschlagen. Versuche es erneut.');
				} else if (xhr.status == 0) {
					toastError('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um die &Auml;nderungen zu speichern');
				} else {
					log('planning_remove: unbekannter Fehler', status, error);
					log(xhr);
					toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
				}
				$('#menu-edit').hideMenu();
				hideLoader();
			},
			success: async function (data, status, xhr) {
				await sync();
				planningEdit(id);
				hideLoader();
			}
		});
	}
}

var sailorIsSteuermann;
var sailors = [];

async function sailorSelected(sid) {
	$('#menu-sailor').hideMenu();
	showLoader();
	var rid = $('#switch-planning-include').data('regatta');
	var action = (sailorIsSteuermann ? 'planning_set_steuermann' : 'planning_add_crew');
	// add sailor
	var auth = {
		id: localStorage.getItem('auth_id'),
		hash: localStorage.getItem('auth_hash')
	}
	$.ajax({
		url: QUERY_URL + action,
		method: 'POST',
		data: {
			auth: auth,
			regatta: rid,
			sailor: sid
		},
		error: function (xhr, status, error) {
			if (xhr.status == 401) {
				log('authentification failed');
				toastError('Authentifizierung fehlgeschlagen. Versuche es erneut.');
			} else if (xhr.status == 0) {
				toastError('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um die &Auml;nderungen zu speichern');
			} else {
				log(action + ': unbekannter Fehler', status, error);
				log(xhr);
				toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
			}
			hideLoader();
		},
		success: async function (data, status, xhr) {
			await sync();
			planningEdit(rid);
			hideLoader();
		}
	});
}

async function sailorsSearch() {
	$('.item-sailor-search').remove();
	if (sailorIsSteuermann) {
		var item = '<a class="item-sailor-search" onclick="sailorSelected(null)">';
		item += '<span style="font-style:italic;">noch unklar</span>';
		item += '<i class="fa fa-angle-right"></i>';
		item += '</a>';
		$('#menu-sailor').find('.content').find('.list-group').append(item);
	}
	if ($('#input-edit-search').val().length >= 3) {
		sailors.forEach(function (entry) {
			if (search($('#input-edit-search').val(), entry.keywords)) {
				$('#menu-sailor').find('.content').find('.list-group').append(entry.content);
			}
		});
	} else {
		var item = '<p class="item-sailor-search">Gib mindestens 3 Zeichen ein</p>';
		$('#menu-sailor').find('.content').find('.list-group').append(item);
	}
}

async function initSailors() {
	sailors = [];
	var dbSailors = await dbGetData('sailors');
	dbSailors.sort(function(a,b){
		return a.name.localeCompare(b.name);
	});
	for (s in dbSailors) {
		var item = '<a class="item-sailor-search" onclick="sailorSelected(' + dbSailors[s].id + ')">';
		item += '<span>' + dbSailors[s].name + '</span>';
		item += '<i class="fa fa-angle-right"></i>';
		item += '</a>';
		sailors.push({
			keywords: [dbSailors[s].name],
			content: item
		});
	}
}

async function planningChangeCrew(sid = null) {
	if (sid !== null) {
		showLoader();
		var rid = $('#switch-planning-include').data('regatta');
		// remove sailor
		var auth = {
			id: localStorage.getItem('auth_id'),
			hash: localStorage.getItem('auth_hash')
		}
		$.ajax({
			url: QUERY_URL + 'planning_remove_crew',
			method: 'POST',
			data: {
				auth: auth,
				regatta: rid,
				sailor: sid
			},
			error: function (xhr, status, error) {
				if (xhr.status == 401) {
					log('authentification failed');
					toastError('Authentifizierung fehlgeschlagen. Versuche es erneut.');
				} else if (xhr.status == 0) {
					toastError('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um die &Auml;nderungen zu speichern');
				} else {
					log('planning_remove_crew: unbekannter Fehler', status, error);
					log(xhr);
					toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
				}
				$('#menu-edit').hideMenu();
				hideLoader();
			},
			success: async function (data, status, xhr) {
				await sync();
				planningEdit(rid);
				hideLoader();
			}
		});
	} else {
		sailorIsSteuermann = false;
		$('#input-edit-search').val('').trigger('focusin').trigger('focusout');
		sailorsSearch();
		$('#menu-edit').hideMenu();
		$('#menu-sailor').find('.menu-title').find('h1').text('Crew hinzufügen');
		$('#menu-sailor').showMenu();
	}
}

async function planningChangeSteuermann() {
	sailorIsSteuermann = true;
	$('#input-edit-search').val('').trigger('focusin').trigger('focusout');
	sailorsSearch();
	$('#menu-edit').hideMenu();
	$('#menu-sailor').find('.menu-title').find('h1').text('Steuermann/-frau bearbeiten');
	$('#menu-sailor').showMenu();
}

async function planningEdit(id) {
	var regatta = await dbGetData('regattas', id);

	$('#menu-edit').find('.menu-title').find('p').text(regatta.name);

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

	$('#switch-planning-include').data('regatta', id);
	if (planning !== null) {
		$('#switch-planning-include').prop('checked', true);
		$('#item-steuermann').show();
		if (planning.steuermann !== null) {
			$('#item-steuermann').find('span').text('Steuer: ' + (await dbGetData('sailors', planning.steuermann)).name);
		} else {
			$('#item-steuermann').find('span').html('Steuer: <font style="font-style:italic;">noch unklar</font>');
		}
		$('.item-crew').remove();
		var crew = planning.crew.split(',');
		for (c in crew) {
			var sailor = await dbGetData('sailors', crew[c]);
			if (sailor !== null) {
				var item = '<a class="item-crew" onclick="planningChangeCrew(' + sailor.id + ')">';
				item += '<span>' + sailor.name + '</span>';
				item += '<i class="fa fa-angle-right"></i>';
				item += '</a>';
				$('#menu-edit').find('.content').find('.list-group').append(item);
			}
		}
		var item = '<a class="item-crew" onclick="planningChangeCrew()">';
		item += '<span style="font-style:italic;">Weiteren Segler hinzuf&uuml;gen</span>';
		item += '<i class="fa fa-angle-right"></i>';
		item += '</a>';
		$('#menu-edit').find('.content').find('.list-group').append(item);
	} else {
		$('#switch-planning-include').prop('checked', false);
		$('#item-steuermann').hide();
		$('.item-crew').remove();
	}
	$('#menu-edit').showMenu();
}

function selectChange() {
	var val = $('#select-year').val();

	if (typeof siteScript === 'function') {
		history.replaceState(null, '', '?year=' + val);
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
	if (!isLoggedIn()) {
		location.href = LINK_PRE + 'planning';
		return;
	}

	if (firstCall) {
		firstCall = false;
		initYear();
		$('#select-year').change(selectChange);
		$('#input-search').on('input', drawList);
		$('#switch-planning-include').parent().parent().click(planningSwitchChanged);
		$('#item-steuermann').click(planningChangeSteuermann);
		$('#input-edit-search').on('input', sailorsSearch);
		initSailors();
	}

	today = getToday();

	var selectedYear = $('#select-year').val();
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
			regattas[i].planning = null;
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
			if (entry.planning !== null) {
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
			}

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

			if (entry.planning !== null) {
				row.content += '<div onclick="planningEdit(' + entry['id'] + ');">';
			} else {
				row.content += '<div onclick="planningEdit(' + entry['id'] + ');" style="opacity:0.5;">';
			}

			// ZEILE 1
			// Name
			row.content += '<div><b>' + (entry['canceled'] == 1 ? '<s>' : '') + entry['name'] + (entry['canceled'] == 1 ? '</s>' : '') + '</b></div>';

			// ZEILE 2
			row.content += '<div>';

			// Number
			row.content += '<div>' + ((entry['number'] != null) ? ('# ' + entry['number']) : '') + '</div>';

			// Special
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

			if (entry.planning !== null) {
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
			} else {
				row.content += '<div>Du planst nicht, hierhin zu fahren</div>';
			}

			row.content += '</div>';

			rows.push(row);
		}

		if (!heute) {
			rows.push(null);
		}

		drawList();

	} else {
		$('#p-count').html('Keine Regatten gefunden!');
		$('#div-regattas').hide();
		$('#input-search').parent().hide();
	}

	hideLoader();
}
