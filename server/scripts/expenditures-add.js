let users = [];
let known = [];
let userSelectedCallback = null;
let excludeUsers = {};

function userSelected(id) {
    if (typeof userSelectedCallback === 'function') {
        userSelectedCallback(id);
    }
}

async function usersSearch() {
    $('.item-user-search').remove();
    if ($('#input-user-search').val().length == 0) {
        known.forEach(function (entry) {
            if (!(entry.id in excludeUsers)) {
                $('#menu-select-user').find('.content').find('.list-group').append(entry.content);
            }
        });
    }
    if ($('#input-user-search').val().length >= 3) {
        let cnt = 0;
        users.forEach(function (entry) {
            if (!(entry.id in excludeUsers) && search($('#input-user-search').val(), entry.keywords)) {
                $('#menu-select-user').find('.content').find('.list-group').append(entry.content);
                cnt++;
            }
        });
        if (cnt == 0) {
            let item = '<p class="item-user-search">Keine Benutzer gefunden.</p>';
            $('#menu-select-user').find('.content').find('.list-group').append(item);
        }
    } else {
        let item = '<p class="item-user-search">Zum Suchen mindestens 3 Zeichen eingeben</p>';
        $('#menu-select-user').find('.content').find('.list-group').append(item);
    }
}

function addRemoveToUser(userid) {
    $('.item-user-to[data-userid=' + userid + ']').remove();
}

