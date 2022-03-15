module.exports = {
  Update: async function (key, token) {
    var Trello = require("trello");
    var trello = new Trello(key, token);

    // [Done] List from Tech Team board
    var doneListPromise = await trello.getCardsOnList('61f2c997e9218c1221b57024');
    if (!doneListPromise.length) { console.log('\x1b[36m%s\x1b[0m', "[Programme]: Tech Team's [Done] is empty. No update needed."); return; }
    var doneUrls = [];
    // doneUrls contain the list of short Url from Tech Team's [Done]
    console.log('\x1b[36m%s\x1b[0m', "[Programme]: Checking for Programme updates...");
    doneListPromise.forEach(async function (card) {
      var attachments = {};
      doneUrls.push(card.shortUrl);
      // check for attachments in the card if they contain intro / outro
      var attachPromise = await trello.getAttachmentsOnCard(card.id);
      attachments[card.shortUrl] = attachPromise;
      // console.log(JSON.stringify(attachments, null, 4));
      checkIntroNOutro(trello, key, token, attachments, card.name);
    });
    checkSermonNsingspiration(trello, key, token, doneUrls);
    setTimeout(() => console.log('\x1b[36m%s\x1b[0m', "[Programme]: Checking done... Changes made are before this line.")
      , 8 * 1000);
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
    if (text) { console.log('\x1b[36m%s\x1b[0m', `[Programme]: Updated checkItem from Card "${_mCard.name}":\n${JSON.stringify(simplifyOutput(text), null, 4)}`); }
  })
    .catch(err => console.error('\x1b[36m%s\x1b[0m', err));
}

async function checkSermonNsingspiration(_trello, _key, _token, _doneUrls) {
  // Programme Masterlist's [In Progress]
  var MasterListPromise = await _trello.getCardsOnList('62026f24210e8d7b341d9701');
  if (!MasterListPromise.length) { console.log('\x1b[36m%s\x1b[0m', "[Programme]: No ongoing work in Programme Masterlist's [In Progress]. No update needed."); return; }
  MasterListPromise.forEach(async function (mCard) {
    // Each Card in Masterlist's [In Progress]
    var checklistPromise = await _trello.getChecklistsOnCard(mCard.id);
    if (!checklistPromise.length) { return; }
    checklistPromise.forEach(check => {
      // Each checklist in each card
      if (!check.checkItems.length) { return; }
      // Each check Item in checklist
      check.checkItems.forEach(checkItem => {
        // console.log(JSON.stringify(`${mCard.name} > ${checkItem.name} > ${checkItem.state}`));
        if (checkItem.state == 'complete') return;
        // console.log(`${doneUrls.includes(checkItems.name)}\n${doneUrls}\n${checkItems.name}`);
        // PUT /1/cards/{idCard}/checklist/{idChecklist}/checkItem/{idCheckItem}/state
        if (_doneUrls.includes(checkItem.name)) {
          tickCheckItem(mCard, check.id, checkItem.id, _key, _token);
        }
      });
    });
  });
}

async function checkIntroNOutro(_trello, _key, _token, _attachments, _cardName) {
  // Programme Masterlist's [In Progress]
  var MasterListPromise = await _trello.getCardsOnList('62026f24210e8d7b341d9701');
  if (!MasterListPromise.length) { console.log('\x1b[36m%s\x1b[0m', "[Programme]: No ongoing work in Programme Masterlist's [In Progress]. No update needed."); return; }
  MasterListPromise.forEach(async function (mCard) {
    // Each Card in Masterlist's [In Progress]
    var checklistPromise = await _trello.getChecklistsOnCard(mCard.id);
    if (!checklistPromise.length) { return; }
    // Each checklist in each card
    checklistPromise.forEach(check => {
      if (!check.checkItems.length) { return; }
      // Each check Item in checklist
      var completedCheckitems = [];
      check.checkItems.forEach(checkItem => { checkItem.state == "complete" ? completedCheckitems.push(checkItem.name) : null; });
      check.checkItems.forEach(checkItem => {
        // If the shortUrl of the done Card found, find Intro n Outro checkItem in the checklist and tick it
        if (Object.keys(_attachments).includes(checkItem.name)) {
          var foundIO = {};
          check.checkItems.forEach(findIO => { foundIO[findIO.name] = findIO.id; })

          // console.log("-------------------------");
          // console.log(JSON.stringify(_attachments, null, 4));
          // console.log("-------------------------");
          // console.log(JSON.stringify(completedCheckitems, null, 4));

          for (var shortUrl in _attachments) {
            _attachments[shortUrl].forEach(async function (attached) {
              if (attached.fileName.match(/intro/) && !completedCheckitems.includes("Intro")) {
                // console.log('\x1b[33m%s\x1b[0m', `[Testing]: mCard=${mCard}, check=${check}, mCard=${mCard}, mCard=${mCard}, mCard=${mCard}, mCard=${mCard},`)
                tickCheckItem(mCard, check.id, foundIO["Intro"], _key, _token);
              }
              if (attached.fileName.match(/outro/) && !completedCheckitems.includes("Outro")) {
                tickCheckItem(mCard, check.id, foundIO["Outro"], _key, _token);
              }
            });
          };
        }
      });
    });
  });
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