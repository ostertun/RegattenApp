const DB_VERSION = 8;

const USER_ID = localStorage.getItem('auth_user');
const USER_NAME = localStorage.getItem('auth_username');

var canUseLocalDB = false;
var syncTimer = null;
var updateSyncStatusTimer;
var syncInProgress = 0;
var db;
var user = null;

var getJSON = function(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhr.responseType = 'json';
	xhr.timeout = 60000;
	xhr.onload = function() {
		callback(xhr.status, xhr.response);
	};
	xhr.ontimeout = function () {
		log("[db] getJSON: timeout");
		callback(0, null);
	}
	xhr.onerror = function () {
		log("[db] getJSON: error");
		callback(0, null);
	}
	if (USER_ID != null) {
		authString = 'auth[id]=' + localStorage.getItem('auth_id');
		authString += '&auth[hash]=' + encodeURIComponent(localStorage.getItem('auth_hash'));
		xhr.send(authString);
	} else {
		xhr.send();
	}
};

function isLoggedIn() {
	return USER_ID !== null;
}

function search(string, fields) {
	var keywords = string.split(' ');
	for (kid in keywords) {
		var keyword = keywords[kid].toLowerCase();
		var found = false;
		for (fid in fields) {
			var field = fields[fid].toLowerCase();
			if (field.indexOf(keyword) >= 0) {
				found = true;
				break;
			}
		}
		if (!found) return false;
	}
	return true;
}

function dbGetData(table, id = null) {
	return new Promise(function(resolve) {
		if (canUseLocalDB) {
			if (id == null) {
				db.transaction(table).objectStore(table).getAll().onsuccess = function (event) {
					resolve(event.target.result);
				};
			} else {
				var request = db.transaction(table).objectStore(table).get(id.toString());
				request.onsuccess = function (event) {
					resolve(typeof request.result != 'undefined' ? request.result : null);
				}
			}
		} else {
			if (id == null) {
				getJSON(QUERY_URL + 'get_' + table, function (code, data) {
					if (code == 200) {
						resolve(data.data);
					} else {
						log("[db] Something went wrong (HTTP " + code + ")");
						fail(strings.error_network, 5000);
						resolve([]);
					}
				});
			} else {
				getJSON(QUERY_URL + 'get_' + table.substr(0, table.length - 1) + '?id=' + id, function (code, data) {
					if (code == 200) {
						resolve(data.data);
					} else {
						log("[db] Something went wrong (HTTP " + code + ")");
						fail(strings.error_network, 5000);
						resolve(null);
					}
				});
			}
		}
	});
}

function dbGetDataIndex(table, indexName, value) {
	return new Promise(function(resolve) {
		if (canUseLocalDB) {
			var request = db.transaction(table).objectStore(table).index(indexName).getAll(IDBKeyRange.only(value.toString()));
			request.onsuccess = function (event) {
				resolve(request.result);
			}
		} else {
			getJSON(QUERY_URL + 'get_' + table + '?index=' + indexName + '&value=' + value, function (code, data) {
				if (code == 200) {
					resolve(data.data);
				} else {
					log("[db] Something went wrong (HTTP " + code + ")");
					fail(strings.error_network, 5000);
					resolve([]);
				}
			});
		}
	});
}

function dbGetRegattasRange(minDate, maxDate) {
	return new Promise(async function(resolve) {
		var regattas = await dbGetData('regattas');
		var result = [];
		for (id in regattas) {
			var regatta = regattas[id];
			var dateFrom = parseDate(regatta['date']);
			var dateTo = parseDate(regatta['date']);
			dateTo.setDate(dateTo.getDate() + Math.max(parseInt(regatta['length']) - 1, 0));
			if ((minDate <= dateTo) && (maxDate >= dateFrom)) {
				regatta['dateFrom'] = dateFrom;
				regatta['dateTo'] = dateTo;
				result.push(regatta);
			}
		}
		result.sort(function (a, b) {
			if (a['date'] < b['date']) return -1;
			if (a['date'] > b['date']) return 1;
			return 0;
		});
		resolve(result);
	});
}

var compareResultsRaceCount;
function compareResults (a, b) {
	if (a['netto'] != b['netto']) return (a['netto'] < b['netto']) ? -1 : 1;
	var tempA = [...a['values']];
	tempA.sort(function(a,b){return a-b;});
	var tempB = [...b['values']];
	tempB.sort(function(a,b){return a-b;});
	for (var i = 0; i < compareResultsRaceCount; i ++) {
		if (tempA[i] != tempB[i]) return (tempA[i] < tempB[i]) ? -1 : 1;
	}
	for (var i = compareResultsRaceCount - 1; i >= 0; i --) {
		if (a['values_all'][i] != b['values_all'][i]) return (a['values_all'][i] < b['values_all'][i]) ? -1 : 1;
	}
	return 0;
}

