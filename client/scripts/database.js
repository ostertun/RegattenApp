const DB_VERSION = 4;

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
		console.log("getJSON: timeout");
		callback(0, null);
	}
	xhr.onerror = function () {
		console.log("getJSON: error");
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
						console.log("Something went wrong (HTTP " + code + ")");
						fail(strings.error_network, 5000);
						resolve([]);
					}
				});
			} else {
				getJSON(QUERY_URL + 'get_' + table.substr(0, table.length - 1) + '?id=' + id, function (code, data) {
					if (code == 200) {
						resolve(data.data);
					} else {
						console.log("Something went wrong (HTTP " + code + ")");
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
					console.log("Something went wrong (HTTP " + code + ")");
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
	tempA.sort();
	var tempB = [...b['values']];
	tempB.sort();
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

function dbGetRanking(minDate, maxDate, jugend, jugstrict) {
	return new Promise(async function(resolve) {
		var rankNoResults = [];
		
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
			
			// regatta has to be min. 2 days to be ranking regatta
			if (regatta.length < 2) continue;
			
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
				// TODO: not used
				
				sailors[sailorIds[result.steuermann]].regattas[regatta.id] = {
					regatta: regatta.id,
					boat: result.boat,
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
		}
		
		// remove not german or not youth sailors
		for (var i = sailors.length - 1; i >= 0; i --) {
			if (sailors[i].german == '0') {
				sailors.splice(i, 1);
			} else if (jugend) {
				if (((sailors[i].year != null) && (sailors[i].year < (formatDate('Y', maxDate) - YOUTH_AGE))) ||
					((sailors[i].year == null) && (jugstrict))) {
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
				if (cnt >= 9) break;
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
		
		for (var i = 0; i < sailors.length; i ++) {
			sailors[i].rank = (i + 1);
		}
		
		resolve([sailors, rankNoResults]);
	});
}

async function updateSyncStatus() { // TODO
//	var syncStatus = document.getElementById('syncstatus');
//	var lastSync = await dbGetData('update_times', 'last_sync');
//	lastSync = new Date(lastSync.time * 1000);
//	var now = new Date();
//	var diff = Math.round((now - lastSync) / 1000);
//	var txt = '';
//	
//	if (diff < 30) {  // 30 sec
//		txt = 'jetzt';
//	} else if (diff < 3600) {  // 60 min
//		diff = Math.round(diff / 60);
//		txt = 'vor ' + diff + ' ' + (diff == 1 ? 'Minute' : 'Minuten');
//	} else if (diff < 86400) {  // 24 std
//		diff = Math.round(diff / 3600);
//		txt = 'vor ' + diff + ' ' + (diff == 1 ? 'Stunde' : 'Stunden');
//	} else {
//		diff = Math.round(diff / 86400);
//		txt = 'vor ' + diff + ' ' + (diff == 1 ? 'Tag' : 'Tagen');
//	}
//	
//	var btn = '<a href="#" onclick="setLoading(true); sync(); return false;"><i class="fas fa-sync"></i> Sync</a>';
//	syncStatus.innerHTML = 'Zuletzt aktualisiert: ' + txt + btn;
}

async function runPageScript() {
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
	}
	if (typeof updateSyncStatusTimer == 'undefined') { // TODO
//		var syncStatus = document.getElementById('syncstatus');
		if (canUseLocalDB) {
			updateSyncStatusTimer = window.setInterval(updateSyncStatus, 10000);
		} else {
//			syncStatus.innerHTML = 'Keine Offline-Nutzung möglich.';
			updateSyncStatusTimer = null;
		}
//		syncStatus.style.display = 'block';
	}
	
	if (typeof siteScript === 'function') {
		siteScript();
	} else {
		hideLoader();
	}
}

function sync() {
	if (!canUseLocalDB) return false;
	if (syncInProgress > 0) return false;
	
	var now = Math.floor(Date.now() / 1000);
	
	db.transaction('update_times').objectStore('update_times').getAll().onsuccess = function (event) {
		var localTimes = {};
		event.target.result.forEach(function (entry) {
			localTimes[entry['table']] = entry['time'];
		});
		
		syncInProgress = 10;
		var syncOkay = true;
		console.log("Sync Start");
		$('#i-sync').addClass('fa-spin');
		
		var interval = window.setInterval(function () {
			if (syncInProgress <= 0) {
				window.clearInterval(interval);
				if (syncOkay) {
					var osUpdateTimes = db.transaction('update_times', 'readwrite').objectStore('update_times');
					osUpdateTimes.put({ table: 'last_sync', time: now });
				}
				console.log("Sync Stop");
				setTimeout(function(){
					$('#i-sync').removeClass('fa-spin');
				}, 500);
				
				runPageScript();
			}
		}, 100);
		
		getJSON(QUERY_URL + 'get_update_time', function (code, serverTimes) {
			if (code == 200) {
				
				// CLUBS
				if (localTimes['clubs'] < serverTimes['clubs']) {
					getJSON(QUERY_URL + 'get_clubs?changed-after=' + localTimes['clubs'], function (code, data) {
						if (code == 200) {
							var os = db.transaction('clubs', 'readwrite').objectStore('clubs');
							console.log(data);
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
								}
							};
						} else {
							console.log("Something went wrong (HTTP " + code + ")");
							syncOkay = false;
							syncInProgress --;
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
							console.log(data);
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
								}
							};
						} else {
							console.log("Something went wrong (HTTP " + code + ")");
							syncOkay = false;
							syncInProgress --;
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
							console.log(data);
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
								}
							};
						} else {
							console.log("Something went wrong (HTTP " + code + ")");
							syncOkay = false;
							syncInProgress --;
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
							console.log(data);
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
								}
							};
						} else {
							console.log("Something went wrong (HTTP " + code + ")");
							syncOkay = false;
							syncInProgress --;
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
							console.log(data);
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
								}
							};
						} else {
							console.log("Something went wrong (HTTP " + code + ")");
							syncOkay = false;
							syncInProgress --;
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
							console.log(data);
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
								}
							};
						} else {
							console.log("Something went wrong (HTTP " + code + ")");
							syncOkay = false;
							syncInProgress --;
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
								console.log(data);
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
									}
								};
							} else {
								console.log("Something went wrong (HTTP " + code + ")");
								syncOkay = false;
								syncInProgress --;
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
								console.log(data);
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
									}
								};
							} else {
								console.log("Something went wrong (HTTP " + code + ")");
								syncOkay = false;
								syncInProgress --;
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
								console.log(data);
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
									}
								};
							} else {
								console.log("Something went wrong (HTTP " + code + ")");
								syncOkay = false;
								syncInProgress --;
							}
						});
					} else {
						syncInProgress --;
					}
					
				} else {
					syncInProgress -= 3;
				}
				
				// USERS
				if (localTimes['users'] < serverTimes['users']) {
					getJSON(QUERY_URL + 'get_users?changed-after=' + localTimes['users'], function (code, data) {
						if (code == 200) {
							var os = db.transaction('users', 'readwrite').objectStore('users');
							console.log(data);
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
								}
							};
						} else {
							console.log("Something went wrong (HTTP " + code + ")");
							syncOkay = false;
							syncInProgress --;
						}
					});
				} else {
					syncInProgress --;
				}
				
			} else {
				console.log("Something went wrong (HTTP " + code + ")");
				syncOkay = false;
				syncInProgress = 0;
			}
		});
	};
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
	if (window.indexedDB) {
		var request = window.indexedDB.open('regatten_app_db_' + BOATCLASS, DB_VERSION);
		request.onerror = function (event) {
			console.log("Cannot open DB: " + event.target.errorCode);
			
			runPageScript();
		};
		request.onsuccess = function (event) {
			console.log("Database loaded");
			db = event.target.result;
			
			db.onversionchange = function (event) {
				if (syncTimer != null) window.clearInterval(syncTimer);
				if (updateSyncStatusTimer != null) window.clearInterval(updateSyncStatusTimer);
// TODO				document.getElementById('syncstatus').innerHTML = '';
				canUseLocalDB = false;
				db.close();
				location.reload;
			}
			
			db.onerror = function (event) {
				console.log("DB Error: " + event.target.errorCode);
			};
			
			canUseLocalDB = true;
			
			db.transaction('update_times').objectStore('update_times').get('last_sync').onsuccess = function (event) {
				var lastSync = event.target.result.time;
				if (lastSync > 0) {
					runPageScript();
				} else {
					db.transaction('update_times', 'readwrite').objectStore('update_times').put({ table: 'loggedin', status: isLoggedIn() });
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
			
			console.log("Datenbank Version Upgrade von " + oldVersion + " auf " + newVersion);
			
			if ((oldVersion < 1) && (newVersion >= 1)) {
				console.log('to version 1');
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
				console.log('to version 2');
				var osUsers = db.createObjectStore('users', { keyPath: 'id' });
				osUsers.createIndex('username', 'username', { unique: true });
				var osUpdateTimes = upgradeTransaction.objectStore('update_times');
				osUpdateTimes.add({ table: 'users', time: 0 });
			}
			
			if ((oldVersion < 3) && (newVersion >= 3)) {
				console.log('to version 3');
				var osYears = db.createObjectStore('years', { keyPath: 'year' });
				var osUpdateTimes = upgradeTransaction.objectStore('update_times');
				osUpdateTimes.put({ table: 'regattas', time: 0 });
			}
			
			if ((oldVersion < 4) && (newVersion >= 4)) {
				console.log('to version 4');
				var osUpdateTimes = upgradeTransaction.objectStore('update_times');
				osUpdateTimes.add({ table: 'loggedin', status: isLoggedIn() });
			}
			
			var osUpdateTimes = upgradeTransaction.objectStore('update_times');
			osUpdateTimes.put({ table: 'last_sync', time: 0 });
		}
	} else {
		runPageScript();
	}
}

function resetDb(silent = true) {
	$('#menu-developer').hideMenu();
	if (canUseLocalDB) {
		showLoader();
		var osUpdateTimes = db.transaction('update_times', 'readwrite').objectStore('update_times');
		osUpdateTimes.put({ table: 'last_sync', time: 0 });
		osUpdateTimes.put({ table: 'clubs', time: 0 });
		osUpdateTimes.put({ table: 'boats', time: 0 });
		osUpdateTimes.put({ table: 'sailors', time: 0 });
		osUpdateTimes.put({ table: 'regattas', time: 0 });
		osUpdateTimes.put({ table: 'results', time: 0 });
		osUpdateTimes.put({ table: 'plannings', time: 0 });
		osUpdateTimes.put({ table: 'trim_boats', time: 0 });
		osUpdateTimes.put({ table: 'trim_users', time: 0 });
		osUpdateTimes.put({ table: 'trim_trims', time: 0 });
		osUpdateTimes.put({ table: 'users', time: 0 });
		console.log('DB update times reset');
		if (!silent)
			toastInfo('The database was reset. Please reload or close this tab.<br>At the next visit, a full sync will be performed.');
		hideLoader();
	} else {
		if (!silent)
			toastWarn('Your device does not support storing data locally. All data is fetched directly from our server.<br>As a result, you can not reset your database.');
	}
}
