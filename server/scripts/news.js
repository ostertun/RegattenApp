var firstCall = true;
var rows = [];
var page = 1;
var pageCount = 0;
const showCount = 10;

async function onNewsClicked(id) {
	var newsEntry = await dbGetData('news', id);
	if (newsEntry == null) return;

	$('#menu-news').css('height', '80%');
	$('#menu-news').css('width', '90%');
	$('#menu-news').find('.menu-title').find('p').text(newsEntry.title);
	$('#menu-news').find('.content').addClass('pb-3');
	$('#menu-news').find('.content').html(newsEntry.html);

	$('#menu-news').showMenu();
}

function pageChange() {
	$('h1')[0].scrollIntoView({ behavior: "smooth" });
	drawList();
}

function addCard(newsEntry) {
	var badge = '';
	if (newsEntry.unread) {
		badge += '<span class="badge bg-highlight color-white p-1">NEW</span>&ensp;';
	}
	var content = '<h2>' + badge + newsEntry.title + '</h2>';
	content += '<p class="mb-2"><i>' + formatDate('d.m.Y', newsEntry.date) + '</i></p>';
	content += '<p class="mb-0">' + newsEntry.description.replace('\n', '<br>') + '</p>';
	if (newsEntry.html != '') {
		content += '<a class="btn btn-full rounded-s text-uppercase font-900 shadow-m bg-highlight mt-3" href="#" onclick="onNewsClicked(' + newsEntry.id + '); return false;">Mehr lesen</a>';
	}

	$('#news-entries').append(cardTemplate.replace('%ID%', 'card-news-' + newsEntry.id).replace('%CONTENT%', content));
}

async function drawList() {
	$('.card-news').remove();
	if (rows.length > 0) {
		var offset = (page - 1) * showCount;
		var count = (page == pageCount ? (rows.length % showCount) : showCount);
		if (count == 0) count = showCount;

		for (i = 0; i < count; i ++) {
			addCard(rows[i + offset]);
		}
	}
}

var siteScript = async function() {
	if (firstCall) {
		firstCall = false;
		initPagination();
	}
	rows = [];
	var news = await dbGetData('news');
	news.sort(function (a,b) {
		return b.date.localeCompare(a.date);
	});
	var newsRead = await dbSettingsGet('news_read_' + BOATCLASS);
	var now = new Date();
	var lastYear = new Date();
	lastYear.setFullYear(lastYear.getFullYear() - 1);
	for (var n in news) {
		var newsEntry = news[n];
		newsEntry.date = parseDbTimestamp(newsEntry.date);
		if (newsEntry.date > now) continue;
		if (newsEntry.date < lastYear) break;
		newsEntry.unread = (newsEntry.date > newsRead);
		rows.push(newsEntry);
	}
	pageCount = Math.ceil(rows.length / showCount);
	if ((page < 1) || (page > pageCount)) {
		if (page < 1) {
			page = 1;
		} else {
			page = pageCount;
		}
	}
	drawPagination();
	drawList();
	dbSettingsSet('news_read_' + BOATCLASS, now);
	updateNewsBadge();
	hideLoader();
}