function dbGetResultCalculated(regatta) {
	return new Promise(async function(resolve) {
		var results = await dbGetDataIndex('results', 'regatta', regatta.id);
		if (results.length > 0) {

			var gemeldet = results.length;

			for (id in results) {
				results[id]['finished'] = false;
				results[id]['values'] = [];
				results[id]['values_all'] = [];
				results[id]['texts'] = [];
				var copy = [];

				for (var i = 0; i < regatta['races']; i ++) {
					var race = results[id]['race' + (i + 1)].replace(',', '.');

					if (!isNaN(race)) {
						copy[i] = results[id]['values'][i] = parseFloat(race);
						results[id]['texts'][i] = race;
						results[id]['finished'] = true;
					} else {
						switch (race.toUpperCase()) {
							// Nicht gestartet
							case 'DNC': results[id]['values'][i] = gemeldet + 1; copy[i] = gemeldet + 1; break; // Did not come
							case 'DNS': results[id]['values'][i] = gemeldet + 1; copy[i] = gemeldet + 1; break; // Did not started
							// Startfehler
							case 'OCS': results[id]['values'][i] = gemeldet + 1; copy[i] = gemeldet + 1; break; // On course site
							case 'UFD': results[id]['values'][i] = gemeldet + 1; copy[i] = gemeldet + 1; break; // Uniform Flag Disqualified (disqu. nach 30.3)
							case 'BFD': results[id]['values'][i] = gemeldet + 1; copy[i] = gemeldet + 1; break; // Black Flag Disqualified (disqu. nach 30.4)
							// Nicht durch Ziel gegangen
							case 'DNF': results[id]['values'][i] = gemeldet + 1; copy[i] = gemeldet + 1; break; // Did not finish
							case 'RET': results[id]['values'][i] = gemeldet + 1; copy[i] = gemeldet + 1; break; // Retired (Aufgegeben)
							case 'RAF': results[id]['values'][i] = gemeldet + 1; copy[i] = gemeldet + 1; break; // Retired after finish
							// Kursfehler
							case 'NSC': results[id]['values'][i] = gemeldet + 1; copy[i] = gemeldet + 1; break; // Not sailed course
							// Disqualifizierun
							case 'DSQ': results[id]['values'][i] = gemeldet + 1; copy[i] = gemeldet + 1; break; // Disqualified
							case 'DNE': results[id]['values'][i] = gemeldet + 1; copy[i] = -1; break; // Disqualified, not excludable (disqu. kann nach 90.3(b) nicht gestrichen werden)
							case 'DGM': results[id]['values'][i] = gemeldet + 1; copy[i] = -2; break; // Disqualification Gross Missconduct (kann nach 69.1(b)(2) nicht gestr. werden, grobes Fehlverhalten)
							// Unbekannt
							default: results[id]['values'][i] = 0; copy[i] = 0; break;
						}

						if (results[id]['values'][i] != 0) {
							results[id]['texts'][i] = race + ' (' + results[id]['values'][i] + ')';
						} else {
							results[id]['texts'][i] = race + ' (Unknown - 0)';
						}
					}
				}

				results[id]['values_all'] = [...results[id]['values']];
				for (var s = 0; s < regatta['streicher']; s ++) {
					var max = Math.max(...copy);
					for (var i = 0; i < regatta['races']; i ++) {
						if (copy[i] == max) {
							copy[i] = 0;
							break;
						}
					}
				}

				var brutto = 0;
				var netto = 0;
				for (var i = 0; i < regatta['races']; i ++) {
					brutto += results[id]['values_all'][i];
					if      (copy[i] == -1) { results[id]['values'][i] = gemeldet + 1; }
					else if (copy[i] == -2) { results[id]['values'][i] = gemeldet + 1; }
					else                    { results[id]['values'][i] = copy[i]; }
					if (results[id]['values'][i] == 0) {
						results[id]['texts'][i] = '[' + results[id]['texts'][i] + ']';
					}
					netto += results[id]['values'][i];
				}
				results[id]['brutto'] = brutto;
				results[id]['netto'] = netto;
			}

			compareResultsRaceCount = regatta['races'];

			results.sort(compareResults);

			var place = 1;
			for (id in results) {
				if ((id > 0) && (compareResults(results[id], results[id - 1]) == 0)) {
					results[id]['place'] = results[id - 1]['place'];
				} else {
					results[id]['place'] = place;
				}
				place ++;
			}

			resolve(results);

		} else {
			resolve([]);
		}
	});
}

