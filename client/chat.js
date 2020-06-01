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

// Make connection
var socket = io.connect('http://localhost:4000');

// Documents
const title = document.querySelector('#title');
const sendBtn = document.querySelector('#sendBtn');
const message = document.querySelector('#chatInput')
const attachFile = document.querySelector('#attachFile');
const newConversation = document.querySelector('#newConversation');  // To input callee number

const chatPanel = document.querySelector('#chatPanel');

const refreshCallLog = document.querySelector('#refreshCallLog');
const refreshChatWindow = document.querySelector('#refreshChatWindow');

// To-Do: uname and uid need to get from the index.html for security
var uname = localStorage.getItem('name'); // set userID if exists 
var uid = localStorage.getItem('phonenumber'); // set userID if exists 
if(uid != '')    {
    socket.emit('join',uid);  
    console.log('joined: '+uid);

    title.textContent = 'CHAT '+uid; 
}

var callee = -1;  // current conversation partner

// call log
var list = [];  
for (i=0;i<20;i++) {
    list.push(document.getElementById('callLog'+i));
}
var index = 0;    // # of call log lists
var listparam = []; // the params of list
var idx = new HashMap();   // hashmap for index

// initiate all elements of message log
var msglist = [];
var msglistparam = [];
var maxMsgItems = 50;
var IMDN;
IMDN = new HashMap();
var queue;
queue = new Queue();

for (i=0;i<maxMsgItems;i++) {
    msglist.push(document.getElementById('msgLog'+i));

    // add listener        
    (function(index) {
        msglist[index].addEventListener("click", function() {
            console.log('click! index: '+index);
        })
    })(i);
}

// database: To-Do: it will replated to indexed database
var msgHistory = new HashMap();

assignNewCallLog(callee);  // make a call log for callee

function assignNewCallLog(id) {
    if(id != -1) {
        // make a history
        if(!msgHistory.get(id))
            msgHistory.put(id, new Array())
        
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
                console.log('--> chatroom: '+idx.get(name)+' ('+name+')');

                if(name != callee) {
                    callee = name;

                    callLog = msgHistory.get(callee);
                    for(i=callLog.length()-1;i>=0;i--) {
                        if(callLog[i].logType==0) {  // for received message but not displayed
                            if(callLog[i].status==1) {
                                sendDisplayNoti(callLog[i].From, callLog[i].MsgID);
                                callLog[i].status = 2;
                            }
                            else break;
                        }
                    }

                    setConveration(name);
                    updateChatWindow(name);
                } 
            })
        })(idx.get(from),from);
    }
}

