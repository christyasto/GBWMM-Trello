const TelegramBot = require('node-telegram-bot-api');
const main = require('./main.js')
const fs = require('fs')
var secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));

// replace the value below with the Telegram token you receive from @BotFather
const token = secrets.tele_bot_api_key;
let auth_users_chat_id = secrets.auth_users_chat_id

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
        add_user_to_auth_list(sentMessage)
      } else {
        bot.sendMessage(sentMessage.chat.id, 'Incorrect password!')
      }
    })
  });
});

bot.onText(/\/list/, async (msg, match) => {
  // 'msg' is the received Message from Telegram
  const chatId = msg.chat.id;
  await bot.sendMessage(
    chatId,
    "These are the available automated trello functions available: "
  );
  var trello_functions_list = main.get_functions_list()
  for (const [index, function_object] of trello_functions_list.entries()) {
    // send back the name of the functions available
    await bot.sendMessage(
      chatId,
      `${index+1}. ` + function_object.name
    );
  }
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

function add_user_to_auth_list(message_info) {
  if (Object.values(auth_users_chat_id).includes(message_info.chat.id)) {
    bot.sendMessage(message_info.chat.id, 'You are already authenticated.')
  } else {
    secrets.auth_users_chat_id[message_info.chat.username] = message_info.chat.id
    fs.writeFileSync('secrets.json', secrets)
    bot.sendMessage(message_info.chat.id, `Added you to the authenticated chat list`)
  }
}

async function run_telebot() {
  while (true) {
    await main.run(1000);
  }
}

run_telebot()
