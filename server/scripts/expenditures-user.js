let firstCall = true;
let rows = [];
let displayed = [];
let page = 1;
let pageCount = 0;
const showCount = 25;
let sumsDisplayed = true;

function createPurpose(exp) {
	let purpose = '';
	let extraText = ': ';
	switch (exp.purpose) {
		case 'transfer': purpose = 'Geldtransfer'; break;
		case 'entryfee': purpose = 'Meldegeld'; break;
		case 'camping': purpose = 'Camping'; break;
		case 'food': purpose = 'Essen'; break;
		case 'other': extraText = ''; break;
	}
	if (exp.purpose_text != '') {
		purpose += extraText + exp.purpose_text;
	}
	return purpose;
}

async function onListClicked(id) {
	let exp = await dbGetData('expenditures', id);
	console.log(exp);

	$('#menu-expenditure').find('.menu-title').find('p').text(createPurpose(exp) + ' (' + (exp.direction * exp.amount / 100).toFixed(2) + ' €)');

	if (exp.approved == 0 && (exp.direction < 0) == (exp.canceled == 0)) {
		$('#menu-item-approve').show();
		$('#menu-item-approve').attr('onclick', 'expenditureAction("approve", ' + exp['id'] + ', "' + (exp.canceled == 1 ? 'Stornierung' : 'Ausgabe') + ' genehmigt")');
		$('#menu-item-approve').text(exp.canceled == 1 ? 'Storno akzeptieren' : 'Akzeptieren');
		$('#menu-item-decline').show();
		$('#menu-item-decline').attr('onclick', 'expenditureAction("decline", ' + exp['id'] + ', "Ausgabe ' + (exp.canceled == 1 ? 'erneut angefragt' : 'abgelehnt') + '")');
		$('#menu-item-decline').text(exp.canceled == 1 ? 'Erneut anfragen' : 'Ablehnen');
	} else {
		$('#menu-item-approve').hide();
		$('#menu-item-decline').hide();
	}

	if (exp.canceled == 0 && (exp.approved == 1 || exp.direction > 0)) {
		$('#menu-item-cancel').show();
		$('#menu-item-cancel').attr('onclick', 'expenditureAction("cancel", ' + exp['id'] + ', "' + (exp.direction > 0 ? 'Ausgabe storniert' : 'Stornierung beantragt') + '")');
	} else {
		$('#menu-item-cancel').hide();
	}

	$('#menu-expenditure').showMenu();
	$('#menu-expenditure').scrollTop(0);
}

function expenditureAction(action, expId, successStr) {
	$('#menu-expenditure').hideMenu();
	showLoader();
	let auth = {
		id: localStorage.getItem('auth_id'),
		hash: localStorage.getItem('auth_hash')
	}
	$.ajax({
		url: QUERY_URL + 'expenditure_' + action,
		method: 'POST',
		data: {
			auth: auth,
			expenditure: expId
		},
		error: function (xhr, status, error) {
			if (xhr.status == 401) {
				log('authentification failed');
				toastError('Authentifizierung fehlgeschlagen. Versuche es erneut.');
			} else if (xhr.status == 0) {
				toastError('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um die Ausgabe zu stornieren.');
			} else {
				log('unbekannter Fehler', status, error);
				log(xhr);
				toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
			}
			hideLoader();
		},
		success: async function (data, status, xhr) {
			await sync();
			updateExpendituresBadge();
			hideLoader();
			toastOk(successStr);
		}
	});
}

function pageChange() {
	$('#p-count')[0].scrollIntoView({ behavior: "smooth" });
	drawList();
}

