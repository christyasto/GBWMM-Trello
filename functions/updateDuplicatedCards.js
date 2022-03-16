const { difference } = require("lodash");

module.exports = {
  Update: async function (key, token, org_members) {
    var Trello = require("trello");
    var trello = new Trello(key, token);

    // IDs
    var sermonBoardID = "61f6563244c03a134fe8ccc6", singsBoardID = "61f6563ed7993620ea668677", techBoardID = "61f2c9505d6e7a72cc0b7ca0";
    var techCards = [];
    var oriCardsID = [], oriCards = {};

    // Get list of cards from Tech Board
    var techCardPromise = await trello.getCardsOnBoard(techBoardID);
    techCardPromise.forEach(techCard => {
      if (techCard.desc.match(/\[Automation\]: copied/)) {
        techCards.push(techCard);
        oriCardsID.push(techCard.desc.match(/\{([^}]+)\}/)[1]);
      }
    })

    // Get ALL original copies into oriCards
    var singCardPromise = await trello.getCardsOnBoard(singsBoardID);
    var sermonCardPromise = await trello.getCardsOnBoard(sermonBoardID);
    singCardPromise.forEach(singCard => { if (oriCardsID.includes(singCard.id)) oriCards[singCard.id] = singCard; });
    sermonCardPromise.forEach(sermonCard => { if (oriCardsID.includes(sermonCard.id)) oriCards[sermonCard.id] = sermonCard; });

    // console.log('\x1b[33m%s\x1b[0m', `[Duplication]: ${oriCardsID[0]}`);
    // console.log('\x1b[33m%s\x1b[0m', `[Duplication]: ${oriCards[oriCardsID[0]]}`);

    var trigger = 0;
    for (var i = 0; i < techCards.length; i++) {
      trigger += updatePairedCard(techCards[i], oriCards[oriCardsID[i]], trello, key, token);
    }
    if (!trigger) console.log('\x1b[33m%s\x1b[0m', `[Duplication]: Nothing changed from previous update...`);
  }
}

function updatePairedCard(_techCard, _oriCard, _trello, _key, _token) {
  // console.log('\x1b[33m%s\x1b[0m', `[Duplication]: ${JSON.stringify(_oriCard, null, 4)}`);
  var diffs = checkDifferences(_techCard, _oriCard);
  if (!diffs.keys().length) { updateOri(_techCard, _oriCard, diffs, _trello, _key, _token); return 1; }
  return 0;
}

async function checkDifferences(_techCard, _oriCard) {
  var _diffs = {};
  var _keyDiffs = ["name", "desc", "closed", "idMembers", "idAttachmentCover", "idLabels", "due", "dueComplete"];
  var customFields = ["comment", "checklist", "attachments", "members"];
  return _diffs;

}

async function updateOri(_techCard, _oriCard, _diffs, _trello, _key, _token) {
  // trello.updateCard( _oriCard, "field", "value");
  var logger;
  _diffs.keys().forEach(async keyDiff => {
    logger = await _trello.updateCard(_oriCard.id, keyDiff, _techCard[keyDiff]);
  });
  console.log('\x1b[33m%s\x1b[0m', `[Duplication]: Updated "${_oriCard.name}"\n${JSON.stringify(logger, null, 4)}`);
}