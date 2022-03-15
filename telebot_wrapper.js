const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs')
var secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));

// replace the value below with the Telegram token you receive from @BotFather
const token = secrets.tele_bot_api_key;
const auth_users = secrets.auth_users

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", console.log);

// Matches "/register"
bot.onText(/\/register/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "What is the password to be authenticated?",
    { reply_markup: JSON.stringify({ force_reply: true }) }
  ).then(sentMessage => {
    bot.onReplyToMessage(sentMessage.chat.id, sentMessage.message_id, reply => {
      if (reply.text === secrets.auth_password) {
        bot.sendMessage(sentMessage.chat.id, 'You are added to the authenticated list!')
      } else {
        bot.sendMessage(sentMessage.chat.id, 'Incorrect password!')
      }
    })
  });
});


// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(
    chatId,
    resp
  );
});

// Listen for any kind of message. There are different kinds of
// messages.
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message');
// });