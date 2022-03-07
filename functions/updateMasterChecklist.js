module.exports = {
  Update: function (key, token) {
    var Trello = require("trello");
    var trello = new Trello(key, token);
    // [Done] List from Tech Team board
    var DoneListPromise = trello.getCardsOnList('61f2c997e9218c1221b57024');
    DoneListPromise.then((cards) => {
      var doneLength = cards.length, doneCount = 0;
      if (!doneLength) { console.log('\x1b[36m%s\x1b[0m', "[Programme]: Tech Team's [Done] is empty. No update needed."); return; }

      var doneUrls = [];
      var doneAttach = [], attachUrls = [];
      var attachments = {};
      // doneUrls contain the list of short Url from Tech Team's [Done]
      cards.forEach(card => {
        doneCount++;
        doneUrls.push(card.shortUrl);
        // check for attachments in the card if they contain intro / outro
        var attachPromise = trello.getAttachmentsOnCard(card.id);
        attachPromise.then(attached => {
          if (!attached.length) { return; }
          attachments[card.shortUrl] = attached;
          if (doneCount == doneLength) {
            checkIntroNOutro(trello, key, token, attachments);
          }
        });
      });
      checkSermonNsingspiration(trello, key, token, doneUrls);
    });
    console.log('\x1b[36m%s\x1b[0m', "[Programme]: Checking for Programme updates...");
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
    console.log('\x1b[36m%s\x1b[0m', "[Programme]: Master checklist updated!")
    return response.text();
  }).then(text => console.log('\x1b[36m%s\x1b[0m', `[Programme]: Updated checkItem from Card "${_mCard.name}":\n${JSON.stringify(JSON.parse(text), null, 4)}`))
    .catch(err => console.error('\x1b[36m%s\x1b[0m', err));
}

function checkSermonNsingspiration(_trello, _key, _token, _doneUrls) {
  var counter = 0;
  // Programme Masterlist's [In Progress]
  var MasterListPromise = _trello.getCardsOnList('62026f24210e8d7b341d9701');
  MasterListPromise.then((mCards) => {
    if (!mCards.length) { console.log('\x1b[36m%s\x1b[0m', "[Programme]: No ongoing work in Programme Masterlist's [In Progress]. No update needed."); return; }
    // Each Card in Masterlist's [In Progress]
    mCards.forEach(mCard => {
      var checklistPromise = _trello.getChecklistsOnCard(mCard.id);
      checklistPromise.then((cList) => {
        if (!cList.length) { return; }
        // Each checklist in each card
        cList.forEach(check => {
          if (!check.checkItems.length) { return; }
          // Each check Item in checklist
          check.checkItems.forEach(checkItem => {
            if (checkItem.state == 'complete') return;
            // console.log(`${doneUrls.includes(checkItems.name)}\n${doneUrls}\n${checkItems.name}`);
            // PUT /1/cards/{idCard}/checklist/{idChecklist}/checkItem/{idCheckItem}/state
            if (_doneUrls.includes(checkItem.name)) {
              counter++;
              tickCheckItem(mCard, check.id, checkItem.id, _key, _token);
            }
          });
        });
      });
    });
  });
  if (!counter) { console.log('\x1b[36m%s\x1b[0m', "[Programme]: No matching cards... No updates were done.") }
}

function checkIntroNOutro(_trello, _key, _token, _attachments) {
  var counter = 0;
  // Programme Masterlist's [In Progress]
  var MasterListPromise = _trello.getCardsOnList('62026f24210e8d7b341d9701');
  MasterListPromise.then((mCards) => {
    if (!mCards.length) { console.log('\x1b[36m%s\x1b[0m', "[Programme]: No ongoing work in Programme Masterlist's [In Progress]. No update needed."); return; }
    // Each Card in Masterlist's [In Progress]
    mCards.forEach(mCard => {
      var checklistPromise = _trello.getChecklistsOnCard(mCard.id);
      checklistPromise.then((cList) => {
        if (!cList.length) { return; }
        // Each checklist in each card
        cList.forEach(check => {
          if (!check.checkItems.length) { return; }
          // Each check Item in checklist
          check.checkItems.forEach(checkItem => {
            // If the shortUrl of the done Card found, find Intro n Outro checkItem in the checklist and tick it
            if (Object.keys(_attachments).includes(checkItem.name)) {
              var foundIO = {};
              check.checkItems.forEach(findIO => { foundIO[findIO.name] = findIO.id; })
              for (var cardID in _attachments) {
                _attachments[cardID].forEach(attached => {
                  if (attached.fileName.match(/intro/)) {
                    // console.log('\x1b[33m%s\x1b[0m', `[Testing]: mCard=${mCard}, check=${check}, mCard=${mCard}, mCard=${mCard}, mCard=${mCard}, mCard=${mCard},`)
                    tickCheckItem(mCard, check.id, foundIO["Intro"], _key, _token);
                    counter++;
                  }
                  else if (attached.fileName.match(/outro/)) {
                    tickCheckItem(mCard, check.id, foundIO["Outro"], _key, _token);
                    counter++;
                  }
                });
              };
            }
          });
        });
      });
    });
  });
  if (!counter) { console.log('\x1b[36m%s\x1b[0m', "[Programme]: No new Intro/Outro attachments detected... No updates were done.") }
}