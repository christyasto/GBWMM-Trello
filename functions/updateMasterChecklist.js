module.exports = {
  Update: function (key, token) {
    var Trello = require("trello");
    var trello = new Trello(key, token);
    // [Done] List from Tech Team board
    var DoneListPromise = trello.getCardsOnList('61f2c997e9218c1221b57024');
    DoneListPromise.then((cards) => {
      var doneUrls = [];
      // doneUrls contain the list of short Url from Tech Team's [Done]
      cards.forEach(card => {
        doneUrls.push(card.shortUrl);
      });
      if (!doneUrls.length) { console.log('\x1b[36m%s\x1b[0m', "[Programme]: Tech Team's [Done] is empty. No update needed."); return; }

      var counter = 0;
      // Programme Masterlist's [In Progress]
      var MasterListPromise = trello.getCardsOnList('62026f24210e8d7b341d9701');
      MasterListPromise.then((mCards) => {
        if (!mCards.length) { console.log('\x1b[36m%s\x1b[0m', "[Programme]: No ongoing work in Programme Masterlist's [In Progress]. No update needed."); return; }
        mCards.forEach(mCard => {
          var checklistPromise = trello.getChecklistsOnCard(mCard.id);
          checklistPromise.then((cList) => {
            if (!cList.length) { return; }
            cList.forEach(check => {
              if (!check.checkItems.length) { return; }
              check.checkItems.forEach(checkItems => {
                if (checkItems.state == 'complete') return;
                // console.log(`${doneUrls.includes(checkItems.name)}\n${doneUrls}\n${checkItems.name}`);
                // PUT /1/cards/{idCard}/checklist/{idChecklist}/checkItem/{idCheckItem}/state
                if (doneUrls.includes(checkItems.name)) {
                  counter++;
                  const fetch = require('node-fetch');
                  fetch(`https://api.trello.com/1/cards/${mCard.id}/checklist/${check.id}/checkItem/${checkItems.id}/state?key=${key}&token=${token}&value=true`, {
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
                  }).then(text => console.log('\x1b[36m%s\x1b[0m', text))
                    .catch(err => console.error('\x1b[36m%s\x1b[0m', err));
                }
              })
            })
          })
        })
      });
      if (!counter) { console.log('\x1b[36m%s\x1b[0m', "[Programme]: No matching cards... No updates were done.") }
    })
    console.log('\x1b[36m%s\x1b[0m', "[Programme]: Checking for Programme updates...");
  }
}