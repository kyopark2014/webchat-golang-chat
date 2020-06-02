# webchat

### Basic Call Flow

In this application, I am targeting a web client which is one of supported clients for this chat service.
In order to make a seamless connection between web client and server, socket.io is a good way to support bidirectional message flow. Also, the application server is based on golang which have a strangth for massice transaction. 

Client <-> Server : Socket.io

#### Overall
![alternative text](http://www.plantuml.com/plantuml/png/ZPD1Rzf048Nlyoj6N0AAKj4SUuZY1PIuQGB2H56Fotg05Ok7hiT9QTN_tjqON9CY9LoGt_jctinOlYv5Uwas3ersRk7u1SgrBRRQwmqQfyiIVmE6dz9clVHS5Vc07NjyMbcXLoVndbzgKRb0rJZxdFnRDH7nTbu9fOQBpFuYxCCVEFkNMChE4PQ1Cd4eQ3laYMMtfS79KKwYwSVHqSVHv3tKsO8YYEnbnG1dOiKHTjB2YjLYkUZ0okQ42sQPyqy0ROGz9lj_1M3OEJ8HBV69vibsUwobzv_VF5z2haNFTKauL00_Age8fwDXcc6IuNG8BV_xGt8_1aZmuk9gtnw_uEriDi6RqGoxZfUsw27ihG0DLG3CYimQdxMpkPKT1ArTFhw3fY3eIP0k-_tn7S9_IHa9JZmlhAF0TMDmhnKs7UwPWGwHBQCUF9hwcPeETV-hU9Cu91S56S5koMPDyibo3wBJz7rKsM2QgX4c02hAhwjvqa9XGosUUGDmlDlDgO6F9pu_hxa3fi2JLBx0HcWNgFew6CxJ_PgD7tfOHyON6QpEfbnsZbQ0QBHFK98SiBaswshRCFMUaqVrBSrkCQafWA0sHwgbmrtKwKI0Qoho-1a2_0K0)

#### Online
![alternative text](http://www.plantuml.com/plantuml/png/ZPF1RXen48RlynGZBcaEI8LZ3rNMGDMLcZPYXQeUZNSIh1WFjMTBQTLthxUBHHojL3Y0_Czd_zySk8kYWtHxXqOxz-Zu2F7P-eCEUe_6wHZnDs3wA6sUdm9tlbsmuu1VTrRetwGAWOz3g5oY1fn3I-5rMea4k-s4QiE-iRy8ty8VkBaqHZavIj_1cbuANaue4ClfG8jHbL6qlXvTNOzM_qETzTI3o45s370ZLXpXHEbe3NvmVCJPL7WwmpSF6zLirEtj17Qs9NnabYt_1D16E61r_bK0XfqZ8vPznFf-zkey1_ZUKKUuNYth1gi6rqk0LelUwaYu_FQvkly2KE7qVNyRtw5Xxya8zASKhfSfIoRDObshLIe6DR3pWfsFiAfuTxAFJnCKHfMV7ihJA0e76W0eUXyswbFTV4ILXodDvJawTwjBebumBJdxWy9f08lMD2AXivVsRTQuNCbtIfcgGBBHh6pBQrJZSIbHbggyJY3TZkvauy7faPNo1WKmwf-1KZ_7XNsHZijVY3loRV_t1FWB)

#### Offline

![alternative text](http://www.plantuml.com/plantuml/png/ZPB1QXin48RlynGJNz8S5keSVGXPsIvTQDhY9PGUPUtO5fOrhZGRrorzzqe8iziGg4zYllbcz6lPnoWwI7zmQBHp6ySdY7lhZphe0ngdOyJVW8YejDbl0_U-cxFZWDzsLWXofmw1JmKgbwoYS-WelAQrIB3hNgWnx5lxY_0z_87RuSOePqSOasLoA1XtA13B-KZpjwEyfJRNgylhrVf_ghEUieWSPCS0jsB54KwKZjRW1ySdd5R2rHJVVNrMxREwkvl0pdQ46sPPyqy0ROG3rb1E1M3OEJ9YsKTidgQlwdk07ptrXAlbeccnRd6r0EYqwBMEX8lld-kdBm0rLWzv6cTesFiq3wbACEc9jIdCVDMe9TO0ghZtU7CpsECDaqFSJb0OrML9kIQrOWfDHO3H3NbJUl2dfls8wjzsuWdEyAJtLFL7W5ndhiPGNGXlDlaZLm_iypbAEygQoY7L30D9iFH29Ls71ufHRmcW2CE24kmohWQYHav7phvGE5_4qUjJYuJA40B08_ak_ym0Vm40)

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
