module.exports = {
  Update: function (key, token) {
    var Trello = require("trello");
    var trello = new Trello(key, token);
    // [Done] List from Tech Team board
    trello.getCardsOnList('61f2c997e9218c1221b57024',
      function (e, cards) {
        var doneUrls = [];
        // doneUrls contain the list of short Url from Tech Team's [Done]
        cards.forEach(card => {
          doneUrls.push(card.shortUrl);
        });
        if (!doneUrls.length) { console.log("[Programme]: Tech Team's [Done] is empty. No update needed."); return; }
        var counter = 0;
        // Programme Masterlist's [In Progress]
        trello.getCardsOnList('62026f24210e8d7b341d9701',
          function (e, mCards) {
            if(!mCards.length) { console.log("[Programme]: No ongoing work in Programme Masterlist's [In Progress]. No update needed."); return; }
            mCards.forEach(mCard => {
              trello.getChecklistsOnCard(mCard.id,
                function (e, cList) {
                  if(!cList.length) { return; }
                  cList.forEach(check => {
                    if(!check.checkItems.length) { return; }
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
                        })
                          .then(response => {
                            console.log(
                              `Response: ${response.status} ${response.statusText}`
                            );
                            console.log("[Programme]: Master checklist updated!")
                            return response.text();
                          })
                          .then(text => console.log(text))
                          .catch(err => console.error(err));
                      }
                    })
                  })
                })
            })
          });
          if(!counter) { console.log("[Programme]: No matching cards... No updates were done.") }
      })
    console.log("[Programme]: Checking for Programme updates...");
  }
}