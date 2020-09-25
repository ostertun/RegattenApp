var firstCall = true;
var rows = [];
var displayed = [];
var page = 1;
var pageCount = 0;
const showCount = 25;

async function onListClicked(id) {
	var sailor = await dbGetData('sailors', id);
	
	$('#menu-sailor').find('.menu-title').find('p').text(sailor.name);
	
	// Edit Year
	// TODO: create menu for edit year
	if (sailor['year'] == null) {
		$('#menu-item-year').find('span').text('Jahrgang hinzufügen');
	} else {
		$('#menu-item-year').find('span').text('Jahrgang bearbeiten');
	}
	
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