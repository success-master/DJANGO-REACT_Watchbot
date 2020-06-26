importScripts('https://www.gstatic.com/firebasejs/5.3.1/firebase.js');
importScripts('https://www.gstatic.com/firebasejs/5.3.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.3.1/firebase-messaging.js');

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

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here

    messageReceived(payload);
    /*
  var notificationTitle = 'Background Message Title';
  var notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
    */
});