async function expendituresInitModals() {
    $('#button-add-save').click(function () {
        showLoader();
        const jqUserFrom = $('#item-add-user-from');
        const userFrom = jqUserFrom.data('userid');
        const jqDate = $('#input-add-date');
        const purposeDate = jqDate.val();
        if (purposeDate == '') {
            hideLoader();
            toastError('Es wurde kein Datum ausgewählt!');
            jqDate.focus();
            return;
        }
        const jqAmount = $('#input-add-amount');
        const amount = jqAmount.val();
        if (amount == '') {
            hideLoader();
            toastError('Es wurde kein Betrag ausgewählt!');
            jqAmount.focus();
            return;
        }
        const purpose = $('#select-add-purpose').val();
        const regattaName = $('#input-add-regatta-name').val();
        const purposeText = $('#input-add-purpose-text').val();
        let usersTo = [];
        $('.item-user-to[data-userid]').each(function (index) {
            usersTo.push($(this).data('userid'));
        });
        let auth = {
            id: localStorage.getItem('auth_id'),
            hash: localStorage.getItem('auth_hash')
        }
        $.ajax({
            url: QUERY_URL + 'expenditures_add',
            method: 'POST',
            data: {
                auth: auth,
                user_from: userFrom,
                date: purposeDate,
                amount: Math.round(parseFloat(amount) * 100),
                purpose: purpose,
                regatta_name: regattaName,
                purpose_text: purposeText,
                users_to: usersTo
            },
            error: function (xhr, status, error) {
                if (xhr.status == 401) {
                    log('authentification failed');
                    toastError('Authentifizierung fehlgeschlagen. Versuche es erneut.');
                } else if (xhr.status == 0) {
                    toastError('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um die Ausgabe zu speichern');
                } else {
                    log('expenditures_add: unbekannter Fehler', status, error);
                    log(xhr);
                    toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
                }
                hideLoader();
            },
            success: async function (data, status, xhr) {
                await sync();
                updateExpendituresBadge();
                $('#menu-add').hideMenu();
                hideLoader();
                toastOk('Ausgabe gespeichert. Betrag wurde durch ' + data.count + ' Personen geteilt.');
            }
        });
    });
    $('#item-add-user-from').click(async function () {
        excludeUsers = {};
        $('#input-user-search').val('').trigger('focusin').trigger('focusout');
        usersSearch();
        userSelectedCallback = async function (userid) {
            $('#item-add-user-from').data('userid', userid).find('span').html('bezahlt von: ' + (await dbGetData('users', userid)).username);
            $('#menu-select-user').hideMenu();
            $('#menu-add').showMenu();
        }
        $('#menu-add').hideMenu();
        $('#menu-select-user').showMenu();
        $('#input-user-search').focus();
    });
    $('#item-add-user-to').click(async function () {
        excludeUsers = {};
        $('.item-user-to[data-userid]').each(function (index) {
            excludeUsers[$(this).data('userid')] = true;
        });
        $('#input-user-search').val('').trigger('focusin').trigger('focusout');
        usersSearch();
        userSelectedCallback = async function (userid) {
            let item = '<a class="item-user-to" data-userid="' + userid + '" onclick="addRemoveToUser(' + userid + ')">';
            item += '<span>' + (await dbGetData('users', userid)).username + '</span>';
            item += '<i class="fa fa-times"></i>';
            item += '</a>';
            $('#item-add-user-to').before(item);
            $('#menu-select-user').hideMenu();
            $('#menu-add').showMenu();
        }
        $('#menu-add').hideMenu();
        $('#menu-select-user').showMenu();
        $('#input-user-search').focus();
    });

    $('#button-add-transfer-save').click(function () {
        showLoader();
        const jqUser = $('#item-add-transfer-user');
        const selectedUser = jqUser.data('userid');
        if (selectedUser == 0) {
            hideLoader();
            toastError('Es wurde keine Person ausgewählt!');
            return;
        }
        const jqDate = $('#input-add-transfer-date');
        const selectedDate = jqDate.val();
        if (selectedDate == '') {
            hideLoader();
            toastError('Es wurde kein Datum ausgewählt!');
            jqDate.focus();
            return;
        }
        const jqAmount = $('#input-add-transfer-amount');
        const selectedAmount = jqAmount.val();
        if (selectedAmount == '') {
            hideLoader();
            toastError('Es wurde kein Betrag ausgewählt!');
            jqAmount.focus();
            return;
        }
        const jqPurposeText = $('#input-add-transfer-purpose-text');
        const selectedPurposeText = jqPurposeText.val();
        const jqSwitch = $('#switch-add-transfer-received');
        const direction = jqSwitch.prop('checked');
        let auth = {
            id: localStorage.getItem('auth_id'),
            hash: localStorage.getItem('auth_hash')
        }
        $.ajax({
            url: QUERY_URL + 'expenditures_add_transfer',
            method: 'POST',
            data: {
                auth: auth,
                direction: direction ? 1 : -1,
                userid: selectedUser,
                date: selectedDate,
                amount: Math.round(parseFloat(selectedAmount) * 100),
                purpose_text: selectedPurposeText
            },
            error: function (xhr, status, error) {
                if (xhr.status == 401) {
                    log('authentification failed');
                    toastError('Authentifizierung fehlgeschlagen. Versuche es erneut.');
                } else if (xhr.status == 0) {
                    toastError('Du bist momentan offline.<br>Stelle eine Internetverbindung her, um den Geldtransfer zu speichern');
                } else {
                    log('expenditures_add_transfer: unbekannter Fehler', status, error);
                    log(xhr);
                    toastError('Ein unbekannter Fehler ist aufgetreten. Bitte versuche es noch einmal', 5000);
                }
                hideLoader();
            },
            success: async function (data, status, xhr) {
                await sync();
                updateExpendituresBadge();
                $('#menu-add-transfer').hideMenu();
                hideLoader();
                toastOk(direction ? 'Geldtransfer gespeichert. ' + (await dbGetData('users', selectedUser)).username + ' muss dies noch bestätigen' : 'Geldtransfer wurde gespeichert');
            }
        });
    });
    $('#switch-add-transfer-received').parent().parent().click(async function () {
        const jqSwitch = $('#switch-add-transfer-received');
        const jqUser = $('#item-add-transfer-user');
        const direction = jqSwitch.prop('checked');
        jqSwitch.parent().prev().text(direction ? 'Geld gegeben' : 'Geld bekommen').prev().removeClass('fa-arrow-' + (direction ? 'left' : 'right')).addClass('fa-arrow-' + (direction ? 'right' : 'left'));
        const selectedUser = jqUser.data('userid');
        if (selectedUser == 0) {
            jqUser.find('span').html((direction ? 'an: ' : 'von: ') + '<font style="font-style:italic;">bitte auswählen</font>');
        } else {
            jqUser.find('span').text((direction ? 'an: ' : 'von: ') + (await dbGetData('users', selectedUser)).username);
        }
    });
    $('#item-add-transfer-user').click(async function () {
        excludeUsers = {};
        excludeUsers[USER_ID] = true;
        $('#input-user-search').val('').trigger('focusin').trigger('focusout');
        usersSearch();
        userSelectedCallback = async function (userid) {
            const direction = $('#switch-add-transfer-received').prop('checked');
            $('#item-add-transfer-user').data('userid', userid).find('span').html((direction ? 'an: ' : 'von: ') + (await dbGetData('users', userid)).username);
            $('#menu-select-user').hideMenu();
            $('#menu-add-transfer').showMenu();
        }
        $('#menu-add-transfer').hideMenu();
        $('#menu-select-user').showMenu();
        $('#input-user-search').focus();
    });

    $('#input-user-search').on('input', usersSearch);

    users = [];
    known = [];
    let itemMe = '<a class="item-user-search" onclick="userSelected(' + USER_ID + ')">';
    itemMe += '<span>ICH (' + USER_NAME + ')</span>';
    itemMe += '<i class="fa fa-angle-right"></i>';
    itemMe += '</a>';
    known.push({id: USER_ID, content: itemMe});
    let knownIds = {};
    let allExps = await dbGetData('expenditures');
    let expUsers = {};
    for (let i in allExps) {
        let exp = allExps[i];
        let eUId = exp.user;
        if (!(eUId in expUsers)) {
            expUsers[eUId] = {
                userId: eUId,
                username: (await dbGetData('users', eUId)).username,
                cnt: 0
            };
        }
        expUsers[eUId].cnt++;
    }
    expUsers = Object.values(expUsers);
    expUsers.sort(function (a, b) {
        return a.username.localeCompare(b.username);
    });
    for (let i in expUsers) {
        knownIds[expUsers[i].userId] = true;
    }
    const dbUsers = await dbGetData('users');
    dbUsers.sort(function (a, b) {
        return a.username.localeCompare(b.username);
    });
    for (let i in dbUsers) {
        let item = '<a class="item-user-search" onclick="userSelected(' + dbUsers[i].id + ')">';
        item += '<span>' + dbUsers[i].username + '</span>';
        item += '<i class="fa fa-angle-right"></i>';
        item += '</a>';
        users.push({
            keywords: [dbUsers[i].username],
            id: dbUsers[i].id,
            content: item
        });
        if (dbUsers[i].id in knownIds) known.push({id: dbUsers[i].id, content: item});
    }

    $('#input-add-regatta-name').attr('list', 'list-regattas');
    let listRegattas = $('<datalist id="list-regattas">').appendTo('body');
    let plannings = await dbGetDataIndex('plannings', 'user', USER_ID);
    let regattas = [];
    for (let i in plannings) {
        let regatta = await dbGetData('regattas', plannings[i].regatta);
        regatta.year = formatDate('Y', parseDate(regatta.date));
        regattas.push(regatta);
    }
    regattas.sort(function (a, b) {
        if (a.year != b.year) return b.year - a.year;
        return a.name.localeCompare(b.name);
    });
    for (let i in regattas) {
        $('<option>').attr('value', regattas[i].name).appendTo(listRegattas);
    }
}