async function drawList() {
	window.setTimeout(function () {
		let list = '';

		if (displayed.length > 0) {
			let offset = (page - 1) * (sumsDisplayed ? showCount * 2 : showCount);
			let count = (page == pageCount ? (displayed.length - offset) : (sumsDisplayed ? showCount * 2 + 1 : showCount));

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
		sumsDisplayed = displayed.length == rows.length;
		$('#div-list').toggleClass('display-border', !sumsDisplayed);
		pageCount = Math.ceil((displayed.length - (sumsDisplayed ? 1 : 0)) / (sumsDisplayed ? showCount * 2 : showCount));
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

function cancelCause(cancel_cause) {
	switch (cancel_cause) {
		case 'not approved':
			return 'nicht genehmigt';
		case 'canceled':
			return 'storniert';
	}
	return 'unbekannter Grund';
}

let siteScript = async function() {
	if (!isLoggedIn()) {
		hideLoader();
		return;
	}

	userid = findGetParameter('user');
	let user = null;
	if (userid !== null) {
		user = await dbGetData('users', userid);
	}
	if (user === null) {
		location.href = LINK_PRE + 'expenditures';
		return;
	}

	$('#p-username').text(user.username);
	$('.span-username').text(user.username);

	if (firstCall) {
		firstCall = false;
		initPagination();
		$('#input-search').on('input', reSearch);
		$('#button-add').click((e) => expendituresShowAdd(userid));
		$('#button-add-transfer').click((e) => expendituresShowAddTransfer(userid));
		expendituresInitModals();
	}

	let exps = await dbGetDataIndex('expenditures', 'user', user.id);
	exps.sort(function (a, b) {
		return a.created - b.created;
	});

	let sum = 0;
	for (i in exps) {
		let exp = exps[i];
		if (exp.canceled == 0) {
			sum += exp.direction * exp.amount;
		}
		exps[i].sum = sum;
		exps[i].purpose_html = createPurpose(exp);
		exps[i].purpose_date = formatDate("d.m.Y", parseDate(exp.purpose_date));
	}

	let sumText = '';
	if (sum == 0) sumText = 'Du und ' + user.username + ' seid quitt.';
	else if (sum > 0) sumText = user.username + ' schuldet Dir noch ' + (sum / 100).toFixed(2) + ' €.'; // TODO: Ausgleichen Button?
	else sumText = 'Du schuldest ' + user.username + ' noch ' + (-sum / 100).toFixed(2) + ' €.'; // TODO: Ausgleichen Button?

	results = exps.reverse();

	// TODO: open approvals

	let count = results.length;
	if (count > 0) {
		$('#p-count').text(sumText);
		$('#div-list').show();
		$('#input-search').parent().show();

		rows = [];

		for (id in results) {
			let entry = results[id];

			let rowSum = { keywords: [], content: '' };

			rowSum.content += '<div class="sum">';

			// ZEILE SUM
			rowSum.content += '<div>';

			// sum
			rowSum.content += '<div>';
			if (entry.sum < 0) rowSum.content += '<font style="color:red;">';
			rowSum.content += (entry.sum / 100).toFixed(2);
			if (entry.sum < 0) rowSum.content += '</font>';
			rowSum.content += ' €</div>';

			rowSum.content += '</div></div>';

			rows.push(rowSum);


			let row = { keywords: [], content: '' };

			row.keywords.push((entry.amount / 100).toFixed(2));
			row.keywords.push(entry.purpose_html);
			row.keywords.push(entry.purpose_date);
			row.keywords.push(entry.regatta_name);

			row.content += '<div onclick="onListClicked(' + entry.id + ');" style="';
			if (entry.canceled == 1) {
				row.content += 'opacity:0.5;';
			}
			if (entry.approved == 0) {
				row.content += 'font-style:italic;';
			}
			row.content += '">';

			// ZEILE 1
			row.content += '<div>';

			// purpose
			row.content += '<div' + ((entry.canceled == 1) ? ' style="text-decoration: line-through;"' : '') + '>' + entry.purpose_html + '</div>';

			// amount
			row.content += '<div>';
			if (entry.canceled == 1) row.content += '(';
			if (entry.direction < 0) row.content += '<font style="color:red;">';
			row.content += (entry.direction * entry.amount / 100).toFixed(2);
			if (entry.direction < 0) row.content += '</font>';
			if (entry.canceled == 1) row.content += ')';
			row.content += ' €</div>';

			// icons
			if (entry.approved == 1) {
				if (entry.canceled == 1) {
					row.content += '<div><i class="fas fa-times"></i></div>';
				} else {
					row.content += '<div><i class="fas fa-check"></i></div>';
				}
			} else if ((entry.direction < 0) == (entry.canceled == 1)) {
				row.content += '<div><i class="fas fa-hourglass-half"></i></div>';
			} else {
				row.content += '<div><i class="fas fa-exclamation fa-blink"></i></div>';
			}

			row.content += '</div>';

			// ZEILE 2
			row.content += '<div>';

			// date
			row.content += '<div>' + entry.purpose_date + '</div>';

			// regatta
			row.content += '<div>' + entry.regatta_name + '</div>';

			// cancel_cause
			row.content += '<div>' + (entry.canceled == 1 ? cancelCause(entry.cancel_cause) : '') + '</div>';

			row.content += '</div></div>';

			rows.push(row);
		}

		let rowSum = { keywords: [], content: '' };

		rowSum.content += '<div class="sum">';

		// ZEILE SUM
		rowSum.content += '<div>';

		// sum
		rowSum.content += '<div>';
		rowSum.content += (0).toFixed(2);
		rowSum.content += ' €</div>';

		rowSum.content += '</div></div>';

		rows.push(rowSum);

		reSearch();

	} else {
		$('#p-count').html('Keine Ausgaben gefunden!');
		$('#div-list').hide();
		$('#input-search').parent().hide();
	}

	hideLoader();
}
