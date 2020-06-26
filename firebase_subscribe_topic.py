import firebase_admin
from firebase_admin import credentials, messaging

cred = credentials.Certificate('watchbot-afbb0-firebase-adminsdk-3hqrt-6d67384502.json')
default_app = firebase_admin.initialize_app(cred)

#token = "dPSGvd9j45s:APA91bGDsMCRdhky567I5VllZOS-QJ-QpMj8vDzT_nA0PPfkFv2BEfnluDCwNnWQ1d2Tj72249rLTj7GWB0DK4webNBVn_vCEaiaCleR3hZCKf0SSSS1V2RpSopJFGMYASHsxOiUgMds"
token = "f6YxOdHuf34:APA91bFOJeRRzvtmtzGg4NVggqfGFhFpBkWRg5an2q8p0gCyVDDw5lzynmzWXWWHUwzd-8ceDKW4V9FlA17HuzKn4XlntK2H45f3Xr9iB_ISvMQUEM9wJkH94vXzWztp279Ot19kVhrI"


message = messaging.Message(
    data={
        'score': '850',
        'time': '2:45',
    },
    token=token,
)


### SEND MESSAGE TO TOKEN
# Response is a message ID string.
#response = messaging.send(message)
#print('Successfully sent message:', response)


### SUBSCRIBE TOKENS TO TOPIC
#response = messaging.subscribe_to_topic([token], "auction_list")
#print('Successfully subscribed tokens:', response.success_count)


### SEND MESSAGE TO TOPIC
message_to_topic = messaging.Message(
    data={
        'message': 'message to topic',
    },
    topic="auction_list",
)
response = messaging.send(message_to_topic)
print('Successfully sent message to topic:', response)
'''
'''
