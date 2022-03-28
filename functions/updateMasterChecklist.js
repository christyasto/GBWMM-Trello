const { lowerCase } = require("lodash");

module.exports = {
  Update: async function (key, token) {
    var Trello = require("trello");
    var trello = new Trello(key, token);
    var doneUrls = [], IOcardnames = [];

    console.log('\x1b[36m%s\x1b[0m', "[Programme]: Checking for Programme updates...");

    // [Done] List from Tech Team board
    var doneListPromise = await trello.getCardsOnList('61f2c997e9218c1221b57024');
    if (!doneListPromise.length) console.log('\x1b[36m%s\x1b[0m', "[Programme]: Tech Team's [Done] is empty. No update needed.");
    else {
      for (var card of doneListPromise) { doneUrls.push(card.shortUrl); }
      // checkSermonNsingspiration(trello, key, token, IOcardnames);
    }

    var IOPromise = await trello.getCardsOnList('61f9f995a3be2b36d01f83fe');
    if (!IOPromise.length) console.log('\x1b[36m%s\x1b[0m', "[Programme]: No Intro / Outro Card found. No update needed.");
    else {
      for (var card of IOPromise) { card.name.match(/Intro & Outro/) ? IOcardnames.push(card.name.match(/\((.*?)\)/)[1]) : null; }
      // console.log(JSON.stringify(IOcardnames, null, 4));
      checkIntroNOutro(trello, key, token, IOcardnames);
    }
  }
}

function tickCheckItem(_mCard, _check, _checkItem, _key, _token) {
  const fetch = require('cross-fetch');
  fetch(`https://api.trello.com/1/cards/${_mCard.id}/checklist/${_check}/checkItem/${_checkItem}/state?key=${_key}&token=${_token}&value=true`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json'
    }
  }).then(response => {
    console.log('\x1b[36m%s\x1b[0m',
      `[Programme]: Response - ${response.status} ${response.statusText}`
    );
    if (response.status == 200) {
      console.log('\x1b[36m%s\x1b[0m', "[Programme]: Master checklist updated!");
      return response.text();
    }
    else return null;
  }).then(text => {
    if (text) { console.log('\x1b[36m%s\x1b[0m', `[Programme]: Updated checkItem from Card "${_mCard.name}" in Programme Masterlist's [In Progress]:\n${JSON.stringify(simplifyOutput(text), null, 4)}`); }
  })
    .catch(err => console.error('\x1b[36m%s\x1b[0m', err));
}

async function checkSermonNsingspiration(_trello, _key, _token, _doneUrls) {
  var counter = 0;
  // Programme Masterlist's [In Progress]
  var MasterListPromise = await _trello.getCardsOnList('62026f24210e8d7b341d9701');
  if (!MasterListPromise.length) { console.log('\x1b[36m%s\x1b[0m', "[Programme]: No ongoing work in Programme Masterlist's [In Progress]. No update needed."); return; }
  for (var mCard of MasterListPromise) {
    // Each Card in Masterlist's [In Progress]
    var checklistPromise = await _trello.getChecklistsOnCard(mCard.id);
    if (!checklistPromise.length) { return; }
    for (var check of checklistPromise) {
      // Each checklist in each card
      if (!check.checkItems.length) { return; }
      // Each check Item in checklist
      for (var checkItem of check.checkItems) {
        // console.log(JSON.stringify(`${mCard.name} > ${checkItem.name} > ${checkItem.state}`));
        if (checkItem.state == 'complete') return;
        // console.log(`${doneUrls.includes(checkItems.name)}\n${doneUrls}\n${checkItems.name}`);
        if (_doneUrls.includes(checkItem.name)) {
          tickCheckItem(mCard, check.id, checkItem.id, _key, _token);
          counter++;
        }
      };
    };
  };
  !counter ? console.log('\x1b[36m%s\x1b[0m', "[Programme]: No matching cards... No updates were done.") : null;
}

async function checkIntroNOutro(_trello, _key, _token, _IOcardnames) {
  var counter = 0;
  var _IOList = [];

  for (var IOname of _IOcardnames) {
    for (var i = 1; i < parseInt(IOname.match(/#.\-(.+)/)[1]) + 1; i++) _IOList.push(lowerCase(`${IOname.match(/(.*?) #/)[1]} #${i}`));
  }
  // Programme Masterlist's [In Progress]
  var MasterListPromise = await _trello.getCardsOnList('62026f24210e8d7b341d9701');
  if (!MasterListPromise.length) { console.log('\x1b[36m%s\x1b[0m', "[Programme]: No ongoing work in Programme Masterlist's [In Progress]. No update needed."); return; }
  for (var mCard of MasterListPromise) {
    // Each Card in Masterlist's [In Progress]
    if (!_IOList.includes(lowerCase(mCard.name))) continue;
    var checklistPromise = await _trello.getChecklistsOnCard(mCard.id);
    if (!checklistPromise.length) { continue; }
    for (var check of checklistPromise) {
      // Each checklist in each card
      if (!check.checkItems.length) { continue; }
      // Each check Item in checklist
      for (var checkItem of check.checkItems) {
        // console.log(JSON.stringify(`${mCard.name} > ${checkItem.name} > ${checkItem.state}`));
        if (checkItem.state == 'complete') continue;
        // console.log(`${doneUrls.includes(checkItems.name)}\n${doneUrls}\n${checkItems.name}`);
        if (checkItem.name == 'Intro' || checkItem.name == 'Outro') {
          tickCheckItem(mCard, check.id, checkItem.id, _key, _token);
          counter++;
        }
      };
    };
  };
  !counter ? console.log('\x1b[36m%s\x1b[0m', "[Programme]: No new Intro & Outro input... No updates were done.") : null;
}

function simplifyOutput(_text) {
  var textObj = JSON.parse(_text);
  // console.log(JSON.stringify(textObj, null, 4))
  var newText = {
    name: textObj.name,
    id: textObj.id,
    idChecklist: textObj.idChecklist,
    state: textObj.state
  }
  return newText;
}