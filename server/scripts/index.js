var firstCall = true;
var today;
var onUpdatePushBadge;

var onUnfollowClicked = async function() {
	var id = $('#menu-item-unfollow').attr('data-sailor-id');
	showLoader();
	$('#menu-favorite').hideMenu();
	var auth = {
		id: localStorage.getItem('auth_id'),
		hash: localStorage.getItem('auth_hash')
	}
	$.ajax({
		url: QUERY_URL + 'sailor_unfollow',
		method: 'POST',
		data: {
			auth: auth,
			sailor: id
		},
		error: function (xhr, status, error) {
			if (xhr.status == 0) {
				toastError('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um Deine Favoriten zu bearbeiten.');
			} else {
				log('Unfollow: unbekannter Fehler', status, error);
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

var onFavoriteClicked = async function(id) {
	var sailor = await dbGetData('sailors', id);

	$('#menu-favorite').find('.menu-title').find('p').text(sailor.name);

	$('#menu-item-unfollow').attr('data-sailor-id', sailor.id);

	$('#menu-favorite').showMenu();
}

var siteScript = async function() {
	today = getToday();

	if (firstCall) {
		firstCall = false;
		$('#button-notifications-activate').click(function(){
			pushesOpenMenu();
		});
		$('#a-notifications-later').click(function(){
			createCookie('regatten_app_' + BOATCLASS + '_rejected_push', true, 1);
			$('#card-notifications').hide();
		});
		if (readCookie('regatten_app_' + BOATCLASS + '_rejected_push')) {
			$('#card-notifications').hide();
		} else {
			onUpdatePushBadge = function () {
				if (!pushesPossible || (Notification.permission == 'denied')) {
					$('#card-notifications').hide();
				} else {
					swRegistration.pushManager.getSubscription().then(function(subscription) {
						var isSub = (subscription !== null);
						if (isSub) {
							$('#card-notifications').hide();
						} else {
							$('#card-notifications').show();
						}
					});
				}
			}
			onUpdatePushBadge();
		}
		$('#menu-item-unfollow').click(onUnfollowClicked);
	}

	if (isLoggedIn()) {
		$('#card-notloggedin').hide();

		var user = await dbGetData('users', localStorage.getItem('auth_user'));

		// Favorites
		var watched = [];
		for (var i = 1; i <= 5; i ++) {
			sailor_id = user['sailor' + i];
			if (sailor_id != null) {
				watched.push(await dbGetData('sailors', sailor_id));
			}
		}
		if (watched.length > 0) {
			var year = (new Date()).getFullYear();
			var ranking = (await dbGetRanking(parseDate('01.12.' + (year - 1)), parseDate('30.11.' + year), false, false))[0];
			var list = '';
			for (i in watched) {
				sailor = watched[i];
				var club = null;
				if (sailor.club != null)
					club = await dbGetData('clubs', sailor.club);
				var rank = null;
				for (r in ranking) {
					if (ranking[r].id == sailor.id) {
						rank = ranking[r];
						break;
					}
				}

				list += '<div onclick="onFavoriteClicked(' + sailor.id + ');">';
				list += '<div>';
				// Name
				list += '<div><b>' + sailor.name + '</b></div>';
				list += '</div><div>';
				if (rank == null) {
					list += '<div>Nicht in der Rangliste</div>';
				} else {
					// Rank
					list += '<div>Platz <b>' + rank.rank + '</b></div>';
					// rlp
					list += '<div>' + rank.rlp.toFixed(3) + ' Punkte</div>';
				}
				list += '</div></div>';
			}
			$('#div-favorites').html(list);
			$('#p-favorites').hide();
			$('#div-favorites').show();
		} else {
			$('#div-favorites').hide();
			$('#p-favorites').show();
		}
		$('#card-favorites').show();

		// Your next
		var planningsDB = await dbGetDataIndex('plannings', 'user', user.id);
		var minDate = getToday();
		minDate.setDate(minDate.getDate());
		var maxDate = getToday();
		maxDate.setDate(maxDate.getDate() + 28);
		var regattas = await dbGetRegattasRange(minDate, maxDate);
		var plannings = [];
		for (i = planningsDB.length - 1; i >= 0; i --) {
			var planning = planningsDB[i];
			for (j in regattas) {
				var regatta = regattas[j];
				if ((regatta.id == planning.regatta) && (regatta.length > 0)) {
					planning.regatta = regatta;
					plannings.push(planning);
				}
			}
		}
		plannings.sort(function (a, b) {
			if (a.regatta.date < b.regatta.date) return -1;
			if (a.regatta.date > b.regatta.date) return 1;
			return 0;
		});
		if (plannings.length > 0) {
			list = '';
			for (i in plannings) {
				var planning = plannings[i];
				var regatta = planning.regatta;

				var club = null;
				if (regatta['club'] != null)
					club = await dbGetData('clubs', regatta['club']);
				var dateFrom = regatta['dateFrom'];
				var dateTo = regatta['dateTo'];

				// output

				list += '<div onclick="onRegattaClicked(' + regatta['id'] + ');">';

				// ZEILE 1
				// Name
				list += '<div><b>' + (regatta['canceled'] == 1 ? '<s>' : '') + regatta['name'] + (regatta['canceled'] == 1 ? '</s>' : '') + '</b></div>';

				// ZEILE 2
				list += '<div>';

				// Number
				list += '<div>' + ((regatta['number'] != null) ? ('# ' + regatta['number']) : '') + '</div>';

				// Club
				list += '<div>' + ((club != null) ? club['kurz'] : '') + '</div>';

				// Special
				if (regatta.special.substr(0, 1) == '#') {
					regatta.special = '* ' + regatta.special.substr(1);
				}
				// replace placeholders
				var pos;
				while ((pos = regatta.special.indexOf('$')) >= 0) {
					var pos2 = regatta.special.indexOf('$', pos + 1);
					if (pos2 < 0) break;
					var key = regatta.special.substring(pos + 1, pos2);

					var value = '';
					// age class
					if ((key.substr(0, 1) == 'U') && (!isNaN(value = parseInt(key.substr(1))))) {
						value = 'U-' + value;
					} else {
						break;
					}

					regatta.special = regatta.special.replace('$' + key + '$', value);
				}
				list += '<div>' + regatta['special'] + '</div>';

				// Icons
				var icons = [];
				if (regatta['info'] != '')
					icons.push('<i class="fas fa-info"></i>');
				if ((regatta['meldung'] != '') && (dateTo >= today) && (regatta['meldungOffen'] == '1')) {
					var color = '';
					if (regatta['meldungSchluss'] != null) {
						if (planning['gemeldet'] == '0') {
							var ms = 0;
							if (regatta['meldungEarly'] != null) {
								ms = parseDate(regatta['meldungEarly']);
							}
							if (ms < today) {
								ms = parseDate(regatta['meldungSchluss']);
							}
							var diff = Math.round((ms - today) / 86400000);
							if (ms < today) {
								color = ' color-red2-dark';
							} else if (diff < 7) {
								color = ' color-yellow2-dark';
							}
						}
					}
					if (planning['gemeldet'] == '0') {
						color += ' fa-blink';
					}
					icons.push('<i class="fas fa-file-signature' + color + '"></i>');
				}
				if (regatta['canceled'] == '1') {
					icons.push('<i class="fas fa-times color-red2-dark"></i>');
				}
				list += '<div class="color-green2-dark">' + icons.join('&ensp;') + '</div>';

				list += '</div>';

				// ZEILE 3
				list += '<div>';

				// Date
				list += '<div>' + formatDate("d.m.Y", dateFrom) + ' - ' + formatDate("d.m.Y", dateTo) + '</div>';

				// RLF
				list += '<div>' + parseFloat(regatta['rlf']).toFixed(2) + '</div>';

				list += '</div></div>';
			}
			$('#div-yournext').html(list);
			$('#p-yournext').hide();
			$('#div-yournext').show();
		} else {
			$('#div-yournext').hide();
			$('#p-yournext').show();
		}
		$('#card-yournext').show();
	} else {
		$('#card-favorites').hide();
		$('#card-yournext').hide();
		$('#card-notloggedin').show();
	}

	// Next
	var minDate = getToday();
	minDate.setDate(minDate.getDate());
	var maxDate = getToday();
	maxDate.setDate(maxDate.getDate() + 14);
	var regattas = await dbGetRegattasRange(minDate, maxDate);
	i = 0;
	while (i < regattas.length) {
		if (regattas[i].length < 1) {
			regattas.splice(i, 1);
		} else {
			i ++;
		}
	}
	if (regattas.length > 0) {
		list = '';
		for (i in regattas) {
			var regatta = regattas[i];

			var club = null;
			if (regatta['club'] != null)
				club = await dbGetData('clubs', regatta['club']);
			var plannings = await dbGetDataIndex('plannings', 'regatta', regatta['id']);
			var dateFrom = regatta['dateFrom'];
			var dateTo = regatta['dateTo'];

			// output
			list += '<div onclick="onRegattaClicked(' + regatta['id'] + ');">';

			// ZEILE 1
			// Name
			list += '<div><b>' + (regatta['canceled'] == 1 ? '<s>' : '') + regatta['name'] + (regatta['canceled'] == 1 ? '</s>' : '') + '</b></div>';

			// ZEILE 2
			list += '<div>';

			// Number
			list += '<div>' + ((regatta['number'] != null) ? ('# ' + regatta['number']) : '') + '</div>';

			// Club
			list += '<div>' + ((club != null) ? club['kurz'] : '') + '</div>';

			// Special
			if (regatta.special.substr(0, 1) == '#') {
				regatta.special = '* ' + regatta.special.substr(1);
			}
			// replace placeholders
			var pos;
			while ((pos = regatta.special.indexOf('$')) >= 0) {
				var pos2 = regatta.special.indexOf('$', pos + 1);
				if (pos2 < 0) break;
				var key = regatta.special.substring(pos + 1, pos2);

				var value = '';
				// age class
				if ((key.substr(0, 1) == 'U') && (!isNaN(value = parseInt(key.substr(1))))) {
					value = 'U-' + value;
				} else {
					break;
				}

				regatta.special = regatta.special.replace('$' + key + '$', value);
			}
			list += '<div>' + regatta['special'] + '</div>';

			// Icons
			var icons = [];
			if (regatta['info'] != '')
				icons.push('<i class="fas fa-info"></i>');
			if ((regatta['meldung'] != '') && (dateTo >= today) && (regatta['meldungOffen'] == '1')) {
				var color = '';
				var planning = null;
				if (isLoggedIn()) {
					var plannings = await dbGetDataIndex('plannings', 'regatta', regatta['id']);
					for (id in plannings) {
						if (plannings[id]['user'] == USER_ID) {
							planning = plannings[id];
							break;
						}
					}
				}
				if (regatta['meldungSchluss'] != null) {
					if ((planning == null) || (planning['gemeldet'] == '0')) {
						var ms = 0;
						if (regatta['meldungEarly'] != null) {
							ms = parseDate(regatta['meldungEarly']);
						}
						if (ms < today) {
							ms = parseDate(regatta['meldungSchluss']);
						}
						var diff = Math.round((ms - today) / 86400000);
						if (ms < today) {
							color = ' color-red2-dark';
						} else if (diff < 7) {
							color = ' color-yellow2-dark';
						}
					}
				}
				if ((planning != null) && (planning['gemeldet'] == '0')) {
					color += ' fa-blink';
				}
				icons.push('<i class="fas fa-file-signature' + color + '"></i>');
			}
			if (regatta['canceled'] == '1') {
				icons.push('<i class="fas fa-times color-red2-dark"></i>');
			}
			list += '<div class="color-green2-dark">' + icons.join('&ensp;') + '</div>';

			list += '</div>';

			// ZEILE 3
			list += '<div>';

			// Date
			list += '<div>' + formatDate("d.m.Y", dateFrom) + ' - ' + formatDate("d.m.Y", dateTo) + '</div>';

			// RLF
			list += '<div>' + parseFloat(regatta['rlf']).toFixed(2) + '</div>';

			list += '</div></div>';
		}
		$('#div-next').html(list);
		$('#p-next').hide();
		$('#div-next').show();
	} else {
		$('#div-next').hide();
		$('#p-next').show();
	}

	// Last
	var minDate = getToday();
	minDate.setDate(minDate.getDate() - 14);
	var maxDate = getToday();
	maxDate.setDate(maxDate.getDate() - 1);
	var regattas = await dbGetRegattasRange(minDate, maxDate);
	i = 0;
	while (i < regattas.length) {
		if (regattas[i].length < 1) {
			regattas.splice(i, 1);
		} else {
			i ++;
		}
	}
	regattas.sort(function(a,b){
		return b.date.localeCompare(a.date);
	});
	if (regattas.length > 0) {
		list = '';
		for (i in regattas) {
			var regatta = regattas[i];

			var club = null;
			if (regatta['club'] != null)
				club = await dbGetData('clubs', regatta['club']);
			var dateFrom = regatta['dateFrom'];
			var dateTo = regatta['dateTo'];

			// output

			list += '<div onclick="onRegattaClicked(' + regatta['id'] + ');">';

			// ZEILE 1
			// Name
			list += '<div><b>' + (regatta['canceled'] == 1 ? '<s>' : '') + regatta['name'] + (regatta['canceled'] == 1 ? '</s>' : '') + '</b></div>';

			// ZEILE 2
			list += '<div>';

			// Number
			list += '<div>' + ((regatta['number'] != null) ? ('# ' + regatta['number']) : '') + '</div>';

			// Club
			list += '<div>' + ((club != null) ? club['kurz'] : '') + '</div>';

			// Special
			if (regatta.special.substr(0, 1) == '#') {
				regatta.special = '* ' + regatta.special.substr(1);
			}
			// replace placeholders
			var pos;
			while ((pos = regatta.special.indexOf('$')) >= 0) {
				var pos2 = regatta.special.indexOf('$', pos + 1);
				if (pos2 < 0) break;
				var key = regatta.special.substring(pos + 1, pos2);

				var value = '';
				// age class
				if ((key.substr(0, 1) == 'U') && (!isNaN(value = parseInt(key.substr(1))))) {
					value = 'U-' + value;
				} else {
					break;
				}

				regatta.special = regatta.special.replace('$' + key + '$', value);
			}
			list += '<div>' + regatta['special'] + '</div>';

			// Icons
			var icons = [];
			if (regatta['info'] != '')
				icons.push('<i class="fas fa-info"></i>');
			if (regatta['bericht'] != '')
				icons.push('<i class="fas fa-book"></i>');
			if (regatta['canceled'] == '1') {
				icons.push('<i class="fas fa-times color-red2-dark"></i>');
			} else if (regatta['results'] == '1') {
				icons.push('<i class="fas fa-poll"></i>');
			}
			list += '<div class="color-green2-dark">' + icons.join('&ensp;') + '</div>';

			list += '</div>';

			// ZEILE 3
			list += '<div>';

			// Date
			list += '<div>' + formatDate("d.m.Y", dateFrom) + ' - ' + formatDate("d.m.Y", dateTo) + '</div>';

			// RLF
			list += '<div>' + parseFloat(regatta['rlf']).toFixed(2) + '</div>';

			list += '</div></div>';
		}
		$('#div-last').html(list);
		$('#p-last').hide();
		$('#div-last').show();
	} else {
		$('#div-last').hide();
		$('#p-last').show();
	}

	hideLoader();
}
