
// Query HTML elements
let copy_button = document.getElementById('copy')
let clear_button = document.getElementById('clear')
let plaintext = document.getElementById('check')
let notes_field = document.getElementById('notes')
let copy_confirm = document.getElementById('copy-confirm')

// TODO: Display Notes
function displayNotes(notes){
    console.log(notes)
    notes_field.innerHTML= notes
}

function sanitize(string){

    const pattern = new RegExp("\\<.*?\\>");

    // Use regex_replace function in regex
    // to erase every tags enclosed in <>
    string = new String(string).replace(pattern, "");

    return string
}


// Request update for Notes list background.js
chrome.runtime.sendMessage({action: 'update'}, (response)=>{

    if(response.notes.length != 0){
        console.log(response.notes)
        console.log('Retrieving notes')
        
        // Update toggle
        plaintext.checked = response.plaintext
        displayNotes(response.notes)

        if(plaintext.checked){
            notes_field.setAttribute('contenteditable', 'plaintext-only')
        }else{
            notes_field.setAttribute('contenteditable', 'True')
        }
        
    }else{
        console.log('Try retrieving notes again')
        // Try again to retrieve Notes
        // This happens when the extension wakes up from sleep, and the systemState is not restored quickly enough
        setTimeout(() => {
            
            chrome.runtime.sendMessage({action: 'update'}, (response)=>{

                // Set toggle
                plaintext.checked = response.plaintext
                displayNotes(response.notes)
            })
          }, "400")
    }
})

// Whenever key is pressed, send data to background.js to save
document.onkeypress = function (e) {
   setTimeout(() => {
        chrome.runtime.sendMessage({action: 'save', message:notes_field.innerHTML})
    }, 300);
};

// Tell background.js to update plaintext
plaintext.addEventListener('change', async()=>{
    chrome.runtime.sendMessage({action: 'plaintext', message:plaintext.checked})
    if(plaintext.checked){
        // Copy current text, and convert it to plain text (remove HTML elements)
        raw = sanitize(notes_field.innerHTML)
        displayNotes(raw)
        notes_field.setAttribute('contenteditable', 'plaintext-only')
        
    }else{
        notes_field.setAttribute('contenteditable', 'True')
        // Possibly revert back to richtext... but we would need to save what is was before... so probably will not implement this
    }

})

// Copy NOTES to clipboard and display notification message
copy_button.addEventListener('click', async ()=>{

    // If notes field is not empty
    if(notes_field.innerHTML != ""){

        // Set notification message
        copy_confirm.innerHTML="The notes have been copied to your clipboard"

        // Copy notes to user's clipboard
        navigator.clipboard.writeText(notes_field.innerHTML)

        // Show notification
        copy_confirm.classList.add('show');

        // Make notification message go away after 4000 seconds if no other buttons were pressed
        setTimeout(function(){
            if(copy_confirm.innerHTML != "The notes have been cleared" && copy_confirm.innerHTML != "There aren't any notes to clear"){
                copy_confirm.classList.remove('show');
                copy_confirm.classList.add('hidden');
            }
        }, 4000)
    }else{

        // Set notification message
        copy_confirm.innerHTML="There aren't any notes to copy"

        // Show notification message
        copy_confirm.classList.add('show');

        // Make notification message go away after 4000 seconds if no other buttons were pressed
        setTimeout(function(){
            if(copy_confirm.innerHTML != "The notes have been cleared" && copy_confirm.innerHTML != "There aren't any notes to clear"){
                copy_confirm.classList.remove('show');
                copy_confirm.classList.add('hidden');
            }
        }, 4000)
    }
})

// Clears notes in list within popup.html, the systemState in background.js and in local storage, and display a notification message
clear_button.addEventListener('click', ()=>{

    if(notes_field.innerHTML != ""){

        // Send message to reset data
        chrome.runtime.sendMessage({action: 'reset'})

        // Notify
        copy_confirm.innerHTML = "The notes have been cleared"
        copy_confirm.classList.add('show');

        // Clear List on popup.html
        notes_field.innerHTML = ""
        
        // Make notification message go away after 4000 seconds if no other buttons were pressed
        setTimeout(function(){
            if(copy_confirm.innerHTML != "The notes have been copied to your clipboard" && copy_confirm.innerHTML != "There aren't any notes to copy"){
                copy_confirm.classList.remove('show');
                copy_confirm.classList.add('hidden');
            }
        }, 4000)


    }else{

        // Set notification message
        copy_confirm.innerHTML="There aren't any notes to clear"

        // Display notification
        copy_confirm.classList.add('show');

        // Make notification message go away after 4000 seconds if no other buttons were pressed
        setTimeout(function(){
            if(copy_confirm.innerHTML != "The notes ains have been copied to your clipboard" && copy_confirm.innerHTML != "There aren't any notes to copy"){
                copy_confirm.classList.remove('show');
                copy_confirm.classList.add('hidden');
            }
        }, 4000)
    }
})