module.exports = {
    Update: function (key, token) {
        var Trello = require("trello");
        var trello = new Trello(key, token);

        console.log('\x1b[34m%s\x1b[0m',"[Telegram]: No changes observed, nothing done...");
    }
}