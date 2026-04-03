// 好糰 Goood — Service Worker
// 離線快取 + 推播通知 + 背景同步

const CACHE_NAME = 'goood-v1';
const OFFLINE_URL = '/offline.html';

// 預先快取的靜態資源
const PRE_CACHE = [
  '/',
  '/index.html',
  '/driver.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700&display=swap'
];

// ── 安裝：預先快取靜態資源 ──
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching resources');
      return cache.addAll(PRE_CACHE);
    })
  );
  // 立即啟用，不等舊 SW 結束
  self.skipWaiting();
});

// ── 啟用：清除舊快取 ──
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Removing old cache:', k);
          return caches.delete(k);
        })
      )
    )
  );
  // 立即接管所有頁面
  self.clients.claim();
});

// ── Fetch：Network-first 策略 ──
self.addEventListener('fetch', event => {
  const { request } = event;

  // 只處理 GET 請求
  if (request.method !== 'GET') return;

  // API 請求不快取
  if (request.url.includes('firebasedatabase.app') ||
      request.url.includes('cloudfunctions.net') ||
      request.url.includes('api.anthropic.com')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        // 成功取得網路回應 → 存入快取
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(async () => {
        // 網路失敗 → 從快取取
        const cached = await caches.match(request);
        if (cached) return cached;

        // 導航請求 → 顯示離線頁面
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }

        return new Response('Offline', { status: 503, statusText: 'Offline' });
      })
  );
});

// ── 推播通知：接收 FCM 訊息 ──
self.addEventListener('push', event => {
  console.log('[SW] Push received');

  let data = { title: '好糰 Goood', body: '您有新的通知' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || '您有新的通知',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'goood-notification',
    renotify: true,
    data: {
      url: data.url || '/index.html'
    },
    actions: data.actions || [
      { action: 'open', title: '查看' },
      { action: 'close', title: '關閉' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '好糰 Goood', options)
  );
});

// ── 推播通知：點擊處理 ──
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // 如果已有視窗開著，就聚焦到該視窗
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // 否則開新視窗
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ── 背景同步（預留） ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-orders') {
    console.log('[SW] Background sync: sync-orders');
    // 未來可用來同步離線時的操作
  }
});
