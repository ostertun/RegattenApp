var firstCall = true;
var rows = [];
var displayed = [];
var page = 1;
var pageCount = 0;
const showCount = 25;

async function onListClicked(id) {
	window.location = LINK_PRE + 'expenditures-user?user=' + id;
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
	if (!isLoggedIn()) {
		hideLoader();
		return;
	}

	if (firstCall) {
		firstCall = false;
		initPagination();
		$('#input-search').on('input', reSearch);
		$('#button-add').click((e) => expendituresShowAdd());
		$('#button-add-transfer').click((e) => expendituresShowAddTransfer());
		expendituresInitModals();
	}

	let allExps = await dbGetData('expenditures');
	let expUsers = {};
	for (let i in allExps) {
		let exp = allExps[i];
		let eUId = exp.user;
		if (!(eUId in expUsers)) {
			expUsers[eUId] = {
				userId: eUId,
				username: (await dbGetData('users', eUId)).username,
				balance: 0,
				openApprovals: 0,
				cnt: 0
			};
		}
		if (exp.canceled == 0) {
			expUsers[eUId].balance += exp.direction * parseInt(exp.amount);
		}
		if (exp.approved == 0) {
			if (exp.direction < 0 && exp.canceled == 0) expUsers[eUId].openApprovals++;
			if (exp.direction > 0 && exp.canceled == 1) expUsers[eUId].openApprovals++;
		}
		expUsers[eUId].cnt++;
	}
	let results = Object.values(expUsers);

	let count = results.length;
	if (count > 0) {
		$('#p-count').hide();
		$('#div-list').show();
		$('#input-search').parent().show();

		results.sort(function (a, b) {
			return b.cnt - a.cnt;
		});

		rows = [];

		for (id in results) {
			var entry = results[id];

			var row = { keywords: [], content: '' };
			row.keywords.push(entry.username);

			row.content += '<div onclick="onListClicked(' + entry.userId + ');">';

			// ZEILE 1
			// Username
			row.content += '<div><b>' + entry.username + '</b></div>';

			// ZEILE 2
			row.content += '<div>';

			// open approvals
			row.content += '<div>' + ((entry.openApprovals > 0) ? (entry.openApprovals + ' offene Genehmigung' + (entry.openApprovals > 1 ? 'en' : '')) : '') + '</div>';

			// balance
			row.content += '<div>';
			if (entry.balance < 0) row.content += '<font style="color:red;">';
			row.content += (entry.balance / 100).toFixed(2);
			if (entry.balance < 0) row.content += '</font>';
			row.content += ' €</div>';

			row.content += '</div></div>';

			rows.push(row);
		}

		reSearch();

	} else {
		$('#p-count').show().html('Keine Ausgaben gefunden!');
		$('#div-list').hide();
		$('#input-search').parent().hide();
	}

	hideLoader();
}
