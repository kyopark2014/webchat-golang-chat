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
 
#### Online : PUBSUB 
If the receiver is online, the message will be delivered by PUBSUB.

![alternative text](http://www.plantuml.com/plantuml/png/ZPD1Rnen48NlyoicN087f91Z3sdMGDkLqYe5ePuTxonOc1rgUvlIgl-zOot46uJQd93VVFFUpA2z3r7xsEuS6krSxVWPmjOsU-tr3etJ8U1lG4HKscpNdjkcch9ZZzysDbAgOE4zFtUYSa9rEFkA_BbQnEZjKnkfDDmixI_26_W3rpann8CZ34APD1JqA-I9us5FqukZN4JBjwFpjwF5_r1d6qeWieyR1hYEDZh2WTB16lmWHyR9EF9uWiF7bLgkr6WqW8sj26lc-CG_0RI9ObmSVnM0OUV8HCjDmFBpvEnz2_2zfPQmyyDYYOlPIVkwcg_cIPg9Ju7ZksI0xz1mquW5o4j4QH1DcfVJHQc41r0TUujNLnd7OQsjeshqockm2-i1HawZYf8BPK25tAIJl7yfpPHKWcn6nyRXud6r_8IgUuwEqOdYkawzuxlEepTKNW3aUM43rHLEUMP3Peix2a6lAU3mOL5y-JZ76nnF972MVRiXNffLLlfCHSx-87yGkP-V_e67KdOfNY5IohVA-kaWnPcSz_UagulnDkoT_aTw9lhXMJxBpdRtr5JfsmFu2m00)

#### Offline: QUEUING
If the receiver is offline, the message will be queued in database as bellow.

![alternative text](http://www.plantuml.com/plantuml/png/ZPD1Rnen48NlyoicN087f91Z3sdMGDkLqYe5ePuTxonOc1rgUvlIgl-zOot46uJQd93VVFFUpA2z3r7xsEuS6krSxVWPmjOsU-tr3etJ8U1lG4HKscpNdjkcch9ZZzysDbAgOE4zFtUYSa9rEFkA_BbQnEZjKnkfDDmixI_26_W3rpann8CZ34APD1JqA-I9us5FqukZN4JBjwFpjwF5_r1d6qeWieyR1hYEDZh2WTB16lmWHyR9EF9uWiF7bLgkr6WqW8sj26lc-CG_0RI9ObmSVnM0OUV8HCjDmFBpvEnz2_2zfPQmyyDYYOlPIVkwcg_cIPg9Ju7ZksI0xz1mquW5o4j4QH1DcfVJHQc41r0TUujNLnd7OQsjeshqockm2-i1HawZYf8BPK25tAIJl7yfpPHKWcn6nyRXud6r_8IgUuwEqOdYkawzuxlEepTKNW3aUM43rHLEUMP3Peix2a6lAU3mOL5y-JZ76nnF972MVRiXNffLLlfCHSx-87yGkP-V_e67KdOfNY5IohVA-kaWnPcSz_UagulnDkoT_aTw9lhXMJxBpdRtr5JfsmFu2m00)