function updateCalllog() {
    keys = msgHistory.getKeys();
    console.log('key length: '+keys.length);

    for(i=0;i<keys.length;i++) {
        console.log('key: '+keys[i]);

        var map = msgHistory.get(keys[i]);
        from = keys[i];

        if(!map) {
            var text = map.recent.Text;
            var date = new Date(map.recent.Timestamp * 1000);
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

    if(!msgHistory.get(callee)) {
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

refreshCallLog.addEventListener('click', function(){
    console.log('update call logs');
    updateCalllog();
});

refreshChatWindow.addEventListener('click', function(){
    console.log('update chat window');
    updateChatWindow(callee);
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

    if(message.value != '' && callee != -1) {
        var date = new Date();
        var timestamp = Math.floor(date.getTime()/1000);
            
        const chatmsg = {
            EvtType: "message",
            From: uid,
            To: callee,
            MsgID: uuidv4(),
            Timestamp: timestamp,
            Text: message.value
        };
    
        const msgJSON = JSON.stringify(chatmsg);
        console.log(msgJSON);
    
        // update call log
        var date = new Date(timestamp * 1000);
        var timestr = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

        listparam[idx.get(callee)][0].textContent = callee; 
        listparam[idx.get(callee)][1].textContent = message.value; 
        listparam[idx.get(callee)][2].textContent = timestr; 

        // save the sent message
        const log = {
            logType: 1,    // 1: sent, 0: receive
            status: 0,     // 0: sent, 1: delivery, 2: display
            msg: chatmsg
        };

        callLog = msgHistory.get(callee);
        callLog.push(log);

        console.log('sent message: (from:' + log.msg.From + ' msg:' + log.msg.Text + ' timestamp:'+log.msg.Timestamp+')');

        updateChatWindow(callee);

        // send the message
        socket.emit('chat', msgJSON);
    }
    
    message.value = "";
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

// receive the id of callee from "invite.html"
function setConveration(id) {
    if(id != -1) {
        calleeName.textContent = 'Name'+id;  // To-do: next time, it will be earn from the profile server
        calleeId.textContent = id;
    }
}

// Listen events to receive a message
socket.on('chat', function(data){
    var date = new Date(data.Timestamp * 1000);
    var timestr = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

    if(data.EvtType == 'message') {
        console.log("received: " + data.Text);
        // if the sender is not in call list, create a call log
        if(!msgHistory.get(data.From)) {
            assignNewCallLog(data.From);      

            console.log('New hashmap table was created: '+data.From);
        }

        const log = {
            logType: 0,    // 1: sent, 0: receive
            status: 0,     // 0: sent, 1: delivery, 2: display
            msg: data
        };
        callLog = msgHistory.get(data.From);
        callLog.push(log);
        
        // show received message
        if(callee == -1) {
            callee = data.From;

            setConveration(callee);
            updateChatWindow(callee); 
        }

        if(callee == data.From) {
            updateChatWindow(callee);
        }

        // update the call log 
        listparam[idx.get(data.From)][0].textContent = data.From; 
        listparam[idx.get(data.From)][1].textContent = data.Text; 
        listparam[idx.get(data.From)][2].textContent = timestr;

        sendDeliveryNoti(data.From, data.MsgID);
        log.status = 1;
        callLog[msgHistory.length-1] = log;
        
        // send display report
        focused = document.hasFocus();
        console.log('focuse: ', focused);

        if(focused) {
            sendDisplayNoti(data.From, data.MsgID);
            log.status = 1;
            callLog[msgHistory.length-1] = log;
        } else {
            queue.push(data);
            console.log('display noti was queued: '+data)
        }
    }
    else if(data.EvtType == 'delivery') {
        console.log('delivery report was received: '+data.MsgID);        

        // change status from 'sent' to 'delivery'
        imdnIDX = IMDN.get(data.MsgID);
        console.log('imdn index: '+imdnIDX)
        msglistparam[imdnIDX].textContent = '1';
    }    
    else if(data.EvtType == 'display') {
        console.log('display report was received: '+data.MsgID);        

        // change status from 'sent' to 'delivery'
        imdnIDX = IMDN.get(data.MsgID);
        console.log('imdn index: '+imdnIDX);
        msglistparam[imdnIDX].textContent = '\u00A0';

        IMDN.remove(data.MsgID);
    } 
});

(function(q) {
    window.addEventListener("focus", function() {
        console.log("Back to front");
       // updateChatWindow();
        
        
    })
})(queue);

function updateDisplayReceived() {
    console.log("send display notifications stored");
    while(!queue.isEmpty()) {
        data = queue.front();
        queue.pop();

        sendDisplayNoti(data.From, data.MsgID);        
    } 
}

function sendDeliveryNoti(sender, MsgID) {
    // send delivery report
    console.log('<-- delivered report: '+MsgID);

    var date = new Date();
    var timestamp = Math.floor(date.getTime()/1000);
    
    const deliverymsg = {
        EvtType: "delivery",
        From: uid,
        To: sender,
        MsgID: MsgID,
        Timestamp: timestamp,
    };
    
    const deliveryJSON = JSON.stringify(deliverymsg);
    console.log(deliveryJSON);    
                
    socket.emit('chat', deliveryJSON);    
}

function sendDisplayNoti(sender, MsgID) {
    var date = new Date();
    var timestamp = Math.floor(date.getTime()/1000);
            
    const displaymsg = {
        EvtType: "display",
        From: uid,
        To: sender,
        MsgID: MsgID,
        Timestamp: timestamp,
    };
            
    const displayJSON = JSON.stringify(displaymsg);
    console.log(displayJSON);    
                
    // send the display message
    socket.emit('chat', displayJSON);   
}

/*
window.addEventListener('focus', function(IMDN, queue, msglistparam) {
    return function() {
        updateDisplayReceived(IMDN, queue, msglistparam);
    }
}(IMDN, queue, msglistparam)); */


//window.addEventListener('focus', (updateDisplayReceived(IMDN, queue, msglistparam));

/*
(function(index) {
    msglist[index].addEventListener("click", function() {
        console.log('click! index: '+index);
    })
})(i); */



function addSenderMessage(index,timestr,msg,status) {
//    console.log("add sent message: "+msg);
    
    msglist[index].innerHTML = 
        `<div class="chat-sender chat-sender--right"><h1>${timestr}</h1>${msg}<h2 id="status${index}"></h2></div>`;     
    
    msglistparam[index] = document.getElementById('status'+index);
    
    if(status==0) 
        msglistparam[index].textContent = 'v'; 
    else if(status==1)
        msglistparam[index].textContent = '1'; 
    else if(status==1)
        msglistparam[index].textContent = '\u00A0'; 
    
//    console.log(msglist[index].innerHTML);
}

function addReceiverMessage(index, sender,timestr, msg) {
//    console.log("add received message: "+msg);

    msglist[index].innerHTML =  
    `<div class="chat-receiver chat-receiver--left"><h1>${sender}</h1><h2>${timestr}</h2>${msg}</div>`;     

//    console.log(msglist[index].innerHTML);   
}

function updateChatWindow(from) {
    if(from != -1) {
        // clear chat window
        for (i=0;i<maxMsgItems;i++) {
            msglist[i].innerHTML = '';
        }

        callee = from;

        // load callLog
        callLog = msgHistory.get(from);

        // shows maxMsgItems messages based on arrived order    
        if(callLog.length < maxMsgItems) start = 0;
        else start = callLog.length - maxMsgItems;

        // console.log('start: '+start+' end: ' + callLog.length);

        for(i=start;i<callLog.length;i++) {
            var date = new Date(callLog[i].msg.Timestamp * 1000);
            var timestr = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

            if(callLog[i].logType == 1) {
                addSenderMessage(i-start,timestr,callLog[i].msg.Text);

                IMDN.put(callLog[i].msg.MsgID, i-start);
            }
            else 
                addReceiverMessage(i-start,callLog[i].msg.From,timestr,callLog[i].msg.Text);  // To-Do: data.From -> Name       
        }

        chatPanel.scrollTop = chatPanel.scrollHeight;  // scroll needs to move bottom
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
