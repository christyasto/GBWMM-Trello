// IDs
var headerCards = ["61f9fda7894f9255b3ab1210", "61fe8a74e7c9c23e9a2ca2ae", "621b28558f055003a76f0c81"];
var techBoardID = "61f2c9505d6e7a72cc0b7ca0";
var sermonListID = "61f9f9bc2624146d0be7012a", singsListID = "61f76825e2e2de1391514626", techListID = "6220277ec36e3c7dfe6c25da";
var TsermonListID = "622f75a2bf412b66db6a5001", TsingsListID = "622f759870f4002b9b67b9bc";

module.exports = {
    Update: async function (key, token) {
        var Trello = require("trello");
        var trello = new Trello(key, token);

        var allCards = [];

        // Get ALL original copies into allCards
        var singCardPromise = await trello.getCardsOnList(singsListID);
        var sermonCardPromise = await trello.getCardsOnList(sermonListID);
        singCardPromise.forEach(singCard => { !headerCards.includes(singCard.id) ? allCards.push(singCard) : null; });
        sermonCardPromise.forEach(sermonCard => { !headerCards.includes(sermonCard.id) ? allCards.push(sermonCard) : null; });
        if (!allCards.length) { console.log('\x1b[33m%s\x1b[0m', `[Automation]: no new cards found, no updates done...`); return; }
        for (var card of allCards) { moveCard(card, key, token); };
    }
}

function moveCard(_card, _key, _token) {
    const fetch = require('cross-fetch');
    fetch(`https://api.trello.com/1/cards/${_card.id}?idBoard=${techBoardID}&idList=${techListID}&key=${_key}&token=${_token}&value=true`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        console.log('\x1b[33m%s\x1b[0m',
            `[Automation]: Response - ${response.status} ${response.statusText}`
        );
        if (response.status == 200) { console.log('\x1b[33m%s\x1b[0m', "[Automation]: Card move approved!"); return response.text() }
        else return null;
    }).then(text => text ? console.log('\x1b[33m%s\x1b[0m', `[Automation]: Card "${_card.name}" moved:\n${JSON.stringify(simplifyOutput(text), null, 4)}`) : null)
        .catch(err => console.error('\x1b[33m%s\x1b[0m', err));
}

function simplifyOutput(_text) {
    var textObj = JSON.parse(_text);
    var newText = {
        name: textObj.name,
        id: textObj.id,
        idBoard: textObj.idBoard,
        idList: textObj.idList,
        shortUrl: textObj.shortUrl
    }
    return newText;
}
