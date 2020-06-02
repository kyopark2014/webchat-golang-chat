# webchat

### Basic Call Flow

In this application, I am targeting a web client which is one of supported clients for this chat service.
In order to make a seamless connection between web client and server, socket.io is a good way to support bidirectional message flow. Also, the application server is based on golang which have a strangth for massice transaction. 

Client <-> Server : Socket.io

![alternative text](http://www.plantuml.com/plantuml/png/ZP5FRnCn4CNlyob6kK1L1P4zSe1waY1M0WbbLN54ZdUIM7KynPvjA8ZlZijsbJz4Qauh_TxRdv_bcwmsQRSDw6m8go0xo7S-tjjaj-Y2pHb_0o8YMNUtJjB5TYf14dxRUEL_YKb9TZsaK5fzNLBBwPGQrUINdNBj93R-5-DR-0ElzYTcVGoCkRJSqoWuJ3YnwECzJyzEELkjBw_EBw-Qbwh1HtugeYJT281w3OmZijax_1XaXvEnodY2hx_UKdDBLrSZsFYMSIMYI_a9O9qMhtd-4e2J4DYfbvZnIrutwM5oXbNGMhLBcnbd13ywxXWNyrdTV3Te6bpC9aUGUbW161o_7xpu3ft4MCmma1AMVqjGnZRJHKrpD72OpgY4sJuycz6WRTlq1W1eRwx-CrUzkJeo4mpfEJCDvjFDesrUZv1ELbrVbwZEICF9t7w0nDgbs8jGLhqP3YuqZ2hFyxbkFY7rTe22Z-_JyyF1jASt7Djk6m3WBm00)


Once one of client in a chatroom is not online, PUBSUB is not a good way to commnicate messages. So, the application server saves the message in Queue too using linked list. Then, once a client is back online, the message can be delivered to the client robustly.

### PUBSUB ISSUES

For one-to-one chat, published messages from Sender will return since the sender also do SUBSCRIBE into PUBSUB server.
It may be used for acknowlegement for the sent message. But it also requires special management for UI because an user usually prefers to use legacy message experience where it shows if a message is failed to send by some reason, it should be displayed in the chat dialog so that the user recognizes and then tries again if needs.
So, I think it is a redundacy for PUBSUB when it is applied for one-to-one chat.

![image](https://user-images.githubusercontent.com/52392004/82962776-2801c100-9ffc-11ea-91bc-ebb94843d553.png)

where Sender and Receiver are subscribed to a chat room with chat-id.

In mobile environment, the state of user client can move to online to offline which means that Sender may not sucess to send a message based on the state of Receiver. So, the architecture should support store and forward approach.

The proposed architecture is using PUBSUB to endpoints which doesn't have the redundancy and some of benefits to notice the received message and manages a single connection for multiple chat rooms.

![image](https://user-images.githubusercontent.com/52392004/82962567-89756000-9ffb-11ea-8e5a-7eb737fd6f37.png)

where Sender will publish to Receiver directly and messages can be delivered consistently without the state of Receiver.

### OVERALL STRUCTURE

There are two connection ways between client and server. Socket.io is used for chat session and REST API is used for call logs.

![image](https://user-images.githubusercontent.com/52392004/82965685-c6455500-a003-11ea-91ed-974b845d856d.png)

where REDIS is for PUBSUB and DYNAMO DB is for storage for call logs. Notice that the diagram shows the simple flow for messaging where many flows are ignored to explain the basic flows.


### REFERENCE

https://codepen.io/FilipRastovic/pen/pXgqKK
