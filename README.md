# GBWMM-Trello
Trello Automation for GBWMM Youth Programme.

#### **Notes:**
- [Documentation here](https://developer.atlassian.com/cloud/trello/rest/api-group-actions/) if you want to create non-standard functions from the Rest API.
- DO NOT use forEach for async functions, the order will go haywire according to [this guy](https://gist.github.com/joeytwiddle/37d2085425c049629b80956d3c618971).
- Since most of the functions are async, try to put [source] in your logging for easier debugging. (check one of the functions' log triggers).

### **MasterChecklist.update** : 
	- Read if there are any cards in Tech Team's [Done]
	- Find the CheckItem in Programme Masterlist's [In Progress] with the hyperlink to that card 
	- Gives it a tick.
	- Also find Intro/Outro attachment in those cards and tick accordingly
	
	Log triggers in cyan:
	- "[Programme]: Checking for Programme updates..."
	- "[Programme]: Master checklist updated!"
	- "[Programme]: Tech Team's [Done] is empty. No update needed."
	- "[Programme]: No ongoing work in Programme Masterlist's [In Progress]. No update needed."
	- "[Programme]: No matching cards... No updates were done."
	- "[Programme]: No matching Intro/Outro attachments detected... No updates were done."
	
### **Availability.update** : 
	- For each member, get the cards the member is on
	- check if each card is still due, add assigned card link to member's status card and move to [Occupied]
	- If member has no card that is outstanding, move the status card to [Available]
	
	Log triggers in white:
	- "[Availability]: Checking on ${member.fullName} card now"
	- "[Availability]: Adding new comment to status card and moving it over!"
	- "[Availability]: Comment already exist, skipping commenting"
	- "[Availability]: Card is past due or something ..."
	- "[Availability]: Moving " + member.fullName + " to available list"
	- "[Availability]: " + member.fullName + " is slacking now"
	- "[Availability]: GMWMM Web-TV Youth Members' Availability updated!"
	
### **MoveCard.update**
	- Check Singspiration team's [Send to Editing Team] and Sermon Team's [Video Editing / Filming] 
	- Move cards to Tech Team's [To Do]
	
	Log triggers in yellow:
	- "[Automation]: no new cards found, no updates done..."
	- "[Automation]: Card move approved!"
	- "[Automation]: Card "${_card.name}" moved:\n stringified card contents"
	
### **CardDuplication.update** : [Paused for now and replaced with MoveCard]
	- Check Singspiration team's [Send to Editing Team] and Sermon Team's [Video Editing / Filming]
	- Copy newly added cards to Tech Team's [To Do]
	- Keep updating the pairs if the Tech Team's copy is changed/updated
	
	Log triggers in yellow:
	- "[Duplication]: Nothing found in Song Team's [Send to Editing Team]. No checking needed."
	- "[Duplication]: No new cards found in Song Team's [Send to Editing Team]. No duplications needed."
	- "[Duplication]: Nothing found in Sermon Team's [Video Editing / Filming]. No checking needed."
	- "[Duplication]: No new cards found in Sermon Team's [Video Editing / Filming]. No duplications needed."
	- "[Duplication]: "${_card.name}" card duplicated from ${_team}'s Board!"
	- "[Duplication]: New duplicated card "${_card.name}": ${stringified card}"
	- "[Duplication]: Updated original card "${_card.name}"'s desc: ${new card description}`"
	
### **NotifyTelegram.update** : 
	Deprecated until we find good enough reason to do lol
