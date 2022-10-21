// Set systemState
let systemState = {
  plaintext: true,
  notes: [],
}

// Check storage for values and save values into systemState. 
// If we don't do this, background.js forgets everything when it is unloaded
chrome.storage.local.get('systemState', function(result) {
  
  let isEmpty = Object.keys(result).length === 0;

  if(isEmpty){

    console.log('Fresh systemState created')
    // Set new values if there aren't any in storage
    chrome.storage.local.set({'systemState': systemState})

  }else{
    console.log('systemState set from storage')
    
    console.log(result.systemState)
    systemState.notes = result.systemState.notes

  }
});

// Connected to popup.js
chrome.runtime.onMessage.addListener(
  async function(request, sender, sendResponse){
      if (request.action == 'update'){
        // Send the updated list to popup.js > popup.html to display to users
        sendResponse(systemState)
      }

      if (request.action == 'save'){
        systemState.notes = request.message
        chrome.storage.local.set({'systemState': systemState})
      }

      // If user selected the copy button, we reset everything
      if (request.action == 'reset'){
        console.log('Reset systemState')
        systemState.notes = [];
        chrome.storage.local.set({'systemState': systemState})
      }

      // If plaintext was toggled on/off
      if(request.action == 'plaintext'){

        if (request.message == true){
          systemState.plaintext = true
          chrome.storage.local.set({'systemState': systemState})
        }else{
          systemState.plaintext = false
          chrome.storage.local.set({'systemState': systemState})
        }
      }
  }
)