function dbGetRanking(minDate, maxDate, maxAge, ageStrict, altM = 9, ageCrew = false, personMode = 0) {
	return new Promise(async function(resolve) {
		var rankNoResults = [];

		// TODO: remove / Abwärtskompatibilität
		//if (maxAge === true) maxAge = await dbGetClassProp('youth-age');

		var sailors = await dbGetData('sailors');
		var regattas = await dbGetRegattasRange(minDate, maxDate);

		var sailorIds = {};
		for (s in sailors) {
			sailorIds[sailors[s].id] = s;
		}

		for (var i in sailors) {
			sailors[i].regattas = {};
			sailors[i].tmp_rlp = [];
		}

		for (var i in regattas) {
			var regatta = regattas[i];
			var date = parseDate(regatta.date);

			// regatta has to be min. 2 days to be ranking regatta
			if (regatta.length < 2) continue;

			// regatta has to have rlf
			if (regatta.rlf == 0) continue;

			// get results
			var results = await dbGetDataIndex('results', 'regatta', regatta.id);
			if (results.length <= 0) {
				if (regatta.dateTo <= getToday()) {
					if (regatta.canceled == '0') {
						rankNoResults.push(regatta);
					}
				}
				continue;
			}

			// in one race there must be at least 10 boats started
			var ok = false;
			for (var j = 1; j <= regatta.races; j ++) {
				var temp = 0;
				for (var r in results) {
					if ((results[r]['race' + j] != 'DNC') && (results[r]['race' + j] != 'DNS')) {
						temp ++;
					}
				}
				if (temp >= 10) {
					ok = true;
					break;
				}
			}
			if (!ok) continue;

			var fb = regatta.finishedBoats;

			// calc m
			var m;
			if (regatta.m > 0) {
				m = regatta.m;
			} else if (regatta.races <= 4) {
				m = regatta.races;
			} else {
				if ((regatta.length > 2) && (regatta.races >= 6)) {
					m = 5;
				} else {
					m = 4;
				}
			}

			// add regatta to each sailor
			for (var r in results) {
				var result = results[r];

				if (result.rlp == 0) continue;

				// check if crew is youth
				if ((maxAge != false) && ageCrew) {
					var crew = result.crew.split(',');
					crew.push(result.steuermann);
					var okay = true;
					for (var ci in crew) {
						var c = crew[ci];
						if ((c == '') || !(c in sailorIds)) continue;
						var sailor = sailors[sailorIds[c]];
						if (((sailor.year != null) && (sailor.year < (formatDate('Y', date) - maxAge))) ||
							((sailor.year == null) && (ageStrict))) {
								okay = false;
								break;
						}
					}
					if (!okay) continue;
				}

				if (personMode == 0 || personMode == 2) { // add to helmsman
					sailors[sailorIds[result.steuermann]].regattas[regatta.id] = {
						regatta: regatta.id,
						boat: result.boat,
						helm: result.steuermann,
						crew: result.crew,
						place: result.place,
						fb: fb,
						rlp: result.rlp,
						used: 0,
						m: m
					};
					for (var j = 0; j < m; j ++) {
						sailors[sailorIds[result.steuermann]].tmp_rlp.push([regatta.id, result.rlp]);
					}
				}
				if (personMode == 1 || personMode == 2) { // add to crew
					var crew = result.crew.split(',');
					for (var ci in crew) {
						var c = crew[ci];
						if ((c == '') || !(c in sailorIds)) continue;
						sailors[sailorIds[c]].regattas[regatta.id] = {
							regatta: regatta.id,
							boat: result.boat,
							helm: result.steuermann,
							crew: result.crew,
							place: result.place,
							fb: fb,
							rlp: result.rlp,
							used: 0,
							m: m
						};
						for (var j = 0; j < m; j ++) {
							sailors[sailorIds[c]].tmp_rlp.push([regatta.id, result.rlp]);
						}
					}
				}
			}
		}

		// remove not german or not youth sailors
		for (var i = sailors.length - 1; i >= 0; i --) {
			if (sailors[i].german == '0') {
				sailors.splice(i, 1);
			} else if (maxAge != false) {
				if (((sailors[i].year != null) && (sailors[i].year < (formatDate('Y', maxDate) - maxAge))) ||
					((sailors[i].year == null) && (ageStrict))) {
						sailors.splice(i, 1);
				}
			}
		}

		for (var i = sailors.length - 1; i >= 0; i --) {
			// sort rlps desc
			sailors[i].tmp_rlp.sort(function (a,b) {
				return b[1] - a[1];
			});

			// calc mean rlp
			var sum = 0;
			var cnt = 0;
			for (var t in sailors[i].tmp_rlp) {
				var r = sailors[i].tmp_rlp[t];
				sum += parseFloat(r[1]);
				sailors[i].regattas[r[0]].used ++;
				cnt ++;
				if (cnt >= altM) break;
			}
			delete sailors[i].tmp_rlp;
			if (cnt > 0) {
				var rlp = sum / cnt;
				sailors[i].rlp = rlp;
				sailors[i].m = cnt;
			} else {
				sailors.splice(i, 1);
			}
		}

		sailors.sort(function (a,b) {
			if (a.m != b.m) return b.m - a.m;
			return b.rlp - a.rlp;
		});

		var lastPoints = 0;
		var lastRank = 1;
		for (var i = 0; i < sailors.length; i ++) {
			if (lastPoints == sailors[i].rlp) {
				sailors[i].rank = lastRank;
			} else {
				sailors[i].rank = (i + 1);
				lastRank = (i + 1);
				lastPoints = sailors[i].rlp;
			}
		}

		resolve([sailors, rankNoResults]);
	});
}

function dbGetCurrentYear() {
	return new Promise(async function (resolve) {
		var date = new Date();
		var year = date.getFullYear();
		if (date.getMonth() == 11) {
			year ++; // In DECEMBER show next year
		} else {
			// if there are no more regattas until end of the year, show next year
			var regattas = dbGetRegattasRange(parseDate(date.getDate() + '.' + (date.getMonth() + 1) + '.' + year), parseDate('31.12.' + year));
			if (regattas.length == 0) {
				year ++;
			}
		}
		var years = await dbGetData('years');
		years.sort(function (a, b) {
			if (a['year'] > b['year']) return -1;
			if (a['year'] < b['year']) return 1;
			return 0;
		});
		for (id in years) {
			if (years[id].year < year) year = years[id].year;
			if (years[id].year == year) break;
		}
		resolve(year);
	});
}

function dbSettingsGet(key) {
	return new Promise(function(resolve) {
		if (canUseLocalDB) {
			var request = db.transaction('settings').objectStore('settings').get(key);
			request.onsuccess = function (event) {
				resolve(typeof request.result != 'undefined' ? request.result.value : null);
			}
		} else {
			resolve(null);
		}
	});
}

function dbSettingsSet(key, value) {
	if (canUseLocalDB) {
		var os = db.transaction('settings', 'readwrite').objectStore('settings');
		os.put({ key: key, value: value});
	}
}

function dbGetClassProp(key) {
	return new Promise(function(resolve) {
		if (canUseLocalDB) {
			var request = db.transaction('class').objectStore('class').get(key);
			request.onsuccess = function (event) {
				resolve(typeof request.result != 'undefined' ? request.result.value : null);
			}
		} else {
			getJSON(QUERY_URL + 'get_class_prop?key=' + key, function (code, data) {
				if (code == 200) {
					resolve(data.value);
				} else {
					log("[db] Something went wrong (HTTP " + code + ")");
					fail(strings.error_network, 5000);
					resolve(null);
				}
			});
		}
	});
}

