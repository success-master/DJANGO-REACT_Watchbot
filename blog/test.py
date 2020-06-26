import requests
import json

url2 = 'https://api.hubapi.com/properties/v1/contacts/properties?hapikey=20e5b683-5375-4d71-9a34-93fe5ce35ddc'

r2 = requests.get(url=url2)
print(r2.text)