var firstCall = true;
var rows = [];
var displayed = [];
var page = 1;
var pageCount = 0;
const showCount = 25;
var followedSailors = [];

async function onFollowChange() {
	var id = $('#menu-item-follow').attr('data-sailor-id');
	showLoader();
	$('#menu-sailor').hideMenu();
	var auth = {
		id: localStorage.getItem('auth_id'),
		hash: localStorage.getItem('auth_hash')
	}
	$.ajax({
		url: QUERY_URL + ($('#menu-item-follow').prop('checked') ? 'sailor_follow' : 'sailor_unfollow'),
		method: 'POST',
		data: {
			auth: auth,
			sailor: id
		},
		error: function (xhr, status, error) {
			if (xhr.status == 0) {
				toastError('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um Deine Favoriten zu bearbeiten.');
			} else {
				log('Un/Follow: unbekannter Fehler', status, error);
				log(xhr);
				toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
			}
			hideLoader();
		},
		success: async function (data, status, xhr) {
			await sync();
			toastOk('Erfolgreich');
			hideLoader();
		}
	});
}

async function onEditYearClick() {
	var id = $('#button-edityear').attr('data-sailor-id');
	var year = $('#input-edityear').val();
	if (year != '') {
		showLoader();
		$.ajax({
			url: QUERY_URL + 'add_year',
			method: 'POST',
			data: {
				sailor: id,
				year: year
			},
			error: function (xhr, status, error) {
				if (xhr.status == 0) {
					toastError('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um den Jahrgang zu bearbeiten');
				} else {
					log('EditYear: unbekannter Fehler', status, error);
					log(xhr);
					toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
				}
				hideLoader();
			},
			success: function (data, status, xhr) {
				if ('status' in data) {
					if (data.status == 'added') {
						toastOk('Jahrgang erfolgreich hinzugefügt');
						sync();
					} else {
						toastInfo('Wir prüfen Deine Anfrage und korrigieren den Jahrgang schnellstmöglich', 5000);
					}
				} else {
					toastOk('Erfolgreich');
				}
				hideLoader();
			}
		});
	}
	$('#menu-edityear').hideMenu();
}

async function onListClicked(id) {
	var sailor = await dbGetData('sailors', id);

	$('#menu-sailor').find('.menu-title').find('p').text(sailor.name);

	// Follow
	if (isLoggedIn()) {
		var found = false;
		for (var i in followedSailors) {
			if (followedSailors[i].id == sailor.id) found = true;
		}
		if (found || (followedSailors.length < 5)) {
			$('#menu-item-follow').attr('data-sailor-id', sailor.id);
			$('#menu-item-follow').prop('checked', found);
			$('#menu-item-follow').parent().parent().show();
			$('#menu-item-follow-disabled').hide();
		} else {
			$('#menu-item-follow').parent().parent().hide();
			$('#menu-item-follow-disabled').show();
		}
	} else {
		$('#menu-item-follow').parent().parent().hide();
		$('#menu-item-follow-disabled').hide();
	}

	// Edit Year
	$('#button-edityear').attr('data-sailor-id', sailor.id);
	$('#menu-edityear').find('.menu-title').find('p').text(sailor.name);
	if (sailor['year'] == null) {
		$('#menu-item-year').find('span').text('Jahrgang hinzufügen');
		$('#menu-edityear').find('.menu-title').find('h1').text('Jahrgang hinzufügen');
		$('#input-edityear').val('');
	} else {
		$('#menu-item-year').find('span').text('Jahrgang bearbeiten');
		$('#menu-edityear').find('.menu-title').find('h1').text('Jahrgang bearbeiten');
		$('#input-edityear').val(sailor.year);
	}
	$('#input-edityear').trigger('focusin').trigger('focusout');

	// club website
	var clubwebsite = '';
	if (sailor['club'] != null) {
		clubwebsite = (await dbGetData('clubs', sailor['club'])).website;
	}
	if (clubwebsite != '') {
		$('#menu-item-clubwebsite').show();
		$('#menu-item-clubwebsite').attr('href', clubwebsite);
		$('#menu-item-clubwebsite').attr('target', '_blank');
	} else {
		$('#menu-item-clubwebsite').hide();
	}

	$('#menu-sailor').showMenu();
	$('#menu-sailor').scrollTop(0);
}

