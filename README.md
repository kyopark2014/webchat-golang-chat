# webchat

### Basic Call Flow

In this application, I am targeting a web client which is one of supported clients for this chat service.
In order to make a seamless connection between web client and server, socket.io is a good way to support bidirectional message flow. Also, the application server is based on golang which have a strangth for massice transaction. 

Client <-> Server : Socket.io

![image](https://user-images.githubusercontent.com/52392004/82755922-c67dfe80-9e11-11ea-9344-24b1f79dd415.png)

Once one of client in a chatroom is not online, PUBSUB is not a good way to commnicate messages. So, the application server saves the message in Queue too using linked list. Then, once a client is back online, the message can be delivered to the client robustly.

### PUBSUB Redundancy

For one-to-one chat, published messages from Sender will return since the sender also do SUBSCRIBE into PUBSUB server.
It may be used for acknowlegement for the sent message. But it also requires special management for UI because an user usually prefers to use legacy message experience where it should show if a message is failed to sent by some reason, it should be displayed in the chat dialog so that the user can recognize and then try again if needs.
So, I think it is a redundacy for PUBSUB when it is applied for one-to-one chat.

![image](https://user-images.githubusercontent.com/52392004/82962776-2801c100-9ffc-11ea-91bc-ebb94843d553.png)

where Sender and Receiver are subscribed to a chat room with chat-id.

The proposed archecture is using PUBSUB to the endpoints which desn't have the redundancy and some of benefits to notice the received message and also manages a connection for multiple chat rooms.

![image](https://user-images.githubusercontent.com/52392004/82962567-89756000-9ffb-11ea-8e5a-7eb737fd6f37.png)

where Sender will publish to Receiver directly.


