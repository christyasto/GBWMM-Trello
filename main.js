const fs = require('fs')
const masterCheckList = require('./functions/updateMasterChecklist');
const availability = require('./functions/availability');
const { functions } = require('lodash');
const cardDuplication = require('./functions/cardDuplication');
const updateDuplicated = require('./functions/updateDuplicatedCards');

var data = fs.readFileSync('token.txt', 'utf8').split('\r\n');
var org_members = JSON.parse(fs.readFileSync('members.json', 'utf8'));
var trello_functions_list = []

// Your token.txt is to be put in the same folder as this file
// dont forget to include it in .gitignore so that people can't see
// the general format would be empty text file with key first, then press enter, then token
// e.g.  _____________________________________
//      |1123edewd32e132                      |
//      |wwreg9wer7w0r787we6w8rf6erf7er0      |
//      |_____________________________________|

var key = data[0], token = data[1];

// do stuffs on trello board every 10 sec (for now in testing phase)
// I suggest not to lower it below 5 sec since it might trigger multiple async calls on top of each other

// setInterval(function () {

// Update if any videos are ready and update the master checklist
// masterCheckList.Update(key, token);

// Check if there are jobs done and move Occupied member to Available n vice versa
// for members that have a new task
// availability.Update(key, token, org_members);

// // Check for Singspiration/Sermon Team's milestone and duplicate the card to Tech Team and keep them updated.
// cardDuplication.Update(key, token);
// updateDuplicated.Update(key, token);

// }, 5000);

//Appends function to list
add_functions_to_list(trello_functions_list, "Master Check List", masterCheckList.Update);
add_functions_to_list(trello_functions_list, "Members availability", availability.Update);
add_functions_to_list(trello_functions_list, "Duplicate/move Card", cardDuplication.Update);
add_functions_to_list(trello_functions_list, "Update Duplicated/moved Card", updateDuplicated.Update);

console.log(trello_functions_list)

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function add_functions_to_list(function_list, name, function_pointer) {
  const trello_function = new Object();
  trello_function.name = name
  trello_function.function_pointer = function_pointer

  function_list.push(trello_function)
}

module.exports = {
  // Returns available trello functions in a list
  get_functions_list: function () {
    return trello_functions_list;
  },

  run: async function (interval) {
    console.log("I'm running!")

    await sleep(interval);
  }
}
