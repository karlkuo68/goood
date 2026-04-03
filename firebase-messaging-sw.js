// Firebase Cloud Messaging Service Worker
// 這個檔案必須放在根目錄，名稱不能改

// 如果你使用 Firebase JS SDK，取消下面的註解並填入你的 Firebase 設定
// importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// firebase.initializeApp({
//   apiKey: "YOUR_API_KEY",
//   authDomain: "goood-orders.firebaseapp.com",
//   projectId: "goood-orders",
//   storageBucket: "goood-orders.appspot.com",
//   messagingSenderId: "YOUR_SENDER_ID",
//   appId: "YOUR_APP_ID"
// });

// const messaging = firebase.messaging();

// 背景訊息處理（App 在背景時收到推播）
// messaging.onBackgroundMessage((payload) => {
//   console.log('[FCM-SW] Background message:', payload);
//   const { title, body, icon, url } = payload.notification || payload.data || {};
//   self.registration.showNotification(title || '好糰 Goood', {
//     body: body || '您有新的通知',
//     icon: icon || '/icons/icon-192.png',
//     badge: '/icons/icon-72.png',
//     vibrate: [200, 100, 200],
//     data: { url: url || '/index.html' }
//   });
// });
