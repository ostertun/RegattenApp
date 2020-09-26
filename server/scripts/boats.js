var firstCall = true;
var rows = [];
var displayed = [];
var page = 1;
var pageCount = 0;
const showCount = 25;

async function onEditBoatnameClick() {
	var id = $('#button-editboatname').attr('data-boat-id');
	var name = $('#input-editboatname').val();
	if (name != '') {
		showLoader();
		$.ajax({
			url: QUERY_URL + 'add_boatname',
			method: 'POST',
			data: {
				boat: id,
				name: name
			},
			error: function (xhr, status, error) {
				if (xhr.status == 0) {
					toastError('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um den Bootsnamen zu bearbeiten');
				} else {
					console.log('EditBoatname: unbekannter Fehler', status, error);
					console.log(xhr);
					toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
				}
				hideLoader();
			},
			success: function (data, status, xhr) {
				if ('status' in data) {
					if (data.status == 'added') {
						toastOk('Bootsnamen erfolgreich hinzugefügt');
						sync();
					} else {
						toastInfo('Wir prüfen Deine Anfrage und korrigieren den Bootsnamen schnellstmöglich', 5000);
					}
				} else {
					toastOk('Erfolgreich');
				}
				hideLoader();
			}
		});
	}
	$('#menu-editboatname').hideMenu();
}

async function onListClicked(id) {
	var boat = await dbGetData('boats', id);
	
	$('#menu-boat').find('.menu-title').find('p').text(boat.sailnumber);
	
	// Edit Boatname
	$('#button-editboatname').attr('data-boat-id', boat.id);
	$('#menu-editboatname').find('.menu-title').find('p').text(boat.sailnumber);
	if (boat['name'] == '') {
		$('#menu-item-boatname').find('span').text('Bootsnamen hinzufügen');
		$('#menu-editboatname').find('.menu-title').find('h1').text('Bootsnamen hinzufügen');
		$('#input-editboatname').val('');
	} else {
		$('#menu-item-boatname').find('span').text('Bootsnamen bearbeiten');
		$('#menu-editboatname').find('.menu-title').find('h1').text('Bootsnamen bearbeiten');
		$('#input-editboatname').val(boat.name);
	}
	$('#input-editboatname').trigger('focusin').trigger('focusout');
	
	// club website
	var clubwebsite = '';
	if (boat['club'] != null) {
		clubwebsite = (await dbGetData('clubs', boat['club'])).website;
	}
	if (clubwebsite != '') {
		$('#menu-item-clubwebsite').show();
		$('#menu-item-clubwebsite').attr('href', clubwebsite);
		$('#menu-item-clubwebsite').attr('target', '_blank');
	} else {
		$('#menu-item-clubwebsite').hide();
	}
	
	$('#menu-boat').showMenu();
	$('#menu-boat').scrollTop(0);
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
		$('#menu-item-boatname').click(function(){ $('#menu-boat').hideMenu(); $('#menu-editboatname').showMenu(); });
		$('#button-editboatname').click(onEditBoatnameClick);
	}
	
	var results = await dbGetData('boats');
	
	var count = results.length;
	if (count > 0) {
		if (count == 1) {
			$('#p-count').html('Es wurde 1 Boot gefunden!');
		} else {
			$('#p-count').html('Es wurden ' + count + ' Boote gefunden!');
		}
		$('#div-list').show();
		$('#input-search').parent().show();
		
		results.sort(function (a, b) {
			return a.sailnumber.localeCompare(b.sailnumber);
		});
		
		rows = [];
		
		for (id in results) {
			var entry = results[id];
			var club = null;
			if (entry['club'] != null)
				club = await dbGetData('clubs', entry['club']);
			
			var row = { keywords: [], content: '' };
			row.keywords.push(entry['sailnumber']);
			if (entry['name'] != '') row.keywords.push(entry['name']);
			if (club != null) row.keywords.push(club['kurz'], club['name']);
			
			row.content += '<div onclick="onListClicked(' + entry['id'] + ');">';
			
			// ZEILE 1
			// Sailnumber
			row.content += '<div><b>' + entry['sailnumber'] + '</b></div>';
			
			// ZEILE 2
			row.content += '<div>';
			
			// Name
			row.content += '<div>' + entry['name'] + '</div>';
			
			// Club
			row.content += '<div>' + ((club != null) ? club['kurz'] : '') + '</div>';
			
			row.content += '</div></div>';
			
			rows.push(row);
		}
		
		reSearch();
		
	} else {
		$('#p-count').html('Keine Boote gefunden!');
		$('#div-list').hide();
		$('#input-search').parent().hide();
	}
	
	hideLoader();
}