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
const title = document.querySelector('#title');
const sendBtn = document.querySelector('#sendBtn');
const message = document.querySelector('#chatInput')
const attachFile = document.querySelector('#attachFile');
const newConversation = document.querySelector('#newConversation');  // To input callee number

const chatPanel = document.querySelector('#chatPanel');
const calleeProfile = document.querySelector('#calleeProfile');

// To-Do: uname and uid need to get from the index.html for security
var uname = localStorage.getItem('name'); // set userID if exists 
var uid = localStorage.getItem('phonenumber'); // set userID if exists 
if(uid != '')    {
    socket.emit('join',uid);  
    console.log('joined: '+uid);

    title.textContent = 'CHAT '+uid; 
}

// variables
var map = new HashMap();   // hashmap for call history
var list = [];    // list of call log

var index = 0;    // # of call log lists
var callee = uid;  // current conversation partner
var idx = new HashMap();   // hashmap for index

var listparam = []; // the params of list

for (i=0;i<20;i++) {
    list.push(document.getElementById('callLog'+i));
}

assignNewCallLog(callee);  // make a call log for callee

function assignNewCallLog(id) {
    map.put(id, new Queue());
    idx.put(id, index);
    index++;   
    
    from = id;
    console.log('from: '+ from + ' index: '+idx.get(from) );

    list[idx.get(from)].innerHTML = 
    `<div class="friend-drawer friend-drawer--onhover">
        <img class="profile-image" src="basicprofile.jpg" alt="">
        <div class="text">
            <h6 id='${from}_name'></h6>
        <p class="text-muted" id="${from}_text"></p>
        </div>
        <span class="time text-muted small" id="${from}_timestr"></span>
    </div>`;     
    
    var param = ['','',''];  // param[0] = name, parma[0] = text, param[1] = timestr
    listparam[idx.get(from)] = param;
    listparam[idx.get(from)][0] = document.getElementById(from+'_name');
    listparam[idx.get(from)][1] = document.getElementById(from+'_text');
    listparam[idx.get(from)][2] = document.getElementById(from+'_timestr');    

    listparam[idx.get(from)][0].textContent = from;
    
    // add listener        
    (function(index, name) {
        list[index].addEventListener("click", function() {
            console.log('index: '+index);
            console.log('--> chatroom: '+idx.get(name)+' ('+name+')');

            setConveration(name);
            updateChatWindow(name); 
        })
    })(idx.get(from),from);

    console.log('calllog: '+list[idx.get(from)].innerHTML);
}

function updateCalllog() {
    keys = map.getKeys();
    console.log('key length: '+keys.length);

    for(i=0;i<keys.length;i++) {
        console.log('key: '+keys[i]);

        var q = map.get(keys[i]);
        from = keys[i];

        if(!q) {
            var text = q.recent.Text;
            var date = new Date(q.recent.Timestamp * 1000);
            var timestr = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

            console.log('From: '+from+' Text: '+text+' Timestr: '+timestr);

            listparam[idx.get(from)][0].textContent = from; 
            listparam[idx.get(from)][1].textContent = text; 
            listparam[idx.get(from)][2].textContent = timestr; 
        } else {
            from = keys[i];
            listparam[idx.get(from)][0].textContent = from; 
        }
    }
}

// initialize 
setConveration(callee);
updateChatWindow(callee);

// earn the desternation number from "invite.html"
function setDest(id) {
    console.log('Destination: '+id);
    callee = id;

    if(!map.get(callee)) {
        assignNewCallLog(callee);
    }

    setConveration(callee);
    updateChatWindow(callee);
}

// Listeners
message.addEventListener('keyup', function(e){
    if (e.keyCode == 13) {
        onSend(e);
    }
});

attachFile.addEventListener('click', function(){
    updateCalllog();

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
        listparam[idx.get(callee)][0].textContent = callee; 
        listparam[idx.get(callee)][1].textContent = message.value; 
        listparam[idx.get(callee)][2].textContent = timestr; 

        // send the message
        socket.emit('chat', msgJSON);

        // save the sent message
        var q = map.get(callee);
        q.push(chatmsg);

        console.log('sent message: ' + callee + ':' + q.size());
    }
    
    message.value = "";
}

// receive the id of callee from "invite.html"
function setConveration(id) {
    console.log('callee: '+ id);
    callee = id;

    calleeName.textContent = 'Name'+id;  // To-do: next time, it will be earn from the profile server
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


// Listen events to receive a message
socket.on('chat', function(data){
    var date = new Date(data.Timestamp * 1000);
    var timestr = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

    console.log("web: " + data.Text);
  
    if(data.EvtType == 'message') {
        // if the sender is not in call list, create a call log
        if(!map.get(data.From)) {
            assignNewCallLog(data.From);      

            console.log('New hashmap table was created: '+data.From);
        }

        var q = map.get(data.From);
        q.push(data);

        // show received message
        if(callee == data.From)
            addReceiverMessage(data.From,timestr,data.Text);  // To-Do: data.From -> Name

        // update the call log 
        listparam[idx.get(callee)][0].textContent = callee; 
        listparam[idx.get(callee)][1].textContent = data.Text; 
        listparam[idx.get(callee)][2].textContent = timestr;
    }
});

function updateChatWindow(from) {
    chatPanel.innerHTML = ''; // clear window
 
    var q = map.get(from);    
    if(q) {            
        var size = q.size();
        console.log('QUEUE size: '+ size);
        for(i=0;i<size;i++) {
            var v = q.front();
            q.pop();
            console.log(v.data);

            var date = new Date(v.data.Timestamp * 1000);
            var timestr = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
            addReceiverMessage(v.data.From,timestr,v.data.Text);  // To-Do: data.From -> Name         
        }
    } 
}

// Listen for events 
socket.on('participant', function(data){
    title.textContent = 'Web Chat (' + data + ')';
    console.log('update participants');
});

socket.on('typing', function(data){
    feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});