async function updateSyncStatus() {
	var lastSync = await dbGetData('update_times', 'last_sync');
	lastSync = new Date(lastSync.time * 1000);
	if (lastSync > 0) {
		var now = new Date();
		var diff = Math.round((now - lastSync) / 1000);
		var txt = '';

		if (diff < 30) {  // 30 sec
			txt = 'jetzt';
		} else if (diff < 3600) {  // 60 min
			diff = Math.round(diff / 60);
			txt = 'vor ' + diff + ' ' + (diff == 1 ? 'Minute' : 'Minuten');
		} else if (diff < 86400) {  // 24 std
			diff = Math.round(diff / 3600);
			txt = 'vor ' + diff + ' ' + (diff == 1 ? 'Stunde' : 'Stunden');
		} else {
			diff = Math.round(diff / 86400);
			txt = 'vor ' + diff + ' ' + (diff == 1 ? 'Tag' : 'Tagen');
		}
	} else {
		var txt = 'nie';
	}

	$('#syncstatus').html('Zuletzt aktualisiert: ' + txt);
}

async function runPageScript() {
	log('[db] running page script...')
	if (canUseLocalDB) {
		var osUpdateTimes = db.transaction('update_times').objectStore('update_times');
		osUpdateTimes.get('loggedin').onsuccess = function (event) {
			var status = event.target.result.status;
			if (status != isLoggedIn()) {
				resetDb();
				location.reload();
			}
		};
		updateSyncStatus();

		if (isLoggedIn()) {
			var plannings = await dbGetDataIndex('plannings', 'user', USER_ID);
			plannings_all = plannings.map(function (e) { return e.regatta; });
			dbSettingsSet('myregattas_' + BOATCLASS, plannings_all);
			for (var i = plannings.length - 1; i >= 0; i --) {
				if (plannings[i].gemeldet == '1') plannings.splice(i, 1);
			}
			plannings_meldung_off = plannings.map(function (e) { return e.regatta; });
			dbSettingsSet('myregattas_' + BOATCLASS + '_meldung_off', plannings_meldung_off);
		} else {
			dbSettingsSet('myregattas_' + BOATCLASS, null);
			dbSettingsSet('myregattas_' + BOATCLASS + '_meldung_off', null);
		}
	}
	if (typeof updateSyncStatusTimer == 'undefined') {
		if (canUseLocalDB) {
			updateSyncStatusTimer = window.setInterval(updateSyncStatus, 10000);
		} else {
			$('#syncstatus').html('Keine Offline-Nutzung möglich.');
			$('#i-sync').parent().hide();
			updateSyncStatusTimer = null;
		}
	}

	if (typeof siteScript === 'function') {
		log('[db] loading site script');
		siteScript();
	} else {
		log('[db] no site script');
		hideLoader();
	}
}

