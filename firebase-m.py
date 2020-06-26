import firebase_admin
from firebase_admin import credentials, messaging

cred = credentials.Certificate('watchbot-afbb0-firebase-adminsdk-3hqrt-6d67384502.json')
default_app = firebase_admin.initialize_app(cred)

token = "eK5Ghwe59zM:APA91bFPhPD6h4HEUJDntvLse_JVBmn2ucTy_O4v2DRlsNpb_7lEaY9fVj2FKsegMW6UpveRBY-BR3GYW05PUEUTDNIO7toCTGB1tJkNVU3WKQrQ1opQDf_StgbSn-R0-d1SUDHxc7sk"


message = messaging.Message(
    data={
        'score': '8510',
        'time': '2:45',
    },
    token=token,
)


### SEND MESSAGE TO TOKEN
# Response is a message ID string.
response = messaging.send(message)
print('Successfully sent message:', response)


### SUBSCRIBE TOKENS TO TOPIC
#response = messaging.subscribe_to_topic([token], "prova")
#print('Successfully subscribed tokens:', response.success_count)

### UNSUBSCRIBE TOKENS TO TOPIC
#response = messaging.unsubscribe_from_topic([token], "auction_list")
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
