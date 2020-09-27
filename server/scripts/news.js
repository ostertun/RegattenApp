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

function addCard(newsEntry) {
	console.log(newsEntry);
	var content = '<h2>' + newsEntry.title + '</h2>';
	content += '<p class="mb-2"><i>' + formatDate('d.m.Y', newsEntry.date) + '</i></p>';
	content += '<p class="mb-0">' + newsEntry.description.replace('\n', '<br>') + '</p>';
	if (newsEntry.html != '') {
		content += '<a class="btn btn-full rounded-s text-uppercase font-900 shadow-m bg-highlight mt-3" href="#" onclick="onNewsClicked(' + newsEntry.id + '); return false;">Mehr lesen</a>';
	}
	
	$('.page-content').append(cardTemplate.replace('%ID%', 'card-news-' + newsEntry.id).replace('%CONTENT%', content));
}

var siteScript = async function() {
	$('.card-news').remove();
	var news = await dbGetData('news');
	news.sort(function (a,b) {
		return b.date.localeCompare(a.date);
	});
	var today = getToday();
	var lastYear = new Date(today);
	lastYear.setFullYear(lastYear.getFullYear() - 1);
	console.log(today, lastYear);
	for (var n in news) {
		var newsEntry = news[n];
		newsEntry.date = parseDate(newsEntry.date.substring(0, 10));
		if (newsEntry.date > today) continue;
		if (newsEntry.date < lastYear) break;
		addCard(newsEntry);
	}
	hideLoader();
}