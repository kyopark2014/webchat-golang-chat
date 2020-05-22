const sendBtn = document.querySelector('#sendBtn');
const chatInput = document.querySelector('#chatInput')
const msgBubble = document.querySelector('#msgBubble');

sendBtn.addEventListener('click', onSend);
chatInput.addEventListener('keyup', function(e){
    if (e.keyCode == 13) {
        onSend(e);
    }
});

function onSend(e) {
    e.preventDefault();

    console.log(e.keyCode);
    if(chatInput.value != '') {
        console.log(chatInput.value);

        const li = document.createElement('li');  // list item
        // li.className = 'row no-gutters col-md-3 offset-md-9 chat-bubble--right';
        li.className = 'row send-bubble send-bubble--right';
        li.appendChild(document.createTextNode(`${chatInput.value}`));
        msgBubble.appendChild(li);
        
        chatInput.value = '';

        const lir = document.createElement('li');  // list item
        // li.className = 'row no-gutters col-md-3 offset-md-9 chat-bubble--right';
        lir.className = 'row receive-bubble receive-bubble--left';
        lir.appendChild(document.createTextNode(`Received Message`));
        msgBubble.appendChild(lir);

    }
}