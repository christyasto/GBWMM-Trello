module.exports = {
    Update: function(key,token, org_members) {
      var Trello = require("trello");
      var trello = new Trello(key, token);
      
      // IDs
      var GMWW_org_id = "61ed74813f38718d7cf12236"
      var org_boards_dict = {
        GMWW_masterboard_id: "62026ee9c1ccb205ac50626e",
        GMWW_ideasboard_id: "61f2c1c19be3de171182c243",
        GMWW_sermonboard_id: "61f6563244c03a134fe8ccc6",
        GMWW_singsboard_id: "61f6563ed7993620ea668677",
        GMWW_technicalboard_id: "61f2c9505d6e7a72cc0b7ca0"
      }
      // Members availability lists that contains status cards
      var members_available_list = "6204e84ae945aa1d2201cfbf"
      var members_occupied_list = "6204e84e13783e4a366412b7"


      org_members.forEach((member) => {
        // For each member, get the cards the member is on
        var getMemberCardsPromise = trello.getMemberCards(member.id)
        getMemberCardsPromise.then((cards) => {
          var is_assigned = false
          // If members no cards, means unassigned 
          if(cards.length == 0 ) {
            console.log(member.fullName + " is slacking now")
            // trello.updateCardList(member.statusCardId, members_available_list);
          }
          else {
            // Iterate through each card
            cards.forEach( card => {
              console.log(`Checking on ${member.fullName} card now`)
              comment_to_make = get_comment_to_add(card);
              // If its still due, add assigned card link to member's status card and move to occupied
              // TODO : Check card is really a tasks
              if(is_card_outstanding(card)){
                is_assigned = true
                // Check if its already on members' status card, if not add comment
                if(!is_assigned_comment_already_in_status_card(comment_to_make, member.statusCardId, trello)) {
                  console.log("Adding new comment to status card and moving it over!")
                  // trello.addCommentToCard(member.statusCardId, comment_to_make);
                  // Move card to occupied list
                  // trello.updateCardList(member.statusCardId, members_occupied_list);
                }
              }
              else {
                console.log("Card is past due or something ...")
              }
            })

            // After iterating through all the cards, if member has no card that is outstanding
            if(!is_assigned) {
              console.log(member.fullName + " is slacking now")
              // trello.updateCardList(member.statusCardId, members_available_list);
            }
          }
        })
      })

      console.log("GMWMM Web-TV Youth Members' Availability updated!")
    }
}

// Private functions

function is_card_inside_org_board (card_id, org_boards_dict) {
  return  Object.values(org_boards_dict).includes(card_id);
}

function is_card_outstanding(card_obj) {
  if(card_obj.dueComplete) {
    return false
  }
  return true;
}

function get_comment_to_add(members_assigned_card) {
  var newline = "\n"
  var comment = "Task: "
  comment += members_assigned_card.name + newline
  comment += members_assigned_card.url + newline
  if(members_assigned_card.due) {
    comment += "Due Date: " + members_assigned_card.due
  }
  // console.log("Will be making this comment: \n" + comment + "\n")
  return comment
}

function is_assigned_comment_already_in_status_card (new_comment, status_card_id, trello) {
  var getActionsPromise = trello.getActionsOnCard(status_card_id)
  getActionsPromise.then(actions => {
    if(actions.length == 0) {
      return false;
    }
    actions.forEach(action => {
      // Some actions do not have text key
      if("text" in action.data) {
        // Check if matches new comment
        if(new_comment == action.data.text) {
          return true;
        }
      }
    })
    // All actions inside status card do not have matched comments
    return false;
  })
}