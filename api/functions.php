<?php
	
	function get_db_entry($mysqli, $table, $id = false, $order = false) {
		if ($id === false) {
			return db_get_data($mysqli, $table, '*', ($order !== false ? ('1=1 ORDER BY ' . $order) : false));
		} else {
			$result = db_get_data($mysqli, $table, '*', '`id` = "' . mysqli_real_escape_string($mysqli, $id) . '"', 1);
			if (($result === false) or (count($result) != 1))
				return false;
			else
				return array_values($result)[0];
		}
	}
	
	function get_club($mysqli, $id = false) {
		return get_db_entry($mysqli, DB_TABLE_CLUBS, $id, '`kurz` ASC');
	}
	
	function get_boat($mysqli, $id = false) {
		return get_db_entry($mysqli, BOATCLASS . DB_TABLE_SUFFIX_BOATS, $id, '`sailnumber` ASC');
	}
	
	function get_sailor($mysqli, $id = false) {
		return get_db_entry($mysqli, BOATCLASS . DB_TABLE_SUFFIX_SAILORS, $id, '`name` ASC');
	}
	
	function get_planning($mysqli, $userId = false, $regattaId = false) {
		$where = '';
		$limit = false;
		if ($userId !== false) {
			$where .= '(`user`="' . mysqli_real_escape_string($mysqli, $userId) . '")';
		}
		if (($userId !== false) and ($regattaId !== false)) {
			$where .= ' AND ';
			$limit = 1;
		}
		if ($regattaId !== false) {
			$where .= '(`regatta`="' . mysqli_real_escape_string($mysqli, $regattaId) . '")';
		}
		if ($where == '') $where = false;
		if ($limit === false) {
			return db_get_data($mysqli, BOATCLASS . DB_TABLE_SUFFIX_PLANNING, '*', $where);
		} else {
			$result = db_get_data($mysqli, BOATCLASS . DB_TABLE_SUFFIX_PLANNING, '*', $where, 1);
			if (($result === false) or (count($result) != 1))
				return false;
			else
				return array_values($result)[0];
		}
	}
	
	function get_regatta($mysqli, $id = false) {
		return get_db_entry($mysqli, BOATCLASS . DB_TABLE_SUFFIX_REGATTAS, $id, '`date` ASC');
	}
	
	function get_result($mysqli, $regattaId = false) {
		if ($regattaId === false) {
			return db_get_data($mysqli, BOATCLASS . DB_TABLE_SUFFIX_RESULTS);
		} else {
			return db_get_data($mysqli, BOATCLASS . DB_TABLE_SUFFIX_RESULTS, '*', '`regatta` = "' . mysqli_real_escape_string($mysqli, $regattaId) . '"');
		}
	
	}
	
	function get_regattas_range($mysqli, $from, $to) {
		return db_get_data($mysqli, BOATCLASS . DB_TABLE_SUFFIX_REGATTAS, '*', '(`date` >= "' . date('Y-m-d', $from) . '") AND (`date` <= "' . date('Y-m-d', $to) . '") ORDER BY `date`');
	}
	
	function get_regatta_years($mysqli) {
		$query = 'SELECT DISTINCT(YEAR(`date`)) as year FROM ' . BOATCLASS . DB_TABLE_SUFFIX_REGATTAS . ' ORDER BY `date`;';
		$response = mysqli_query($mysqli, $query);
		
		if ($response !== false) {
			$result = array();
			if ($response->num_rows > 0) {
				while ($row = $response->fetch_assoc()) {
					$result[] = $row['year'];
				}
			}
			return $result;
		} else {
			logE("functions", "get_data\nInvalid request\n" . $query . "\n" . mysqli_error($mysqli));
			return false;
		}
	}
	
	function get_result_calculated($mysqli, $regatta_id) {
		$regatta = get_regatta($mysqli, $regatta_id);
		if ($regatta === false) {
			return false;
		}
		$results = get_result($mysqli, $regatta_id);
		if ($results !== false) {
			
			// *** Replace , with .
			foreach ($results as $key => $value) {
				for ($i = 1; $i <= $regatta['races']; $i ++) {
					$results[$key]['race' . $i] = str_replace(',', '.', $results[$key]['race' . $i]);
				}
			}
			
			// *** Calculation ***
			$gemeldet = count($results);
			
			$sortarray = array();
			foreach ($results as $key => $value) {
				$results[$key]['finished'] = false;
				$results[$key]['values'] = array();
				$results[$key]['values_all'] = array();
				$results[$key]['texts'] = array();
				$copy = array();
				for ($i = 1; $i <= $regatta['races']; $i ++) {
					if (is_numeric($value['race' . $i])) {
						$results[$key]['values'][$i] = $value['race' . $i];
						$results[$key]['texts'][$i] = $value['race' . $i];
						$copy[$i] = $value['race' . $i];
						$results[$key]['finished'] = true;
					} else {
						switch ($value['race' . $i]) {
							// Nicht gestartet
							case 'DNC': $results[$key]['values'][$i] = $gemeldet + 1; $copy[$i] = $gemeldet + 1; break; // Did not come
							case 'DNS': $results[$key]['values'][$i] = $gemeldet + 1; $copy[$i] = $gemeldet + 1; break; // Did not started
							// Startfehler
							case 'OCS': $results[$key]['values'][$i] = $gemeldet + 1; $copy[$i] = $gemeldet + 1; /*$results[$key]['finished'] = true;*/ break; // On course site
//	Muss v. Hand						case 'ZFP': $results[$key]['values'][$i] = $gemeldet + 1; $copy[$i] = $gemeldet + 1; $results[$key]['finished'] = true; break; // Z-Flag penalty (20% nach 30.2)
							case 'UFD': $results[$key]['values'][$i] = $gemeldet + 1; $copy[$i] = $gemeldet + 1; /*$results[$key]['finished'] = true;*/ break; // Uniform Flag Disqualified (disqu. nach 30.3)
							case 'BFD': $results[$key]['values'][$i] = $gemeldet + 1; $copy[$i] = $gemeldet + 1; /*$results[$key]['finished'] = true;*/ break; // Black Flag Disqualified (disqu. nach 30.4)
							// Nicht durch Ziel gegangen
							case 'DNF': $results[$key]['values'][$i] = $gemeldet + 1; $copy[$i] = $gemeldet + 1; break; // Did not finish
							case 'RET': $results[$key]['values'][$i] = $gemeldet + 1; $copy[$i] = $gemeldet + 1; break; // Retired (Aufgegeben)
							case 'RAF': $results[$key]['values'][$i] = $gemeldet + 1; $copy[$i] = $gemeldet + 1; /*$results[$key]['finished'] = true;*/ break; // Retired after finish
							// Disqualifizierun
							case 'DSQ': $results[$key]['values'][$i] = $gemeldet + 1; $copy[$i] = $gemeldet + 1; /*$results[$key]['finished'] = true;*/ break; // Disqualified
							case 'DNE': $results[$key]['values'][$i] = $gemeldet + 1; $copy[$i] = -1; /*$results[$key]['finished'] = true;*/ break; // Disqualified, not excludable (disqu. kann nach 90.3(b) nicht gestrichen werden)
							case 'DGM': $results[$key]['values'][$i] = $gemeldet + 1; $copy[$i] = -2; /*$results[$key]['finished'] = true;*/ break; // Disqualification Gross Missconduct (kann nach 69.1(b)(2) nicht gestr. werden, grobes Fehlverhalten)
							// Wiedergutmachung
//	Muss v. Hand						case 'RDG': $results[$key]['values'][$i] = $gemeldet + 1; $copy[$i] = $gemeldet + 1; $results[$key]['finished'] = true; break; // Redress given (Wiedergutmachung gewährt)
							// Strafen
//	Muss v. Hand						case 'SCP': $results[$key]['values'][$i] = $gemeldet + 1; $copy[$i] = $gemeldet + 1; $results[$key]['finished'] = true; break; // Wertungsstrafe nach 44.3(a) (20%)
//	Muss v. Hand						case 'DPI': $results[$key]['values'][$i] = $gemeldet + 1; $copy[$i] = $gemeldet + 1; $results[$key]['finished'] = true; break; // Punktstrafe nach Ermessen der Jury
							// Unbekannt
							default: $results[$key]['values'][$i] = 0; $copy[$i] = 0; break;
						}
						
						if ($results[$key]['values'][$i] != 0) {
							$results[$key]['texts'][$i] = $value['race' . $i] . ' (' . $results[$key]['values'][$i] . ')';
						} else {
							$results[$key]['texts'][$i] = $value['race' . $i] . ' (Unknown - 0)';
						}
					}
				}
				$results[$key]['values_all'] = $results[$key]['values'];
				for ($s = 0; $s < $regatta['streicher']; $s ++) {
					$max = max($copy);
					for ($i = 1; $i <= $regatta['races']; $i ++) {
						if ($copy[$i] == $max) {
							$copy[$i] = 0;
							break;
						}
					}
				}
				$brutto = $netto = 0;
				for ($i = 1; $i <= $regatta['races']; $i ++) {
					$brutto += $results[$key]['values_all'][$i];
					if     ($copy[$i] == -1) { $results[$key]['values'][$i] = $gemeldet + 1; }
					elseif ($copy[$i] == -2) { $results[$key]['values'][$i] = $gemeldet + 1; }
					else                     { $results[$key]['values'][$i] = $copy[$i]; }
					if ($results[$key]['values'][$i] == 0) {
						$results[$key]['texts'][$i] = '[' . $results[$key]['texts'][$i] . ']';
					}
					$netto += $results[$key]['values'][$i];
				}
				$results[$key]['brutto'] = $brutto;
				$results[$key]['netto'] = $netto;
				
				if ($results[$key]['finished']) {
					$sortarray[$key] = 0;
				} else {
					$sortarray[$key] = 1;
				}
				$sortarray[$key] /*.*/= sprintf("%08.2f", $netto);
				$temp = $results[$key]['values'];
				sort($temp);
				$i = 0;
				foreach ($temp as $val) {
					if ($i < $regatta['races']) {
						$sortarray[$key] .= sprintf("%07.2f", $val);
					}
					$i ++;
				}
				for ($i = $regatta['races']; $i > 0; $i --) {
					$sortarray[$key] .= sprintf("%07.2f", $results[$key]['values_all'][$i]);
				}
				$results[$key]['sortvalue'] = $sortarray[$key];
			}
			array_multisort($sortarray, $results);
			$i = 1;
			foreach ($results as $key => $value) {
				if (($i > 1) and ($sortarray[$key] == $sortarray[$lastkey])) {
					$results[$key]['place'] = $results[$lastkey]['place'];
				} else {
					$results[$key]['place'] = $i;
				}
				$i ++;
				$lastkey = $key;
			}
			unset ($sortarray);
			
			return $results;
		} else {
			return false;
		}
	}
	
	function update_result_cache($mysqli, $regatta_id) {
		$regatta = get_regatta($mysqli, $regatta_id);
		if ($regatta === false) return;
		$results = get_result_calculated($mysqli, $regatta['id']);
		if ($results === false) return;
		
		// count finished boats
		$fb = 0;
		foreach ($results as $result) {
			if ($result['finished']) {
				$fb ++;
			}
		}
		
		db_update_data($mysqli, BOATCLASS . DB_TABLE_SUFFIX_REGATTAS, ['finishedBoats' => $fb], '`id`="' . $regatta['id'] . '"', 1);
		
		foreach ($results as $result) {
			if ($fb == 0) {
				$rlp = 0;
			} else {
				$rlp = 100 * $regatta['rlf'] * (($fb + 1 - $result['place']) / $fb);
			}
			db_update_data($mysqli, BOATCLASS . DB_TABLE_SUFFIX_RESULTS, ['place' => $result['place'], 'rlp' => $rlp], '`id`="' . $result['id'] . '"', 1);
		}
	}
	
	function get_ranking($mysqli, $from, $to, $jugend = false, $jugstrict = false) {
		global $rankNoResults, $_CLASSES;
		$rankNoResults = array();
		
		$sailors = get_sailor($mysqli);
		$regattas = get_regattas_range($mysqli, $from, $to);
		
		if (($sailors !== false) and ($regattas !== false)) {
			foreach ($sailors as $key => $sailor) {
				$sailors[$key]['regattas'] = array();
				$sailors[$key]['tmp_rlp'] = array();
			}
			
			foreach ($regattas as $regatta) {
				$date = strtotime($regatta['date']);
				
				// regatta has to be min. 2 days to be ranking-regatta
				if ($regatta['length'] < 2) {
					continue;
				}
				
				$results = get_result($mysqli, $regatta['id']);
				if ($results === false) {
					continue;
				}
				
				if (count($results) <= 0) {
					if (strtotime('+' . ($regatta['length']-1) . ' days', $date) <= time()) {
						if (!$regatta['canceled']) {
							$rankNoResults[] = $regatta;
						}
					}
					continue;
				}
				
				// in one race there must be at least 10 boats started
				$ok = false;
				for ($i = 1; $i <= $regatta['races']; $i ++) {
					$temp = 0;
					foreach ($results as $result) {
						if (($result['race' . $i] != 'DNC') and ($result['race' . $i] != 'DNS')) {
							$temp ++;
						}
					}
					if ($temp >= 10) {
						$ok = true;
						break;
					}
				}
				if (!$ok) {
					continue;
				}
				
				$fb = $regatta['finishedBoats'];
				
				// add regatta to each sailor
				foreach ($results as $result) {
					if ($result['rlp'] == 0) {
						continue;
					}
					// check if crew is youth
					//if ($jugend) {
					//	$crew = explode(',', $result['crew']);
					//	$okay = true;
					//	foreach ($crew as $sailor) {
					//		if (($sailor == '') or !isset($sailors[$sailor])) continue;
					//		$sailor = $sailors[$sailor];
					//		if ((($sailor['year'] !== null) and ($sailor['year'] < (date('Y', $date) - $_CLASSES[BOATCLASS]['youth-age']))) or 
					//			(($sailor['year'] === null) and ($jugstrict))) {
					//				$okay = false;
					//				break;
					//		}
					//	}
					//	if (!$okay) continue;
					//}
					// calc m
					if ($regatta['m'] > 0) {
						$m = $regatta['m'];
					} elseif ($regatta['races'] <= 4) {
						$m = $regatta['races'];
					} else {
						if (($regatta['length'] > 2) and ($regatta['races'] >= 6)) {
							$m = 5;
						} else {
							$m = 4;
						}
					}
					$rlp = $result['rlp'];
					$sailors[$result['steuermann']]['regattas'][$regatta['id']] = array(
						'regatta' => $regatta['id'],
						'boat' => $result['boat'],
						'crew' => $result['crew'],
						'place' => $result['place'],
						'fb' => $fb,
						'rlp' => $rlp,
						'used' => 0,
						'm' => $m
					);
					for ($i = 0; $i < $m; $i ++) {
						array_push($sailors[$result['steuermann']]['tmp_rlp'], array($regatta['id'], $rlp));
					}
				}
			}
			
			foreach ($sailors as $key => $sailor) {
				if ($sailor['german'] == 0) {
					unset($sailors[$key]);
				} elseif ($jugend) {
					if ((($sailor['year'] !== null) and ($sailor['year'] < (date('Y', $to) - $_CLASSES[BOATCLASS]['youth-age']))) or 
						(($sailor['year'] === null) and ($jugstrict))) {
							unset($sailors[$key]);
					}
				}
			}
			
			$sortarray = array();
			
			foreach ($sailors as $key => $sailor) {
				// sort rlps desc
				$sort = array();
				foreach ($sailor['tmp_rlp'] as $key2 => $value) {
					$sort[$key2] = $value[1];
				}
				array_multisort($sort, SORT_DESC, $sailors[$key]['tmp_rlp']);
				// calc mean. rlp
				$sum = 0;
				$cnt = 0;
				foreach ($sailors[$key]['tmp_rlp'] as $value) {
					$sum += $value[1];
					$sailors[$key]['regattas'][$value[0]]['used'] ++;
					$cnt ++;
					if ($cnt >= 9) {
						break;
					}
				}
				unset($sailors[$key]['tmp_rlp']);
				if ($cnt > 0) {
					$rlp = $sum / $cnt;
					$sailors[$key]['rlp'] = $rlp;
					$sailors[$key]['m'] = $cnt;
				} else {
					unset($sailors[$key]);
					continue;
				}
				
				if ($rlp == 0) {
					$sortarray[$key] = $cnt;
				} else {
					$sortarray[$key] = $cnt * 1000 + $rlp;
				}
			}
			array_multisort($sortarray, SORT_DESC, $sailors);
			unset($sortarray);
			
			$i = 1;
			foreach ($sailors as $key => $sailor) {
				$sailors[$key]['rank'] = $i;
				$i ++;
			}
			
			return $sailors;
		} else {
			return false;
		}
	}
	
	function get_trim_boat($mysqli, $id = false) {
		return get_db_entry($mysqli, DB_TABLE_TRIM_BOATS, $id);
	}
	
	function get_trim_boat_users($mysqli, $id) {
		$result = db_get_data($mysqli, DB_TABLE_TRIM_USERS, '*', '`boat` = "' . mysqli_real_escape_string($mysqli, $id) . '"');
		if ($result === false)
			return false;
		else
			return $result;
	}
	
	function get_trim_user_boats($mysqli, $id) {
		$boats = db_get_data($mysqli, DB_TABLE_TRIM_USERS, '*', '`user` = "' . mysqli_real_escape_string($mysqli, $id) . '"');
		if ($boats === false) {
			return false;
		} else {
			$result = [];
			foreach ($boats as $value) {
				$result[$value['boat']] = get_trim_boat($mysqli, $value['boat']);
			}
			return $result;
		}
	}
	
	function trim_is_boat_user($mysqli, $user, $boat) {
		$res = db_get_data($mysqli, DB_TABLE_TRIM_USERS, '*', '`user` = "' . mysqli_real_escape_string($mysqli, $user) . '" AND `boat` = "' . mysqli_real_escape_string($mysqli, $boat) . '"');
		return ($res !== false) and (count($res) == 1);
	}
	
	function get_trim_trim($mysqli, $id = false) {
		return get_db_entry($mysqli, DB_TABLE_TRIM_TRIMS, $id);
	}
	
	function get_trim_boat_trims($mysqli, $id) {
		$result = db_get_data($mysqli, DB_TABLE_TRIM_TRIMS, '*', '`boat` = "' . mysqli_real_escape_string($mysqli, $id) . '"');
		if ($result === false) {
			return false;
		} else {
			return $result;
		}
	}
	
?>