# webchat

### Basic Call Flow

In this application, I am targeting a web client which is one of supported clients for this chat service.
In order to make a seamless connection between web client and server, socket.io is a good way to support bidirectional message flow. Also, the application server is based on golang which have a strangth for massice transaction. 

Client <-> Server : Socket.io

#### Online
![alternative text](http://www.plantuml.com/plantuml/png/ZP51RnCn48Nlyoj6kPIg2Y9xv03r946i11BAgkA87EyqiUfuYZtRKX3_7GjtAHiYqRsizBstdv-rbrbjqk4G8D_uU6kJFQ0BDcVy0LWUikvcbsI8_LA29Foyzyg_4vEIt5T8eRHgNLBFwPWQrUItWtBh97R-E-Ch-0bdJoTcVGYCkRJSqPQid5ZquPQN9wUShBRFhwwVNpN_gmOVkHGP9UbU0CxKQs2SaStUuRiWzxYOgymN-EBJ5NLNT7u-Wxtl6Qz5T2lV0ApJ8ZQFRm9m4W8xzH8pVioxBjqjJh06UgjsQpFZYk3hm0FZPhrgkoy6JOURrM82gS86mE3ypUZ5r-WancA6aPImV5k2ChPRRbfQeu6_qnMLCDkxHpCQj7sVNW80FPcRVynDDJSJCy6OdZBJQ3xUF3latGpfQDN5HOdQZ3IUpFrRIAn3YbM4SbtDCBbG7LL-puUsUuzKxG05J-vJ-MGm_Q6N7FlX47u1)

#### Offline

![alternative text](http://www.plantuml.com/plantuml/png/ZLDDZn914BtNhtZBGJGRZ73qe3iDREImkc52Z2VJp1JGeUd2xXvmDVvtUsGsCn0IzpIPzr6lwYLz5wBsiTfP5DhQbPKZXQrnU-tr3eNL8U0t0O3InNRjfNBbMAnuVDsOoF-Op7ivda1ba-ea5r-olqIp6BrPLf5dXRZS_6Ayep_KRnD3VBACa5H5lHHr6VOiyMdFu-khN9FENYwTlboQ_KzgZUDQ2F5n8qJzQA9bz9GEfi1zAXd3GPJ14AyV5ofVg3SOG5QhsjUZZIaPAv6ub9z4keZYaJLVHLI8jLn48oxW8QnpVnXUmKPKwgYNEZ0cYkX7nHLZFftCykyPiXppoP3wNLITqAxls-ViuGjHXi67voIyHo7EfInga4GcMqsaE_BnVAQcoAZBJbGYWpuqISYWozA_9IBLJXxXvgOp_3Aqjmlh7jJ5sDlRHCq2rBEFou_aELRUmKbtYUQOMku2-mXr6dbUv-CY_zGrrV_9SjHR7bHxAA8QgHdLmXTdf9tQC_eDUYffT5QI8gAMRXUSS_I63upyrJrs789UCsG51Q96r8bhgZaRfLhqZbrPloEYlm00)

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
