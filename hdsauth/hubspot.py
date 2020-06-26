import requests
import json
from datetime import datetime, date
import logging

logger = logging.getLogger('bc.log')
from json import dumps


HUBS_HEADERS = {}
HUBS_HEADERS['Content-Type'] = 'application/json'
KEY_HUBSPOT='5280363f-d12b-4182-89c9-a1c9cdc67b2d'

class Hubspot():

    headers = HUBS_HEADERS

    def insert_contact(self, email, firstname, lastname, newsletteractive):
        endpoint_insert = 'https://api.hubapi.com/contacts/v1/contact/?hapikey='+KEY_HUBSPOT
        data = json.dumps({
            "properties": [
                {
                    "property": "email",
                    "value": email
                },
                {
                    "property": "firstname",
                    "value": firstname
                },
                {
                    "property": "lastname",
                    "value": lastname
                },
                {
                    "property": "newsletteractive",
                    "value": newsletteractive
                },
            ]
        })
        r = requests.post(data=data, url=endpoint_insert, headers=self.headers)
        logger.info("HUBSPOT CREATE")
        logger.info(r)

    def update_contact(self, email, firstname, lastname, newsletteractive):
        endpoint_update= 'https://api.hubapi.com/contacts/v1/contact/email/'+email+'/profile?hapikey='+KEY_HUBSPOT

        data = json.dumps({
            "properties": [
                {
                    "property": "email",
                    "value": email
                },
                {
                    "property": "firstname",
                    "value": firstname
                },
                {
                    "property": "lastname",
                    "value": lastname
                },
                {
                    "property": "newsletteractive",
                    "value": newsletteractive
                },
            ]
        })
        r = requests.post(data=data, url=endpoint_update, headers=self.headers)
        logger.info("HUBSPOT UPDATE")
        logger.info(r)


def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError("Type %s not serializable" % type(obj))
