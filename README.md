# GBWMM-Trello
Trello Automation for GBWMM Youth Programme.

#### **Notes:**
- [Documentation here](https://developer.atlassian.com/cloud/trello/rest/api-group-actions/) if you want to create non-standard functions from the Rest API
- Since most of the functions are async, try to put [source] in your logging for easier debugging. (check one of the functions' log triggers)

### **MasterChecklist.update** : 
	- Read if there are any cards in Tech Team's [Done]
	- Find the CheckItem in Programme Masterlist's [In Progress] with the hyperlink to that card 
	- Gives it a tick.
	
	Log triggers:
	- "[Programme]: Checking for Programme updates..."
	- "[Programme]: Master checklist updated!"
	- "[Programme]: Tech Team's [Done] is empty. No update needed."
	- "[Programme]: No ongoing work in Programme Masterlist's [In Progress]. No update needed."
	- "[Programme]: No matching cards... No updates were done."
	
### **Availability.update** : 
	- For each member, get the cards the member is on
	- check if each card is still due, add assigned card link to member's status card and move to [Occupied]
	- If member has no card that is outstanding, move the status card to [Available]
	
### **NotifyTelegram.update** : 
	TBC
