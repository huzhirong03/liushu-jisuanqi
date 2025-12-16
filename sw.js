// Service Worker - 实现离线功能 + 版本更新检测
// ⚠️ 每次更新程序时，修改这个版本号！
const APP_VERSION = 'v1.5.0';  // AI预处理优化 + 提示词增强（各字语义）
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

// 请求拦截 - 缓存优先策略（大幅减少流量消耗！）
self.addEventListener('fetch', event => {
    // POST 请求不能缓存，直接走网络
    if (event.request.method !== 'GET') {
        event.respondWith(fetch(event.request).catch(() => new Response('Network error', { status: 503 })));
        return;
    }
    
    // 对于 data.json，始终从网络获取最新数据
    if (event.request.url.includes('data.json')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }
    
    // 对于 API 请求，始终走网络（不缓存）
    if (event.request.url.includes('api') || event.request.url.includes('marksix') || 
        event.request.url.includes('corsproxy') || event.request.url.includes('allorigins') ||
        event.request.url.includes('workers.dev') || event.request.url.includes('deepseek')) {
        event.respondWith(fetch(event.request).catch(() => new Response('Network error', { status: 503 })));
        return;
    }
    
    // 【重要改动】对于静态资源，使用 缓存优先 + 网络更新
    // 这样可以大幅减少流量消耗！
    
    // 过滤掉不支持的请求（如chrome-extension等）
    if (!event.request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // 如果缓存中有，直接返回缓存（不消耗流量！）
            if (cachedResponse) {
                // 后台静默更新缓存（不阻塞页面加载）
                fetch(event.request).then(response => {
                    if (response && response.status === 200) {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, response);
                        });
                    }
                }).catch(() => {});
                return cachedResponse;
            }
            
            // 缓存中没有，才去网络获取
            return fetch(event.request).then(response => {
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            }).catch(() => {
                // 网络也失败，返回离线页面
                return caches.match('./index.html');
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

