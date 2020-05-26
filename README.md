# webchat

### Basic Call Flow

In this application, I am targeting a web client which is one of supported clients for this chat service.
In order to make a seamless connection between web client and server, socket.io is a good way to support bidirectional message flow. Also, the application server is based on golang which have a strangth for massice transaction. 

Client <-> Server : Socket.io

![image](https://user-images.githubusercontent.com/52392004/82755922-c67dfe80-9e11-11ea-9344-24b1f79dd415.png)

Once one of client in a chatroom is not online, PUBSUB is not a good way to commnicate messages. So, the application server saves the message in Queue too using linked list. Then, once a client is back online, the message can be delivered to the client robustly.

### PUBSUB Redundancy

For one-to-one chat, the published message from the sender will return the message since the sender also do SUBSCRIBE into PUBSUB server.
It may be used for acknowlegement for the sent message. But it also makes a trouble to manage UI because the user experience prefer to use lagacy message experience where it can show if the message is failed to sent by some reason, it should be deplayed in the chat dialog so that the user can recognize and try again if needs.
So, I think it is a redundacy for PUBSUB when it is applied for one-to-one chat.

The proposed archecture is using PUBSUB to the endpoints which has benefits for noticing the received message and can manage connections for chat rooms since the chat session can managed one between a client and a server.
