async function onUserClicked(id) {
	var user = await dbGetData('users', id);
	if (user !== null) {
		location.href = LINK_PRE + 'planning_view?user=' + user.id;
	}
}

function selectChange() {
	var val = $('#select-year').val();

	if (typeof siteScript === 'function') {
		history.replaceState(null, '', '?year=' + val);
		showLoader();
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
			if (search($('#input-search').val(), entry.keywords)) {
				list += entry.content;
			}
		});
		$('#div-users').html(list);
	}, 0);
}

var siteScript = async function() {
	if (!isLoggedIn()) {
		hideLoader();
		return;
	}

	if (firstCall) {
		firstCall = false;
		initYear();
		$('#select-year').change(selectChange);
		$('#input-search').on('input', drawList);
	}

	var selectedYear = $('#select-year').val();
	var minDate = parseDate(selectedYear + '-01-01');
	var maxDate = parseDate(selectedYear + '-12-31');
	var regattas = await dbGetRegattasRange(minDate, maxDate);
	var plannings = {};
	for (var i in regattas) {
		var entry = regattas[i];
		var planning = await dbGetDataIndex('plannings', 'regatta', entry.id);
		for (p in planning) {
			if (!(planning[p].user in plannings)) {
				plannings[planning[p].user] = {
					user: await dbGetData('users', planning[p].user),
					regattas: [],
					sailors: {}
				};
			}
			plannings[planning[p].user].regattas.push(entry);
			var sailor = null;
			if (planning[p].steuermann !== null) sailor = await dbGetData('sailors', planning[p].steuermann);
			if (sailor !== null) {
				if (!(sailor.id in plannings[planning[p].user].sailors)) plannings[planning[p].user].sailors[sailor.id] = sailor.name;
			}
			var crew = planning[p].crew.split(',');
			for (i in crew) {
				sailor = await dbGetData('sailors', crew[i]);
				if (sailor !== null) {
					if (!(sailor.id in plannings[planning[p].user].sailors)) plannings[planning[p].user].sailors[sailor.id] = sailor.name;
				}
			}
		}
	}
	plannings = Object.values(plannings);
	plannings.sort(function(a,b){
		return a.user.username.localeCompare(b.user.username);
	});

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

	var count = plannings.length;
	if (count > 0) {
		$('#input-search').parent().show();

		rows = [];

		for (id in plannings) {
			var entry = plannings[id];

			var row = { keywords: [], content: '' };
			row.keywords.push(entry.user.username);
			for (i in entry.sailors) {
				row.keywords.push(entry.sailors[i]);
			}

			row.content += '<div onclick="onUserClicked(' + entry.user.id + ');">';

			// ZEILE 1
			row.content += '<div></div>';

			// ZEILE 2
			row.content += '<div>';

			// Name
			row.content += '<div>' + entry.user.username + '</div>';

			// Count of regattas
			row.content += '<div>' + entry.regattas.length + ' Regatten</div>';

			row.content += '</div></div>';

			rows.push(row);
		}

		drawList();

	} else {
		$('#div-users').html('Es hat noch niemand eine Saison-Planung erstellt');
		$('#input-search').parent().hide();
	}

	hideLoader();
}
