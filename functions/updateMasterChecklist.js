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
                    console.log(check);
                  })
                })
            })
          });
      })
    console.log("Master checklist updated!")
  }
}