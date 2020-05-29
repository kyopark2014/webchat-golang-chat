Queue = function() {
    this.first = null;
    this.qsize = 0;
    this.recent = null;
}
  
Queue.prototype = {
    size: function() {
        return this.qsize;
    },
    isEmpty: function(){
        return (this.qsize == 0);
    },
    push: function(data) {
        var Node = function(data) {
            this.data = data;
            this.next = null;
        };

        var node = new Node(data);
  
        if (!this.first){
            this.first = node;
        } else {
            n = this.first;
            while (n.next) {
                n = n.next;
            }
            n.next = node;
        }
    
        this.qsize += 1;
        this.recent = data;

        return node;
    },
    front: function() {
        return this.first;
    },
    pop: function() {
        this.first = this.first.next;
        this.qsize -= 1;
    }
}

HashMap = function() {
    this.map = new Array();
};

HashMap.prototype = {
    put: function(key, value) {
        this.map[key] = value;
    },
    get: function(key) {
        return this.map[key];
    },
    getAll: function() {
        return this.map;
    },
    clear: function() {
        return this.map;
    },
    isEmpty: function() {
        return (this.map.size()==0);
    },
    remove: function(key) {
        delete this.map[key];
    },
    getKeys: function() {
        var keys = new Array();
        for(i in this.map) {
            keys.push(i);
        }
        return keys;
    }
};

// Make connection
var socket = io.connect('http://localhost:4000');

// Documents
const sendBtn = document.querySelector('#sendBtn');
const message = document.querySelector('#chatInput')
const attachFile = document.querySelector('#attachFile');
const newConversation = document.querySelector('#newConversation');  // To input callee number

const msgList = document.querySelector('#msgList');
const chatPanel = document.querySelector('#chatPanel');
const calleeProfile = document.querySelector('#calleeProfile');

// To-Do: uname and uid need to get from the index.html for security
var uname = localStorage.getItem('name'); // set userID if exists 
var uid = localStorage.getItem('phonenumber'); // set userID if exists 
if(uid != '')    {
    socket.emit('join',uid);  
    console.log('joined: '+uid);
}

// variables
var map = new HashMap();   // call data
var list = [];    // call log list
var index = 0;    // # of call log lists
var callee = uid;  // current conversation partner

// initialize call list map
var idx = new HashMap();
idx.put(callee, index);

var listparam = [];

AssignCallList(callee);

function AssignCallList(id) {
    var param = ['',''];  // parma[0] = text, param[1] = timestr
    listparam[idx.get(callee)] = param;

    var from = id;
    console.log('from: '+from);
    
    var text = from+'_text';
    console.log('text: '+text);
    
    var timestr = from+'_timestr';
    console.log('timestr: '+timestr);
    
    msgList.innerHTML = 
        `<div class="friend-drawer friend-drawer--onhover" id="${from}">
            <img class="profile-image" src="basicprofile.jpg" alt="">
            <div class="text">
                <h6>${from}</h6>
            <p class="text-muted" id="${text}"></p>
            </div>
            <span class="time text-muted small" id="${timestr}"></span>
        </div>`;  
    
    listparam[idx.get(id)][0] = document.getElementById(text);
    listparam[idx.get(id)][1] = document.getElementById(timestr);    

    // Once the call log is selected, update the chatroom 
    list[index] = document.getElementById(id);
    if(list[index]) {
        list[index].addEventListener('click',function() {
            console.log('chatroom:'+ callee);

            setConveration(id);
            updateChatWindow(id);
        },false); 
    }     
    index++;   
}

// initialize 
setConveration(callee);
updateChatWindow(callee);


// earn the desternation number
function setDest(id) {
    console.log('Destination: '+id);
    callee = id;

    if(!map.get(id)) {
        AssignCallList(id);
    }
}

// Listeners
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

sendBtn.addEventListener('click', onSend);

