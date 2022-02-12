module.exports = {
    Update: function(key,token) {
      var Trello = require("trello");
      var trello = new Trello(key, token);
      
      // IDs of 
      var GMWW_org_id = "61ed74813f38718d7cf12236"
      var GMWW_masterboard_id = "62026ee9c1ccb205ac50626e"
      var GMWW_ideasboard_id = "61f2c1c19be3de171182c243"
      var GMWW_sermonboard_id = "61f6563244c03a134fe8ccc6"
      var GMWW_singsboard_id = "61f6563ed7993620ea668677"
      var GMWW_technicalboard_id = "61f2c9505d6e7a72cc0b7ca0"
    
      console.log(key)
      console.log(token)

      // var listPromise = trello.getListsOnBoard(GMWW_singsboard_id, (lists) => {
      //   console.log(lists)
      // })

      console.log("GMWMM Web-TV Youth Members' Availability updated!")
    }
}