function sync() {
	if (!canUseLocalDB) return false;
	if (syncInProgress > 0) return false;

	return new Promise(function(resolve) {
		var now = Math.floor(Date.now() / 1000);

		db.transaction('update_times').objectStore('update_times').getAll().onsuccess = function (event) {
			var localTimes = {};
			event.target.result.forEach(function (entry) {
				localTimes[entry['table']] = entry['time'];
			});

			syncInProgress = 13;
			var syncOkay = true;
			log("[db] Sync Start");
			$('#i-sync').addClass('fa-spin');

			var interval = window.setInterval(function () {
				if (syncInProgress <= 0) {
					window.clearInterval(interval);
					if (syncOkay) {
						var osUpdateTimes = db.transaction('update_times', 'readwrite').objectStore('update_times');
						osUpdateTimes.put({ table: 'last_sync', time: now });
					}
					log("[db] Sync Stop");
					setTimeout(function(){
						$('#i-sync').removeClass('fa-spin');
					}, 500);

					if (typeof onAfterSync === 'function') {
						onAfterSync();
					}
					removeSyncInfoToPreloader();
					showLoader();
					runPageScript();
					resolve();
				}
			}, 100);

			getJSON(QUERY_URL + 'get_update_time', function (code, serverTimes) {
				if (code == 200) {

					// CLASS
					getJSON(QUERY_URL + 'get_class', function (code, data) {
						if (code == 200) {
							var os = db.transaction('class', 'readwrite').objectStore('class');
							log(data);
							for (key in data) {
								os.put({ key: key, value: data[key] });
							}
							syncInProgress --;
							log('[db] class synced, remaining:', syncInProgress);
						} else {
							log("[db] class: Something went wrong (HTTP " + code + ")");
							syncOkay = false;
							syncInProgress --;
							log('[db] class failed, remaining:', syncInProgress);
						}
					});

					// RANKINGS
					getJSON(QUERY_URL + 'get_rankings', function (code, data) {
						if (code == 200) {
							var os = db.transaction('rankings', 'readwrite').objectStore('rankings');
							data.data.forEach(function (entry) {
								os.put(entry);
							});
							os.openCursor().onsuccess = function (event) {
								var cursor = event.target.result;
								if (cursor) {
									if (!data.keys.includes(parseInt(cursor.key))) {
										os.delete(cursor.key);
									}
									cursor.continue();
								} else {
									syncInProgress --;
									log('[db] rankings synced, remaining:', syncInProgress);
								}
							};
						} else {
							log("[db] rankings: Something went wrong (HTTP " + code + ")");
							syncOkay = false;
							syncInProgress --;
							log('[db] rankings failed, remaining:', syncInProgress);
						}
					});

					// CLUBS
					if (localTimes['clubs'] < serverTimes['clubs']) {
						getJSON(QUERY_URL + 'get_clubs?changed-after=' + localTimes['clubs'], function (code, data) {
							if (code == 200) {
								var os = db.transaction('clubs', 'readwrite').objectStore('clubs');
								data.data.forEach(function (entry) {
									os.put(entry);
								});
								os.openCursor().onsuccess = function (event) {
									var cursor = event.target.result;
									if (cursor) {
										if (!data.keys.includes(parseInt(cursor.key))) {
											os.delete(cursor.key);
										}
										cursor.continue();
									} else {
										var osUpdateTimes = db.transaction('update_times', 'readwrite').objectStore('update_times');
										osUpdateTimes.put({ table: 'clubs', time: serverTimes['clubs'] });
										syncInProgress --;
										log('[db] clubs synced, remaining:', syncInProgress);
									}
								};
							} else {
								log("[db] clubs: Something went wrong (HTTP " + code + ")");
								syncOkay = false;
								syncInProgress --;
								log('[db] clubs failed, remaining:', syncInProgress);
							}
						});
					} else {
						syncInProgress --;
					}

					// BOATS
					if (localTimes['boats'] < serverTimes['boats']) {
						getJSON(QUERY_URL + 'get_boats?changed-after=' + localTimes['boats'], function (code, data) {
							if (code == 200) {
								var os = db.transaction('boats', 'readwrite').objectStore('boats');
								data.data.forEach(function (entry) {
									os.put(entry);
								});
								os.openCursor().onsuccess = function (event) {
									var cursor = event.target.result;
									if (cursor) {
										if (!data.keys.includes(parseInt(cursor.key))) {
											os.delete(cursor.key);
										}
										cursor.continue();
									} else {
										var osUpdateTimes = db.transaction('update_times', 'readwrite').objectStore('update_times');
										osUpdateTimes.put({ table: 'boats', time: serverTimes['boats'] });
										syncInProgress --;
										log('[db] boats synced, remaining:', syncInProgress);
									}
								};
							} else {
								log("[db] boats: Something went wrong (HTTP " + code + ")");
								syncOkay = false;
								syncInProgress --;
								log('[db] boats failed, remaining:', syncInProgress);
							}
						});
					} else {
						syncInProgress --;
					}

					// SAILORS
					if (localTimes['sailors'] < serverTimes['sailors']) {
						getJSON(QUERY_URL + 'get_sailors?changed-after=' + localTimes['sailors'], function (code, data) {
							if (code == 200) {
								var os = db.transaction('sailors', 'readwrite').objectStore('sailors');
								data.data.forEach(function (entry) {
									os.put(entry);
								});
								os.openCursor().onsuccess = function (event) {
									var cursor = event.target.result;
									if (cursor) {
										if (!data.keys.includes(parseInt(cursor.key))) {
											os.delete(cursor.key);
										}
										cursor.continue();
									} else {
										var osUpdateTimes = db.transaction('update_times', 'readwrite').objectStore('update_times');
										osUpdateTimes.put({ table: 'sailors', time: serverTimes['sailors'] });
										syncInProgress --;
										log('[db] sailors synced, remaining:', syncInProgress);
									}
								};
							} else {
								log("[db] sailors: Something went wrong (HTTP " + code + ")");
								syncOkay = false;
								syncInProgress --;
								log('[db] sailors failed, remaining:', syncInProgress);
							}
						});
					} else {
						syncInProgress --;
					}

					// REGATTAS
					if (localTimes['regattas'] < serverTimes['regattas']) {
						getJSON(QUERY_URL + 'get_regattas?changed-after=' + localTimes['regattas'], function (code, data) {
							if (code == 200) {
								var os = db.transaction('regattas', 'readwrite').objectStore('regattas');
								data.data.forEach(function (entry) {
									os.put(entry);
								});
								os.openCursor().onsuccess = async function (event) {
									var cursor = event.target.result;
									if (cursor) {
										if (!data.keys.includes(parseInt(cursor.key))) {
											os.delete(cursor.key);
										}
										cursor.continue();
									} else {
										// update years
										var regattas = await dbGetData('regattas');
										var years = {};
										for (id in regattas) {
											var entry = regattas[id];
											var date = parseDate(entry['date']);
											var y = date.getFullYear();
											years[y] = y;
										}
										var osYears = db.transaction('years', 'readwrite').objectStore('years');
										osYears.clear().onsuccess = function (event) {
											for (var y in years) {
												osYears.put({ year: y });
											}
										}

										var osUpdateTimes = db.transaction('update_times', 'readwrite').objectStore('update_times');
										osUpdateTimes.put({ table: 'regattas', time: serverTimes['regattas'] });
										syncInProgress --;
										log('[db] regattas synced, remaining:', syncInProgress);
									}
								};
							} else {
								log("[db] regattas: Something went wrong (HTTP " + code + ")");
								syncOkay = false;
								syncInProgress --;
								log('[db] regattas failed, remaining:', syncInProgress);
							}
						});
					} else {
						syncInProgress --;
					}

					// RESULTS
					if (localTimes['results'] < serverTimes['results']) {
						getJSON(QUERY_URL + 'get_results?changed-after=' + localTimes['results'], function (code, data) {
							if (code == 200) {
								var os = db.transaction('results', 'readwrite').objectStore('results');
								data.data.forEach(function (entry) {
									os.put(entry);
								});
								os.openCursor().onsuccess = function (event) {
									var cursor = event.target.result;
									if (cursor) {
										if (!data.keys.includes(parseInt(cursor.key))) {
											os.delete(cursor.key);
										}
										cursor.continue();
									} else {
										var osUpdateTimes = db.transaction('update_times', 'readwrite').objectStore('update_times');
										osUpdateTimes.put({ table: 'results', time: serverTimes['results'] });
										syncInProgress --;
										log('[db] results synced, remaining:', syncInProgress);
									}
								};
							} else {
								log("[db] results: Something went wrong (HTTP " + code + ")");
								syncOkay = false;
								syncInProgress --;
								log('[db] results failed, remaining:', syncInProgress);
							}
						});
					} else {
						syncInProgress --;
					}

					// PLANNINGS
					if (localTimes['plannings'] < serverTimes['plannings']) {
						getJSON(QUERY_URL + 'get_plannings?changed-after=' + localTimes['plannings'], function (code, data) {
							if (code == 200) {
								var os = db.transaction('plannings', 'readwrite').objectStore('plannings');
								data.data.forEach(function (entry) {
									os.put(entry);
								});
								os.openCursor().onsuccess = function (event) {
									var cursor = event.target.result;
									if (cursor) {
										if (!data.keys.includes(parseInt(cursor.key))) {
											os.delete(cursor.key);
										}
										cursor.continue();
									} else {
										var osUpdateTimes = db.transaction('update_times', 'readwrite').objectStore('update_times');
										osUpdateTimes.put({ table: 'plannings', time: serverTimes['plannings'] });
										syncInProgress --;
										log('[db] plannings synced, remaining:', syncInProgress);
									}
								};
							} else {
								log("[db] plannings: Something went wrong (HTTP " + code + ")");
								syncOkay = false;
								syncInProgress --;
								log('[db] plannings failed, remaining:', syncInProgress);
							}
						});
					} else {
						syncInProgress --;
					}

					if (isLoggedIn()) {
						// TRIM_BOATS
						if (localTimes['trim_boats'] < serverTimes['trim_boats']) {
							getJSON(QUERY_URL + 'get_trim_boats?changed-after=' + localTimes['trim_boats'], function (code, data) {
								if (code == 200) {
									var os = db.transaction('trim_boats', 'readwrite').objectStore('trim_boats');
									data.data.forEach(function (entry) {
										os.put(entry);
									});
									os.openCursor().onsuccess = function (event) {
										var cursor = event.target.result;
										if (cursor) {
											if (!data.keys.includes(parseInt(cursor.key))) {
												os.delete(cursor.key);
											}
											cursor.continue();
										} else {
											var osUpdateTimes = db.transaction('update_times', 'readwrite').objectStore('update_times');
											osUpdateTimes.put({ table: 'trim_boats', time: serverTimes['trim_boats'] });
											syncInProgress --;
											log('[db] trim_boats synced, remaining:', syncInProgress);
										}
									};
								} else {
									log("[db] trim_boats: Something went wrong (HTTP " + code + ")");
									syncOkay = false;
									syncInProgress --;
									log('[db] trim_boats failed, remaining:', syncInProgress);
								}
							});
						} else {
							syncInProgress --;
						}

						// TRIM_USERS
						if (localTimes['trim_users'] < serverTimes['trim_users']) {
							getJSON(QUERY_URL + 'get_trim_users?changed-after=' + localTimes['trim_users'], function (code, data) {
								if (code == 200) {
									var os = db.transaction('trim_users', 'readwrite').objectStore('trim_users');
									data.data.forEach(function (entry) {
										os.put(entry);
									});
									os.openCursor().onsuccess = function (event) {
										var cursor = event.target.result;
										if (cursor) {
											if (!data.keys.includes(parseInt(cursor.key))) {
												os.delete(cursor.key);
											}
											cursor.continue();
										} else {
											var osUpdateTimes = db.transaction('update_times', 'readwrite').objectStore('update_times');
											osUpdateTimes.put({ table: 'trim_users', time: serverTimes['trim_users'] });
											syncInProgress --;
											log('[db] trim_users synced, remaining:', syncInProgress);
										}
									};
								} else {
									log("[db] trim_users: Something went wrong (HTTP " + code + ")");
									syncOkay = false;
									syncInProgress --;
									log('[db] trim_users failed, remaining:', syncInProgress);
								}
							});
						} else {
							syncInProgress --;
						}

						// TRIM_TRIMS
						if (localTimes['trim_trims'] < serverTimes['trim_trims']) {
							getJSON(QUERY_URL + 'get_trim_trims?changed-after=' + localTimes['trim_trims'], function (code, data) {
								if (code == 200) {
									var os = db.transaction('trim_trims', 'readwrite').objectStore('trim_trims');
									data.data.forEach(function (entry) {
										os.put(entry);
									});
									os.openCursor().onsuccess = function (event) {
										var cursor = event.target.result;
										if (cursor) {
											if (!data.keys.includes(parseInt(cursor.key))) {
												os.delete(cursor.key);
											}
											cursor.continue();
										} else {
											var osUpdateTimes = db.transaction('update_times', 'readwrite').objectStore('update_times');
											osUpdateTimes.put({ table: 'trim_trims', time: serverTimes['trim_trims'] });
											syncInProgress --;
											log('[db] trim_trims synced, remaining:', syncInProgress);
										}
									};
								} else {
									log("[db] trim_trims: Something went wrong (HTTP " + code + ")");
									syncOkay = false;
									syncInProgress --;
									log('[db] trim_trims failed, remaining:', syncInProgress);
								}
							});
						} else {
							syncInProgress --;
						}

					} else {
						syncInProgress -= 3;
					}

					// NEWS
					if (localTimes['news'] < serverTimes['news']) {
						getJSON(QUERY_URL + 'get_news?changed-after=' + localTimes['news'], function (code, data) {
							if (code == 200) {
								var os = db.transaction('news', 'readwrite').objectStore('news');
								data.data.forEach(function (entry) {
									os.put(entry);
								});
								os.openCursor().onsuccess = function (event) {
									var cursor = event.target.result;
									if (cursor) {
										if (!data.keys.includes(parseInt(cursor.key))) {
											os.delete(cursor.key);
										}
										cursor.continue();
									} else {
										var osUpdateTimes = db.transaction('update_times', 'readwrite').objectStore('update_times');
										osUpdateTimes.put({ table: 'news', time: serverTimes['news'] });
										syncInProgress --;
										log('[db] news synced, remaining:', syncInProgress);
									}
								};
							} else {
								log("[db] news: Something went wrong (HTTP " + code + ")");
								syncOkay = false;
								syncInProgress --;
								log('[db] news failed, remaining:', syncInProgress);
							}
						});
					} else {
						syncInProgress --;
					}

					// USERS
					if (localTimes['users'] < serverTimes['users']) {
						getJSON(QUERY_URL + 'get_users?changed-after=' + localTimes['users'], function (code, data) {
							if (code == 200) {
								var os = db.transaction('users', 'readwrite').objectStore('users');
								data.data.forEach(function (entry) {
									os.put(entry);
								});
								os.openCursor().onsuccess = function (event) {
									var cursor = event.target.result;
									if (cursor) {
										if (!data.keys.includes(parseInt(cursor.key))) {
											os.delete(cursor.key);
										}
										cursor.continue();
									} else {
										var osUpdateTimes = db.transaction('update_times', 'readwrite').objectStore('update_times');
										osUpdateTimes.put({ table: 'users', time: serverTimes['users'] });
										syncInProgress --;
										log('[db] users synced, remaining:', syncInProgress);
									}
								};
							} else {
								log("[db] users: Something went wrong (HTTP " + code + ")");
								syncOkay = false;
								syncInProgress --;
								log('[db] users failed, remaining:', syncInProgress);
							}
						});
					} else {
						syncInProgress --;
					}

				} else {
					if (code == 401) {
						log("[db] Auth invalid. Logout initiated");
						logoutClearStorage();
					} else {
						log("[db] Something went wrong (HTTP " + code + ")");
					}
					syncOkay = false;
					syncInProgress = 0;
				}
			});
		};
	});
}

