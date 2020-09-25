// $$0; - site script for redraw content
// $$1; - current page
// $$2; - count of pages
// $$3; - pagination id

var paginationButtons = [];

function paginationSetActive() {
	for (i = 1; i <= 7; i ++) {
		if ($$1; == $('#$$3;-' + i).text()) {
			$('#$$3;-' + i).addClass('active');
		} else {
			$('#$$3;-' + i).removeClass('active');
		}
	}
}

function drawPagination() {
	if ($$2; > 1) {
		$('#$$3;').show();
		paginationButtons[6].text($$2;);
		if ($$2; <= 7) {
			for (i = 2; i <= $$2; - 1; i ++) {
				paginationButtons[i-1].text(i);
				$('#$$3;-' + i).show();
			}
			for (i = $$2;; i < 7; i ++) {
				$('#$$3;-' + i).hide();
			}
		} else if ($$1; <= 4) {
			for (i = 2; i <= 5; i ++) {
				paginationButtons[i-1].text(i);
				$('#$$3;-' + i).show();
			}
			paginationButtons[5].text('...');
			$('#$$3;-6').show();
		} else if ($$1; > $$2; - 4) {
			paginationButtons[1].text('...');
			$('#$$3;-2').show();
			for (i = 3; i <= 6; i ++) {
				paginationButtons[i-1].text($$2; + i - 7);
				$('#$$3;-' + i).show();
			}
		} else {
			paginationButtons[1].text('...');
			$('#$$3;-2').show();
			for (i = 3; i <= 5; i ++) {
				paginationButtons[i-1].text($$1; + i - 4);
				$('#$$3;-' + i).show();
			}
			paginationButtons[5].text('...');
			$('#$$3;-6').show();
		}
		paginationSetActive();
	} else {
		$('#$$3;').hide();
	}
}

function onPaginationClick(paginationButton) {
	var newPage = parseInt($(paginationButton).text());
	if (!isNaN(newPage)) {
		$$1; = newPage;
		drawPagination();
		$$0;();
	}
}

function initPagination() {
	paginationButtons = [];
	for (i = 1; i <= 7; i ++) {
		paginationButtons.push($('#$$3;-' + i).find('a'));
	}
	drawPagination();
}