async function expendituresShowAdd(defaultUser = 0) {
    $('#item-add-user-from').data('userid', USER_ID).find('span').html('bezahlt von: ' + USER_NAME);
    $('#input-add-date').val(formatDate('Y-m-d')).trigger('focusin');
    $('#input-add-amount').val('');
    $('#select-add-purpose').val('entryfee');
    $('#input-add-regatta-name').val('');
    $('#input-add-purpose-text').val('');
    $('.item-user-to').remove();
    let item = '<a class="item-user-to" data-userid="' + USER_ID + '" onclick="addRemoveToUser(' + USER_ID + ')">';
    item += '<span>' + USER_NAME + '</span>';
    item += '<i class="fa fa-times"></i>';
    item += '</a>';
    $('#item-add-user-to').before(item);
    if (defaultUser > 0) {
        item = '<a class="item-user-to" data-userid="' + defaultUser + '" onclick="addRemoveToUser(' + defaultUser + ')">';
        item += '<span>' + (await dbGetData('users', defaultUser)).username + '</span>';
        item += '<i class="fa fa-times"></i>';
        item += '</a>';
        $('#item-add-user-to').before(item);
    }
    $('#menu-add').showMenu();
}

async function expendituresShowAddTransfer(defaultUser = 0, defaultDirection = true, defaultAmount = '') {
    $('#switch-add-transfer-received').prop('checked', defaultDirection).parent().prev().text(defaultDirection ? 'Geld gegeben' : 'Geld bekommen').prev().removeClass(defaultDirection ? 'fa-arrow-left' : 'fa-arrow-right').addClass(defaultDirection ? 'fa-arrow-right' : 'fa-arrow-left');
    if (defaultUser == 0) {
        $('#item-add-transfer-user').data('userid', 0).find('span').html((defaultDirection ? 'an: ' : 'von: ') + '<font style="font-style:italic;">bitte auswählen</font>');
    } else {
        $('#item-add-transfer-user').data('userid', defaultUser).find('span').html((defaultDirection ? 'an: ' : 'von: ') + (await dbGetData('users', defaultUser)).username);
    }
    $('#input-add-transfer-date').val(formatDate('Y-m-d')).trigger('focusin');
    $('#input-add-transfer-amount').val(defaultAmount).trigger('focusin').trigger('focusout');
    $('#input-add-transfer-purpose-text').val('');
    $('#menu-add-transfer').showMenu();
}
