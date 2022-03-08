module.exports = {
    Update: async function (key, token, org_members) {
        var Trello = require("trello");
        var trello = new Trello(key, token);

        // IDs
        var headerCards = ["621b28558f055003a76f0c81", "61f9fda7894f9255b3ab1210", "61fe8a74e7c9c23e9a2ca2ae"];
        var singsListID = "61f76825e2e2de1391514626", techListID = "6220277ec36e3c7dfe6c25da", sermonListID = "61f9f9bc2624146d0be7012a";
        var techToDos = [];

        // Get list of card Names in Tech Team's [To Do]
        var techCardPromise = await trello.getCardsOnList(techListID);
        techCardPromise.forEach(techCard => {
            techToDos.push(techCard.name);
        })

        // Get cards from singspiration's [Send to Editing Team]
        getSingspirationCards(singsListID, techListID, techToDos, headerCards, trello, key, token);

        // Get cards from Sermon's [Video Editing / Filming]
        getSermonCards(sermonListID, techListID, techToDos, headerCards, trello, key, token);
    }
}

async function getSingspirationCards(_singsListID, _techListID, _techToDos, _headerCards, _trello, _key, _token) {
    var singCardPromise = await _trello.getCardsOnList(_singsListID);
    var trigger = 0;
    if (!singCardPromise.length) { console.log('\x1b[33m%s\x1b[0m', "[Duplication]: Nothing found in Song Team's [Send to Editing Team]. No checking needed."); return; }
    singCardPromise.forEach(singCard => {
        if (!_headerCards.includes(singCard.id) && !_techToDos.includes(singCard.name) && !singCard.desc.match(/copied/)) {
            // console.log('\x1b[33m%s\x1b[0m', `[Duplication]: ${JSON.stringify(singCard, null, 4)}`);
            trigger++;
            copyCardToTechTeam(_trello, _techListID, singCard, _key, _token, "Singspiration")
        }
    });
    if (!trigger) console.log('\x1b[33m%s\x1b[0m', "[Duplication]: No new cards found in Song Team's [Send to Editing Team]. No duplications needed.");

}

async function getSermonCards(_sermonListID, _techListID, _techToDos, _headerCards, _trello, _key, _token) {
    var sermonCardPromise = await _trello.getCardsOnList(_sermonListID);
    var trigger = 0;
    if (!sermonCardPromise.length) { console.log('\x1b[33m%s\x1b[0m', "[Duplication]: Nothing found in Sermon Team's [Video Editing / Filming]. No checking needed."); return; }
    sermonCardPromise.forEach(sermonCard => {
        if (!_headerCards.includes(sermonCard.id) && !_techToDos.includes(sermonCard.name) && !sermonCard.desc.match(/copied/)) {
            // console.log('\x1b[33m%s\x1b[0m', `[Duplication]: ${JSON.stringify(sermonCard, null, 4)}`);
            trigger++;
            copyCardToTechTeam(_trello, _techListID, sermonCard, _key, _token, "Sermon")
        }
    });
    if (!trigger) console.log('\x1b[33m%s\x1b[0m', "[Duplication]: No new cards found in Sermon Team's [Video Editing / Filming]. No duplications needed.");

}

function copyCardToTechTeam(_trello, _targetListID, _card, _key, _token, _team) {
    const fetch = require('cross-fetch');
    fetch(`https://api.trello.com/1/cards?name=${_card.name}&due=${_card.due}&idList=${_targetListID}&idMembers=${_card.idMembers}&idLabels=${_card.idLabels}&idCardSource=${_card.id}&keepFromSource=all&key=${_key}&token=${_token}&value=true`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }

    }).then(async function (response) {
        console.log('\x1b[33m%s\x1b[0m', `[Duplication]: Response - ${response.status + 1} ${response.statusText}`);
        if (response.status == 200) {
            console.log('\x1b[33m%s\x1b[0m', `[Duplication]: "${_card.name}" card duplicated from ${_team}'s Board!`);
            var newCardPromise = await response.text();
            var newCard = JSON.parse(newCardPromise);
            var desc = _card.desc + "\n [Automation]: " + `copied from: {${_card.id}}`;
            var updateNewDescPromise = await _trello.updateCard(newCard.id, "desc", desc);
            console.log('\x1b[33m%s\x1b[0m', `[Duplication]: New duplicated card "${_card.name}":\n${JSON.stringify(updateNewDescPromise, null, 4)}`);
            updateCopiedCard(_trello, newCard.id, _card, _trello, _key, _token, _team);
        }
    }).catch(err => console.error('\x1b[33m%s\x1b[0m', err));
}

async function updateCopiedCard(_trello, _newID, _card, _trello, _key, _token, _team) {
    var desc = _card.desc + "\n [Automation]: " + `copied to: {${_newID}}`;
    var updateOldDescPromise = await _trello.updateCard(_card.id, "desc", desc);
    console.log('\x1b[33m%s\x1b[0m', `[Duplication]: Updated original card "${_card.name}"'s desc:\n${updateOldDescPromise.desc}`);
}