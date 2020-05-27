// Make connection
var socket = io.connect('http://localhost:4000');

const sendBtn = document.querySelector('#sendBtn');
const message = document.querySelector('#chatInput')
const msgBubble = document.querySelector('#msgBubble');
const attachFile = document.querySelector('#attachFile');
const newConversation = document.querySelector('#newConversation');

var uid = localStorage.getItem('email'); // set userID if exists 
if(uid != '')    {
    socket.emit('join',uid);  
    console.log('joined: '+uid);
}

sendBtn.addEventListener('click', onSend);

message.addEventListener('keyup', function(e){
    if (e.keyCode == 13) {
        onSend(e);
    }
});

attachFile.addEventListener('click', function(){
    var input = $(document.createElement('input')); 
    input.attr("type", "file");
    input.trigger('click');
    return false;
});

newConversation.addEventListener('click', function(){
    alert("Add new conversation dialog");
    // To-Do: make a window to asking a chat conversation
});

function onSend(e) {
    e.preventDefault();

    console.log(e.keyCode);
    if(message.value != '') {
        var date = new Date();
        var timestamp = Math.floor(date.getTime()/1000);
            
        const chatmsg = {
            from: uid,
            to: uid,
            timestamp: timestamp,
            message: message.value
        };
    
        const msgJSON = JSON.stringify(chatmsg);
        console.log(msgJSON);
    
        // show the message
        const li = document.createElement('li');  // list item
        // li.className = 'row no-gutters col-md-3 offset-md-9 chat-bubble--right';
        li.className = 'chat-sender chat-sender--right';
        li.appendChild(document.createTextNode(`${message.value}`));
        msgBubble.appendChild(li);
        li.scrollIntoView(false);

        // send the message
        socket.emit('chat', msgJSON);
    }
    
    message.value = "";
}

// Listen for events 
socket.on('chat', function(data){
    var date = new Date(data.Timestamp * 1000);
    var timestr = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

    console.log("web: " + data.Text);
  
    if(data.EvtType == 'message') {
        const lir = document.createElement('li');  // list item
        // li.className = 'row no-gutters col-md-3 offset-md-9 chat-bubble--right';
        lir.className = 'row col-sm-4 receive-bubble receive-bubble--left';
        lir.appendChild(document.createTextNode(data.Text));
        msgBubble.appendChild(lir); 
        li.scrollIntoView(false);
    }
  });

// Listen for events 
socket.on('participant', function(data){
    title.textContent = 'Web Chat (' + data + ')';
    console.log('update participants');
});

socket.on('typing', function(data){
    feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});