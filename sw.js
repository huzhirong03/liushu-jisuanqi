// Service Worker - 实现离线功能 + 版本更新检测
// ⚠️ 每次更新程序时，修改这个版本号！
const APP_VERSION = 'v1.0.1';
const CACHE_NAME = 'liushu-rocket-' + APP_VERSION;

const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.svg',
    './data.json'
];

// 安装事件 - 缓存资源
self.addEventListener('install', event => {
    console.log('🚀 Service Worker 安装中... 版本:', APP_VERSION);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 缓存资源中...');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.log('缓存失败:', err);
            })
    );
    // 立即激活新版本
    self.skipWaiting();
});

// 激活事件 - 清理旧缓存 + 通知页面
self.addEventListener('activate', event => {
    console.log('✅ Service Worker 已激活，版本:', APP_VERSION);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // 删除所有旧版本缓存
                    if (cacheName !== CACHE_NAME && cacheName.startsWith('liushu-rocket-')) {
                        console.log('🗑️ 清理旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // 通知所有页面有新版本
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_UPDATED',
                        version: APP_VERSION
                    });
                });
            });
        })
    );
    // 立即控制所有页面
    self.clients.claim();
});

// 请求拦截 - 网络优先策略（确保获取最新内容）
self.addEventListener('fetch', event => {
    // 对于 data.json，始终从网络获取最新数据
    if (event.request.url.includes('data.json')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // 网络成功，更新缓存
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // 网络失败，使用缓存
                    return caches.match(event.request);
                })
        );
        return;
    }
    
    // 对于 API 请求，始终走网络
    if (event.request.url.includes('api') || event.request.url.includes('marksix')) {
        event.respondWith(fetch(event.request));
        return;
    }
    
    // 对于其他资源，使用 网络优先 + 缓存兜底
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request).then(response => {
                    return response || caches.match('./index.html');
                });
            })
    );
});

// 监听来自页面的消息
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: APP_VERSION });
    }
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

