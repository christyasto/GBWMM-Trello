const fs = require('fs')
const masterCheckList = require('./functions/updateMasterChecklist');
const availability = require('./functions/availability');

var data = fs.readFileSync('token.txt', 'utf8').split('\r\n');

// Your token.txt is to be put in the same folder as this file
// dont forget to include it in .gitignore so that people can't see
// the general format would be empty text file with key first, then press enter, then token
// e.g.  _____________________________________
//      |1123edewd32e132                      |
//      |wwreg9wer7w0r787we6w8rf6erf7er0      |
//      |_____________________________________|

var key = data[0], token = data[1];


// do stuffs on trello board every 15 min
setInterval(function () {
    // Update if any videos are ready and update the master checklist
    masterCheckList.Update(key,token);

    // Check if there are jobs done and move Occupied member to Available n vice versa
    availability.Update(key,token);

}, 5000);
