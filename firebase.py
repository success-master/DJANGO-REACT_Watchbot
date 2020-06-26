import firebase_admin
from firebase_admin import credentials, messaging

cred = credentials.Certificate('watchbot-afbb0-firebase-adminsdk-3hqrt-6d67384502.json')
default_app = firebase_admin.initialize_app(cred)

token = "dkrZzvyCytk:APA91bEmxFvznE8U-O7nXXcLyEJQmgExHw93gmMplO989Pu_avVf2fjrfYrVJL2NQqDVshw4-oOFlmFrSipTvWjMPSKQFGuivzrSFGW97afdRWrfvjVd5X-g_hRWTB1_y6I0x7yHln6w"


message = messaging.Message(
    data={
        'score': '850',
        'time': '2:45',
    },
    token=token,
)


### SEND MESSAGE TO TOKEN
# Response is a message ID string.
response = messaging.send(message)
print('Successfully sent message!!!:', response)


### SUBSCRIBE TOKENS TO TOPIC
#response = messaging.subscribe_to_topic([token], "prova")
#print('Successfully subscribed tokens:', response.success_count)


### SEND MESSAGE TO TOPIC
'''
message_to_topic = messaging.Message(
    data={
        'message': 'message to topic',
    },
    topic="prova",
)
response = messaging.send(message_to_topic)
print('Successfully sent message:', response)
'''
