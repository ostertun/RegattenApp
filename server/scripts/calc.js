var races = [];
var firstCall = true;

function reCalc() {
	setTimeout(function(){
		if (races.length > 0) {
			$('#card-races').show();
			$('#p-result').text('Berechne...');
			var rlps = [];
			var tbody = '';
			for (var i = 0; i < races.length; i ++) {
				tbody += '<tr>';
				tbody += '<td>' + races[i].rlf + '</td>';
				tbody += '<td>' + races[i].m + '</td>';
				tbody += '<td>' + races[i].fb + '</td>';
				tbody += '<td>' + races[i].pl + '</td>';
				tbody += '<td>' + races[i].rlp.toFixed(3) + '</td>';
				tbody += '<td><a href="#" onclick="removeRace(' + i + ')" class="btn rounded-s text-uppercase font-900 shadow-m bg-highlight"><i class="fas fa-times"></i></a></td>';
				tbody += '</tr>';
				for (var j = 0; j < races[i].m; j ++) {
					rlps.push(races[i].rlp);
				}
			}
			$('#table-races').find('tbody').html(tbody);
			rlps.sort(function (a,b) {
				return b-a;
			});
			var sum = 0;
			var cnt = Math.min(rlps.length, 9);
			for (var i = 0; i < cnt; i ++) {
				sum += rlps[i];
			}
			$('#p-result').html('<b>' + (sum / cnt).toFixed(3) + '</b> Punkte aus <b>' + cnt + '</b> Wertungen.');
		} else {
			$('#card-races').hide();
		}
	}, 0);
}

function addRace() {
	var rlf = parseFloat($('#input-rlf').val().replace(',', '.'));
	var m = parseFloat($('#input-m').val());
	var fb = parseFloat($('#input-fb').val());
	var pl = parseFloat($('#input-pl').val().replace(',', '.'));
	
	if (isNaN(rlf) || (rlf < 1) || (rlf > 1.6)) {
		toastError('RLF ungültig');
		return;
	}
	if (isNaN(m) || (m < 1) || (m > 5)) {
		toastError('m ungültig');
		return;
	}
	if (isNaN(fb) || (fb < 1)) {
		toastError('fb ungültig');
		return;
	}
	if (isNaN(pl) || (pl < 1) || (pl > (fb + 1))) {
		toastError('pl ungültig');
		return;
	}
	
	var race = {
		rlf: rlf,
		m: m,
		fb: fb,
		pl: pl,
		rlp: (100 * rlf * ((fb + 1 - pl) / fb))
	};
	
	$('#input-rlf').val('');
	$('#input-m').val('');
	$('#input-fb').val('');
	$('#input-pl').val('');
	
	races.push(race);
	reCalc();
}

function removeRace(id) {
	if ((id >= 0) && (id < races.length)) races.splice(id, 1);
	reCalc();
}

var siteScript = async function () {
	if (firstCall) {
		firstCall = false;
		$('#button-add').click(addRace);
	}
	reCalc();
	hideLoader();
}