function onSend(e) {
    e.preventDefault();

    if(message.value != '') {
        var date = new Date();
        var timestamp = Math.floor(date.getTime()/1000);
            
        const chatmsg = {
            EvtType: "message",
            From: uid,
            To: callee,
            Timestamp: timestamp,
            Text: message.value
        };
    
        const msgJSON = JSON.stringify(chatmsg);
        console.log(msgJSON);
    
        // show the message
        var timestr = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        addSenderMessage(timestr,message.value);

        // update call log
        listparam[idx.get(callee)][0].textContent = message.value; 
        listparam[idx.get(callee)][1].textContent = timestr;

        // send the message
        socket.emit('chat', msgJSON);

        // save the sent message
        var updateRequired = false;
        if(!map.get(callee)) {
            map.put(callee, new Queue());
            updateRequired = true;
            
            console.log('Create hashmap table: '+callee);
        }

        var q = map.get(callee);
        q.push(chatmsg);

        if(updateRequired) updateCalllog();

        console.log('sent message: ' + callee + ':' + q.size());
    }
    
    message.value = "";
}

// set the address of callee
function setConveration(id) {
    console.log('callee: '+ id);
    callee = id;

    calleeName.textContent = 'Name'+id;
    calleeId.textContent = id;
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


// Listen for events 
socket.on('chat', function(data){
    var date = new Date(data.Timestamp * 1000);
    var timestr = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

    console.log("web: " + data.Text);
  
    if(data.EvtType == 'message') {
        // if received data is from unknown user, create a chat log
        var updateRequired = false;
        if(!map.get(data.From)) {
            map.put(data.From, new Queue());
            updateRequired = true;
            
            console.log('New hashmap table was created: '+data.From);
        }

        var q = map.get(data.From);
        q.push(data);

        if(updateRequired) {
            // update call list
            updateCalllog();

            // define listener
            list[index] = document.getElementById(data.From);

            if(list[index]) {
                list[index].addEventListener('click',function() {
                    console.log('chatroom:'+ data.From);

                    setConveration(data.From);
                    updateChatWindow(data.From);
                },false); 
            }           
            index++;
        }

        // show received message
        addReceiverMessage(data.From,timestr,data.Text);  // To-Do: data.From -> Name

        // update the call log 
    //    recent.textContent = data.Text;
    //    recentTimestamp.textContent = timestr;
    }
});

function updateCalllog() {
    keys = map.getKeys();
    console.log('key length: '+keys.length);
    
    msgList.innerHTML = '';    
    for(i=0;i<keys.length;i++) {
        console.log('key: ' +keys[i]);
        var q = map.get(keys[i]);
        var v = q.recent;

        console.log('From: ' + v.From + ' Text: '+q.recent.Text);

        from = q.recent.From;
        text = q.recent.Text;
        var date = new Date(q.recent.Timestamp * 1000);
        var timestr = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

        console.log(`<div class="friend-drawer friend-drawer--onhover" id="${from}">
            <img class="profile-image" src="basicprofile.jpg" alt="">
            <div class="text">
                <h6>${from}</h6>
            <p class="text-muted">${text}</p>
            </div>
            <span class="time text-muted small">${timestr}</span>
        </div>`);

        msgList.innerHTML += 
            `<div class="friend-drawer friend-drawer--onhover" id="${from}">
                <img class="profile-image" src="basicprofile.jpg" alt="">
                <div class="text">
                    <h6>${from}</h6>
                <p class="text-muted">${text}</p>
                </div>
                <span class="time text-muted small">${timestr}</span>
            </div>`;       
    }
}

function updateChatWindow(from) {
    console.log('clicked!');

    if(map.get(from)) {    
        chatPanel.innerHTML = ''; // clear window
        var q = map.get(from);
        console.log("recent: ",q.recent.From);
        
        var size = q.size();
        console.log(size);
        for(i=0;i<size;i++) {
            var v = q.front();
            q.pop();
            console.log(v.data);

            var date = new Date(v.data.Timestamp * 1000);
            var timestr = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
            addReceiverMessage(v.data.From,timestr,v.data.Text);  // To-Do: data.From -> Name         

            if(i==size-1) {
        //        calleeName.textContent = v.data.From;    
        //        calleeId.textContent = v.data.From;
                list[callee].textContent = v.data.Text;
                list[callee].Timestamp.textContent = timestr;       
            }
        }
    } 
    // showCalllog();
}

// Listen for events 
socket.on('participant', function(data){
    title.textContent = 'Web Chat (' + data + ')';
    console.log('update participants');
});

socket.on('typing', function(data){
    feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});