function pageChange() {
	$('#p-count')[0].scrollIntoView({ behavior: "smooth" });
	drawList();
}

async function drawList() {
	window.setTimeout(function () {
		var list = '';

		if (displayed.length > 0) {
			var offset = (page - 1) * showCount;
			var count = (page == pageCount ? (displayed.length % showCount) : showCount);
			if (count == 0) count = showCount;

			for (i = 0; i < count; i ++) {
				list += displayed[i + offset];
			}
		} else {
			list = '<div><div>Keine Ergebnisse, die der Suche entsprechen</div></div>';
		}

		$('#div-list').html(list);
	}, 0);
}

async function reSearch() {
	window.setTimeout(function () {
		displayed = [];
		rows.forEach(function (entry) {
			if (search($('#input-search').val(), entry.keywords)) {
				displayed.push(entry.content);
			}
		});
		pageCount = Math.ceil(displayed.length / showCount);
		if ((page < 1) || (page > pageCount)) {
			if (page < 1) {
				page = 1;
			} else {
				page = pageCount;
			}
		}
		drawPagination();
		drawList();
	}, 0);
}

var siteScript = async function() {
	if (firstCall) {
		firstCall = false;
		initPagination();
		$('#input-search').on('input', reSearch);
		$('#menu-item-year').click(function(){ $('#menu-sailor').hideMenu(); $('#menu-edityear').showMenu(); });
		$('#button-edityear').click(onEditYearClick);
		$('#menu-item-follow').parent().parent().click(onFollowChange);
		$('#menu-item-follow-disabled').click(function(){ $('#menu-sailor').hideMenu(); toastInfo('Du kannst maximal 5 Seglern folgen. Entferne erst einen Segler aus Deinen Favoriten, bevor Du andere aufnimmst.', 5000); });
	}

	if (isLoggedIn()) {
		var user = await dbGetData('users', USER_ID);
		var follows = await dbGetData('follows');
		followedSailors = [];
		for (var i in follows) {
			followedSailors.push(await dbGetData('sailors', follows[i]));
		}
	}

	var results = await dbGetData('sailors');

	var count = results.length;
	if (count > 0) {
		if (count == 1) {
			$('#p-count').html('Es wurde 1 Segler gefunden!');
		} else {
			$('#p-count').html('Es wurden ' + count + ' Segler gefunden!');
		}
		$('#div-list').show();
		$('#input-search').parent().show();

		results.sort(function (a, b) {
			return a.name.localeCompare(b.name);
		});

		rows = [];

		for (id in results) {
			var entry = results[id];
			var club = null;
			if (entry['club'] != null)
				club = await dbGetData('clubs', entry['club']);

			var row = { keywords: [], content: '' };
			row.keywords.push(entry['name']);
			if (entry['year'] != null) row.keywords.push(entry['year']);
			if (club != null) row.keywords.push(club['kurz'], club['name']);

			row.content += '<div onclick="onListClicked(' + entry['id'] + ');">';

			// ZEILE 1
			// Name
			row.content += '<div><b>' + entry['name'] + '</b></div>';

			// ZEILE 2
			row.content += '<div>';

			// Year
			row.content += '<div>' + ((entry['year'] != null) ? (entry['year']) : '') + '</div>';

			// Club
			row.content += '<div>' + ((club != null) ? club['kurz'] : '') + '</div>';

			row.content += '</div></div>';

			rows.push(row);
		}

		reSearch();

	} else {
		$('#p-count').html('Keine Segler gefunden!');
		$('#div-list').hide();
		$('#input-search').parent().hide();
	}

	hideLoader();
}
