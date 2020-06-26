
//importScripts('https://www.gstatic.com/firebasejs/5.4.1/firebase.js');
importScripts('https://www.gstatic.com/firebasejs/5.4.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.4.1/firebase-messaging.js');

// Initialize Firebase
var config = {
    apiKey: "AIzaSyD_LuTv-rh6GlQ-sjraC9paG4QkacaaB0I",
    authDomain: "watchbot-afbb0.firebaseapp.com",
    databaseURL: "https://watchbot-afbb0.firebaseio.com",
    projectId: "watchbot-afbb0",
    storageBucket: "watchbot-afbb0.appspot.com",
    messagingSenderId: "108225665252"
};

firebase.initializeApp(config);


var messaging = firebase.messaging();

// Install Service Worker
self.addEventListener('install', function(event){
    console.log('installed!');
});

// Service Worker Active
self.addEventListener('activate', function(event){
    console.log('activated!');
});

/*
self.addEventListener('message', function(event){
    console.log("SW Received Message: " + event.data);
    event.ports[0].postMessage("SW Says 'Hello back!'");
});
*/

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  .then((windowClients) => {
    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i];
      windowClient.postMessage(payload);
    }
  })
  .then(() => {
    //return registration.showNotification('my notification title');
  });
  return promiseChain;

  // Customize notification here
 /*
  var notificationTitle = 'Watchbot Message';
  var notificationOptions = {
    body: 'Aggiornamento aste',
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
 */
});
