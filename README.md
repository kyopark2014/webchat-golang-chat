# webchat

### Basic Call Flow

Client <-> Server : Socket.io

![image](https://user-images.githubusercontent.com/52392004/82755922-c67dfe80-9e11-11ea-9344-24b1f79dd415.png)

Once one of client in a chatroom is not online, PUBSUB is not a good way to commnicate messages. So, the application server saves the message in Queue too using linked list. Then, once a client is back online, the message can be delivered to the client robustly.

