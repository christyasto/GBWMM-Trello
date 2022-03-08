const _ = require("lodash");

// IDS of organization and board
// var GMWW_org_id = "61ed74813f38718d7cf12236"
var org_boards_dict = {
  GMWW_masterboard_id: "62026ee9c1ccb205ac50626e",
  GMWW_ideasboard_id: "61f2c1c19be3de171182c243",
  GMWW_sermonboard_id: "61f6563244c03a134fe8ccc6",
  GMWW_singsboard_id: "61f6563ed7993620ea668677",
  GMWW_technicalboard_id: "61f2c9505d6e7a72cc0b7ca0"
}

module.exports = {
  Update: async function (key, token, org_members) {
    var Trello = require("trello");
    var trello = new Trello(key, token);

    // Members availability lists that contains status cards
    var members_available_list = "6204e84ae945aa1d2201cfbf"
    var members_occupied_list = "6204e84e13783e4a366412b7"

    for (const member of org_members) {
      // For each member, get the cards the member is 
      // In other words, the cards they are assigned to
      var cards = await trello.getMemberCards(member.id)
      var is_assigned = false
      // If members has no cards, means he belongs to unassigned list
      if (cards.length == 0) {
        console.log("[Availability]: " + member.fullName + " is slacking now")
        trello.updateCardList(member.statusCardId, members_available_list);
      }
      else {
        // Iterate through each 
        for (const card of cards) {
          console.log(`[Availability]: Checking on ${member.fullName} card now`)
          comment_to_make = get_comment_to_add(card);
          // If its still due, add assigned card link to member's status card and move to occupied
          if (is_card_inside_GBWMM_org(card) && !card.dueComplete) {
            is_assigned = true
            // Check if its already on members' status card, if not add comment
            const to_comment = !await is_assigned_comment_already_in_status_card(comment_to_make, member.statusCardId, trello)
            if (to_comment) {
              console.log("[Availability]: Adding new comment to status card and moving it over!")
              console.log("[Availability]: " + comment_to_make)
              trello.addCommentToCard(member.statusCardId, comment_to_make);
              // Move card to occupied list
              trello.updateCardList(member.statusCardId, members_occupied_list);
            }
            else {
              console.log("[Availability]: Comment already exist, skipping commenting")
            }
          }
          else {
            console.log("[Availability]: Card is past due or something ...")
          }
        }
        // After iterating through all the cards, if member has no card that is outstanding
        if (!is_assigned) {
          console.log("[Availability]: Moving " + member.fullName + " to available list")
          trello.updateCardList(member.statusCardId, members_available_list);
        }
      }
    }
    console.log("[Availability]: GMWMM Web-TV Youth Members' Availability updated!")
  }
}

// Private functions

function is_card_inside_GBWMM_org(card_obj) {
  var board_id_of_card = card_obj.idBoard;
  return Object.values(org_boards_dict).includes(board_id_of_card);
}

function is_card_outstanding(card_obj) {
  if (card_obj.dueComplete) {
    return false
  }
  return true;
}

function get_comment_to_add(members_assigned_card) {
  var newline = "\n"
  var comment = "Task: "
  comment += members_assigned_card.url + newline
  if (members_assigned_card.due) {
    var due_date = new Date(members_assigned_card.due)
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    comment += "Due Date: " + due_date.toLocaleDateString("en-US", options)
  }
  return comment
}

async function is_assigned_comment_already_in_status_card(new_comment, status_card_id, trello) {
  var actions = await trello.getActionsOnCard(status_card_id)
  if (actions.length == 0) {
    return false;
  }
  for (const action of actions) {
    // Some actions do not have data.text key
    if (_.has(action, "data.text")) {
      // Check if matches new comment
      if (new_comment === action.data.text) {
        return true;
      }
    }
  }
  // All actions inside status card do not have matched comments
  return false;
}