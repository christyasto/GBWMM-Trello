module.exports = {
  Update: function (key, token) {
    var Trello = require("trello");
    var trello = new Trello(key, token);
    trello.getCardsOnList('61f2c997e9218c1221b57024',
      function (e, cards) {
        var doneUrls = [];
        cards.forEach(card => {
          doneUrls.push(card.shortUrl);
        });

        trello.getCardsOnList('62026f24210e8d7b341d9701',
          function (e, mCards) {
            mCards.forEach(mCard => {
              console.log(mCard.name);
              trello.getChecklistsOnCard(mCard.id,
                function (e, cList) {
                  cList.forEach(check => {
                    check.checkItems.forEach(checkItems => {
                      console.log(`${doneUrls.includes(checkItems.name)}\n${doneUrls}\n${checkItems.name}`);
                      // PUT /1/cards/{idCard}/checklist/{idChecklist}/checkItem/{idCheckItem}/state
                      if (doneUrls.includes(checkItems.name)) {

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
      })
    console.log("Master checklist updated!")
  }
}