// Make connection
var socket = io.connect('http://localhost:4000');

const sendBtn = document.querySelector('#sendBtn');
const message = document.querySelector('#chatInput')
const attachFile = document.querySelector('#attachFile');
const newConversation = document.querySelector('#newConversation');
const msgList = document.querySelector('#msgList');
const chatPanel = document.querySelector('#chatPanel');
const convProfile = document.querySelector('#ConvProfile');

// recent conversation list
const currentConvUserName = document.querySelector('#currentConvUserName');
const currentConvUserId = document.querySelector('#currentConvUserId');
const lastMsg = document.querySelector('#lastMsg');
const lastMsgTimestamp = document.querySelector('#lastMsgTimestamp');


// To-Do: uname and uid need to get from the index.html for security
var uname = localStorage.getItem('name'); // set userID if exists 
var uid = localStorage.getItem('phonenumber'); // set userID if exists 
if(uid != '')    {
    socket.emit('join',uid);  
    console.log('joined: '+uid);
}

var dest = uid;  // initial: self chat To-Do: read it from DB

// To-do: load current conversation profile from the conversation list 
let convPartner = uid;
currentConvUserName.textContent = uname;
currentConvUserId.textContent = convPartner;
lastMsg.textContent = "";
lastMsgTimestamp.textContent = "";

//showCalllog();

function showCalllog() {
    msgList.innerHTML += 
    `<div class="friend-drawer friend-drawer--onhover">
     <img class="profile-image" src="basicprofile.jpg" alt="">
     <div class="text">
      <h6>${uname}</h6>
      <p class="text-muted">Hey, how r u! </p>
     </div>
     <span class="time text-muted small">13:21</span>
   </div>`;        
}

function addSenderMessage(timestr,msg) {
    chatPanel.innerHTML += 
    `<div class="chat-sender chat-sender--right"><h1>${timestr}</h1>${msg}</div>`;     
  
    chatPanel.scrollTop = chatPanel.scrollHeight;  // scroll needs to move bottom
}

function addReceiverMessage(sender,timestr, msg) {
    chatPanel.innerHTML += 
    `<div class="chat-receiver chat-receiver--left"><h1>${sender}</h1><h2>${timestr}</h2>${msg}</div>`;        

    chatPanel.scrollTop = chatPanel.scrollHeight;  // scroll needs to move bottom
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
    var popUrl = "invite.html";	
	var popOption = "width=370, height=360, resizable=no, scrollbars=no, status=no;";    
        window.open(popUrl,"",popOption);
});

function setDest(value) {
    console.log('Destination: '+value);
    dest = value;

    currentConvUserName.textContent = dest;
    currentConvUserId.textContent = dest;
    // if there is no recored with dest, create a call log
}

function onSend(e) {
    e.preventDefault();

    console.log(e.keyCode);
    if(message.value != '') {
        var date = new Date();
        var timestamp = Math.floor(date.getTime()/1000);
            
        const chatmsg = {
            from: uid,
            to: dest,
            timestamp: timestamp,
            message: message.value
        };
    
        const msgJSON = JSON.stringify(chatmsg);
        console.log(msgJSON);
    
        // show the message
        var timestr = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        addSenderMessage(timestr,message.value);
        
        // update recent conversation list
        if(convPartner != uid) {
            if(currentConvUserName.textContent == "") currentConvUserName.textContent = data.From;
            // To-Do  Name can get to query from profile server           
            currentConvUserId.textContent = data.From;
        }
        lastMsg.textContent = message.value;       
        lastMsgTimestamp.textContent = timestr;

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
        // if received data is from unknown user, create a chat log


        // show received message
        addReceiverMessage(data.From,timestr,data.Text);  // To-Do: data.From -> Name

        // update recent conversation list
        if(convPartner != uid) {
            if(currentConvUserName.textContent == "") currentConvUserName.textContent = data.From;
            currentConvUserId.textContent = data.From;
        }
        lastMsg.textContent = data.Text;
        lastMsgTimestamp.textContent = timestr;
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