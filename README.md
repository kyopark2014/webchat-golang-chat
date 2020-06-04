# webchat-golang-chat

It is a chat server based on PUBSUB. In order to make a seamless connection between web client and server, socket.io is a good way to support bidirectional message flow. Also, the application server is based on golang which have a strangth for massice transaction. 

### Basic Call Flow

Client <-> Server : Socket.io
 
#### PUBSUB
![alternative text](http://www.plantuml.com/plantuml/png/ZPF1ZjCm48RlynIZN9OzLA8zSa1hjqL4Oc7Lg48SNMTsQwsRAVQ4KX3lZaCmkwuYiJaayZ-Vv_ilkObYWlG7ZzPuV-_v1F7HTKSJp06jDp7YJy3qQ6CV7mBtNRjapm4_xvtGduaAWKzZg7sYHfn3I-4oLIB1xNgXsdBNk1-4h-4NN3qPevmzfNTmTYW5poSKYELyfELabKcqVZcwVZcg_eTwrz408WVPCy2LEF64bJRHMNpd-OJpcV1iZg_kjhhPwklh2lQk9RndbXr_1p1MEA3w-zK0bhqdAuwxYFNj_EAy0FZQKq-uMQ_g1bM3cnL0QyJiJ2HSVVceRZy1A9oz7MxZ6xJSTMG5qca8DwkKDQdCSbFhTHA37jb5mIucM5tihGxneK9Xr7drA4-ZA1ne1A3mtctrXxfvZpeFK_fFFaRPhPyI_OnfoRjl5CuLPBBSh0eahv-NLtCdTH7hB0vasacxYqTl1dJQdO5IdUF2NAHmGrqx_0O0lm40)


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




