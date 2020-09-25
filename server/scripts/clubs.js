var firstCall = true;
var rows = [];
var displayed = [];
var page = 1;
var pageCount = 0;
const showCount = 25;

async function onListClicked(id) {
	var club = await dbGetData('clubs', id);
	
	$('#menu-club').find('.menu-title').find('p').text(club.name);
	
	// club website
	if (club.website != '') {
		$('#menu-item-clubwebsite').show();
		$('#menu-item-clubwebsite').attr('href', club.website);
		$('#menu-item-clubwebsite').attr('target', '_blank');
	} else {
		$('#menu-item-clubwebsite').hide();
	}
	
	$('#menu-club').showMenu();
	$('#menu-club').scrollTop(0);
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
	
	var results = await dbGetData('clubs');
	
	var count = results.length;
	if (count > 0) {
		if (count == 1) {
			$('#p-count').html('Es wurde 1 Verein gefunden!');
		} else {
			$('#p-count').html('Es wurden ' + count + ' Vereine gefunden!');
		}
		$('#div-list').show();
		$('#input-search').parent().show();
		
		results.sort(function (a, b) {
			var comp = a.kurz.localeCompare(b.kurz);
			if (comp == 0)
				comp = a.name.localeCompare(b.name);
			return comp;
		});
		
		rows = [];
		
		for (id in results) {
			var entry = results[id];
			
			var row = { keywords: [], content: '' };
			row.keywords.push(entry['dsv'], entry['kurz'], entry['name']);
			if (entry['website'] != '') row.keywords.push(entry['website']);
			
			row.content += '<div onclick="onListClicked(' + entry['id'] + ');">';
			
			// ZEILE 1
			// Name
			row.content += '<div><b>' + entry['name'] + '</b></div>';
			
			// ZEILE 2
			row.content += '<div>';
			
			// DSV
			row.content += '<div>' + entry['dsv'] + '</div>';
			
			// Kurz
			row.content += '<div>' + entry['kurz'] + '</div>';
			
			row.content += '</div></div>';
			
			rows.push(row);
		}
		
		reSearch();
		
	} else {
		$('#p-count').html('Keine Vereine gefunden!');
		$('#div-list').hide();
		$('#input-search').parent().hide();
	}
	
	hideLoader();
}