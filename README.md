# webchat-golang-chat

It is a chat server based on PUBSUB. In order to make a seamless connection between web client and server, socket.io is a good way to support bidirectional message flow. Also, the application server is based on golang which have a strangth for massice transaction. 

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

### Basic Call Flow

Client <-> Server : Socket.io
 
#### PUBSUB
![alternative text](http://www.plantuml.com/plantuml/png/ZOv1ZzCm48Nlyoj6kInxg4Hwv83MBek811BQQCNPwmojLSTJx0cb8FuxBgbL4aMYkKJ-_Fczzv34H1bw3sdlmi54qwFr9YNy1PW_RUn-6ta8tOOzH_ooSq9_RrICV1oXzjaQTOuTnJbL8j6z34ADvT2wduIluJVSNHkJd3nXofQTRKb2aLXE1zeiJrbIczlLnzjLzJ_Lkq1d4JdAZW7kn8adhBH9pk9xpqUiLyAh6bzzVjRjixw_hs3dEiAlpFB2Fm2C5OweBdyDODbxik8u96m-rRFp6k3RG0FXc8UgnQTt00fNRyysla7B8MGVyYd3V9jPc-NDKwCVSn7eqLrFtFM2goUvLP-s5GfdFCdEGpusxGVKem6GQIcue9AlhqJ_utJatNUAfmf6Svwi9ag9hwTFooOrmxeKHpBTOhjB1s-okjnTX7brmVFcGXyeT4Fl_m00)