function checkSync() {
	if (!canUseLocalDB) return;
	var osUpdateTimes = db.transaction('update_times').objectStore('update_times');
	osUpdateTimes.get('last_sync').onsuccess = function (event) {
		var lastSync = event.target.result.time;
		var now = Math.floor(Date.now() / 1000);
		if ((lastSync + 600) < now) { // sync max all 10 minutes
			sync();
		}
	};
}

function initDatabase() {
	log('[db] Initializing DB...');
	if (window.indexedDB) {
		var request = window.indexedDB.open('regatten_app_db_' + BOATCLASS, DB_VERSION);
		request.onerror = function (event) {
			log("[db] Cannot open DB: " + event.target);

			if (typeof onDatabaseLoaded == 'function') onDatabaseLoaded();

			runPageScript();
		};
		request.onsuccess = function (event) {
			log("[db] Database loaded");
			db = event.target.result;

			db.onversionchange = function (event) {
				if (syncTimer != null) window.clearInterval(syncTimer);
				if (updateSyncStatusTimer != null) window.clearInterval(updateSyncStatusTimer);
				$('#syncstatus').html('');
				canUseLocalDB = false;
				db.close();
				location.reload;
			}

			db.onerror = function (event) {
				log("[db] DB Error: " + event.target);
			};

			canUseLocalDB = true;

			if (typeof onDatabaseLoaded == 'function') onDatabaseLoaded();

			db.transaction('update_times').objectStore('update_times').get('last_sync').onsuccess = function (event) {
				var lastSync = event.target.result.time;
				if (lastSync > 1) {
					runPageScript();
				} else {
					if (lastSync < 1) addSyncInfoToPreloader();
					db.transaction('update_times', 'readwrite').objectStore('update_times').put({ table: 'loggedin', status: isLoggedIn() });
					loaderCount --;
				}
			};

			checkSync();

			syncTimer = window.setInterval(checkSync, 300000); // 5 min

			window.ononline = function () {
				checkSync();
			}
		};
		request.onupgradeneeded = function (event) {
			var db = event.target.result;
			var upgradeTransaction = event.target.transaction;
			var oldVersion = event.oldVersion;
			var newVersion = event.newVersion;

			log("[db] DB Version Upgrade from " + oldVersion + " to " + newVersion);

			if ((oldVersion < 1) && (newVersion >= 1)) {
				log('[db] to version 1');
				var osClubs = db.createObjectStore('clubs', { keyPath: 'id' });
				var osBoats = db.createObjectStore('boats', { keyPath: 'id' });
				var osSailors = db.createObjectStore('sailors', { keyPath: 'id' });
				var osRegattas = db.createObjectStore('regattas', { keyPath: 'id' });
				var osResults = db.createObjectStore('results', { keyPath: 'id' });
				osResults.createIndex('regatta', 'regatta', { unique: false });
				var osPlannings = db.createObjectStore('plannings', { keyPath: 'id' });
				osPlannings.createIndex('user', 'user', { unique: false });
				osPlannings.createIndex('regatta', 'regatta', { unique: false });
				var osTrimBoats = db.createObjectStore('trim_boats', { keyPath: 'id' });
				var osTrimUsers = db.createObjectStore('trim_users', { keyPath: 'id' });
				osTrimUsers.createIndex('boat', 'boat', { unique: false });
				var osTrimTrims = db.createObjectStore('trim_trims', { keyPath: 'id' });
				osTrimTrims.createIndex('boat', 'boat', { unique: false });
				var osUpdateTimes = db.createObjectStore('update_times', { keyPath: 'table' });
				osUpdateTimes.add({ table: 'last_sync', time: 0 });
				osUpdateTimes.add({ table: 'clubs', time: 0 });
				osUpdateTimes.add({ table: 'boats', time: 0 });
				osUpdateTimes.add({ table: 'sailors', time: 0 });
				osUpdateTimes.add({ table: 'regattas', time: 0 });
				osUpdateTimes.add({ table: 'results', time: 0 });
				osUpdateTimes.add({ table: 'plannings', time: 0 });
				osUpdateTimes.add({ table: 'trim_boats', time: 0 });
				osUpdateTimes.add({ table: 'trim_users', time: 0 });
				osUpdateTimes.add({ table: 'trim_trims', time: 0 });
			}

			if ((oldVersion < 2) && (newVersion >= 2)) {
				log('[db] to version 2');
				var osUsers = db.createObjectStore('users', { keyPath: 'id' });
				osUsers.createIndex('username', 'username', { unique: true });
				var osUpdateTimes = upgradeTransaction.objectStore('update_times');
				osUpdateTimes.add({ table: 'users', time: 0 });
			}

			if ((oldVersion < 3) && (newVersion >= 3)) {
				log('[db] to version 3');
				var osYears = db.createObjectStore('years', { keyPath: 'year' });
				var osUpdateTimes = upgradeTransaction.objectStore('update_times');
				osUpdateTimes.put({ table: 'regattas', time: 0 });
			}

			if ((oldVersion < 4) && (newVersion >= 4)) {
				log('[db] to version 4');
				var osUpdateTimes = upgradeTransaction.objectStore('update_times');
				osUpdateTimes.add({ table: 'loggedin', status: isLoggedIn() });
			}

			if ((oldVersion < 5) && (newVersion >= 5)) {
				log('[db] to version 5');
				var osPushes = db.createObjectStore('settings', { keyPath: 'key' });
			}

			if ((oldVersion < 6) && (newVersion >= 6)) {
				log('[db] to version 6');
				var osNews = db.createObjectStore('news', { keyPath: 'id' });
				var osUpdateTimes = upgradeTransaction.objectStore('update_times');
				osUpdateTimes.add({ table: 'news', time: 0 });
			}

			if ((oldVersion < 7) && (newVersion >= 7)) {
				log('[db] to version 7');
				var osClass = db.createObjectStore('class', { keyPath: 'key' });
			}

			if ((oldVersion < 8) && (newVersion >= 8)) {
				log('[db] to version 8');
				var osRankings = db.createObjectStore('rankings', { keyPath: 'id' });
			}

			// Force resync after db update
			if (oldVersion >= 1) {
				var osUpdateTimes = upgradeTransaction.objectStore('update_times');
				osUpdateTimes.put({ table: 'last_sync', time: 1 });
			}
		}
	} else {
		if (typeof onDatabaseLoaded == 'function') onDatabaseLoaded();

		runPageScript();
	}
}

