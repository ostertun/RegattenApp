function parseDate(string) {
	var year, month, day;
	if (string.includes('.')) {
		var split = string.split('.');
		if (split.length != 3) return null;
		year = parseInt(split[2]);
		month = parseInt(split[1]);
		day = parseInt(split[0]);
	} else if (string.includes('/')) {
		var split = string.split('/');
		if (split.length != 3) return null;
		year = parseInt(split[2]);
		month = parseInt(split[0]);
		day = parseInt(split[1]);
	} else if (string.includes('-')) {
		var split = string.split('-');
		if (split.length != 3) return null;
		if (split[2].length > 2) {
			year = parseInt(split[2]);
			month = parseInt(split[1]);
			day = parseInt(split[0]);
		} else {
			year = parseInt(split[0]);
			month = parseInt(split[1]);
			day = parseInt(split[2]);
		}
	} else {
		return null;
	}

	if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
	if (year.toString().length == 2) year = (year < 70 ? 2000 : 1900) + year;
	if ((year < 1970) || (year > 3000)) return null;
	if ((month < 1) || (month > 12)) return null;
	if ((day < 1) || (day > 31)) return null;

	var date = new Date(Date.UTC(year, month - 1, day));
	return date;
}

function getToday() {
	var date = new Date();
	date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	return date;
}

function formatDate(format, date = null) {
	if (date === null) {
		date = new Date();
	} else {
		date = new Date(date.valueOf());
		date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
	}

	format = format.replace("M", "%1%");
	format = format.replace("F", "%2%");
	format = format.replace("D", "%3%");
	format = format.replace("l", "%4%");

	var tmp = date.getFullYear().toString();
	var tmp2 = tmp.substr(2);
	format = format.replace("Y", tmp);
	format = format.replace('y', tmp2);

	tmp = (date.getMonth() + 1).toString();
	tmp2 = (tmp.length > 1 ? tmp : ('0' + tmp));
	format = format.replace('n', tmp);
	format = format.replace('m', tmp2);

	tmp = date.getDate().toString();
	tmp2 = (tmp.length > 1 ? tmp : ('0' + tmp));
	format = format.replace('j', tmp);
	format = format.replace('d', tmp2);

	tmp = date.getDay();
	tmp2 = (tmp == 0 ? 7 : tmp);
	format = format.replace('w', tmp);
	format = format.replace('N', tmp2);

	format = format.replace('%1%', strings.months_short[date.getMonth()]);
	format = format.replace('%2%', strings.months_long[date.getMonth()]);

	format = format.replace('%3%', strings.weekdays_short[date.getDay()]);
	format = format.replace('%4%', strings.weekdays_long[date.getDay()]);

	return format;
}