function resetDb() {
	if (canUseLocalDB) {
		showLoader();
		var osUpdateTimes = db.transaction('update_times', 'readwrite').objectStore('update_times');
		osUpdateTimes.put({ table: 'last_sync', time: 1 });
		osUpdateTimes.put({ table: 'clubs', time: 0 });
		osUpdateTimes.put({ table: 'boats', time: 0 });
		osUpdateTimes.put({ table: 'sailors', time: 0 });
		osUpdateTimes.put({ table: 'regattas', time: 0 });
		osUpdateTimes.put({ table: 'results', time: 0 });
		osUpdateTimes.put({ table: 'plannings', time: 0 });
		osUpdateTimes.put({ table: 'trim_boats', time: 0 });
		osUpdateTimes.put({ table: 'trim_users', time: 0 });
		osUpdateTimes.put({ table: 'trim_trims', time: 0 });
		osUpdateTimes.put({ table: 'news', time: 0 });
		osUpdateTimes.put({ table: 'users', time: 0 });
		log('[db] DB update times reset');
		hideLoader();
	}
}

function addSyncInfoToPreloader() {
	var preloader = document.getElementById('preloader');
	var div = document.createElement('div');
	div.id = 'preloader-sync-info';
	div.classList = 'rounded-s shadow-m bg-highlight m-3 p-3';
	div.style.position = 'fixed';
	div.style.top = 0;
	div.style.left = 0;
	div.style.right = 0;
	div.innerHTML = '<h2 class="color-white">Datenbank SYNC</h2><p class="mb-0 color-white">Um Dir alle n&ouml;tigen Informationen anzeigen zu k&ouml;nnen, m&uuml;ssen wir die Datenbank synchronisieren.<br>Dies kann einen Moment dauern. Bitte habe etwas Geduld. Beim n&auml;chsten &Ouml;ffnen geht es schneller.</p>';
	preloader.appendChild(div);
}

function removeSyncInfoToPreloader() {
	$('#preloader-sync-info').remove();
}
