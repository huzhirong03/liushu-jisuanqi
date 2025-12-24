// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  Service Worker - 实现离线功能 + 版本更新检测                               ║
// ╠═══════════════════════════════════════════════════════════════════════════╣
// ║  ⚠️ 每次更新程序时，修改 APP_VERSION！                                      ║
// ╠═══════════════════════════════════════════════════════════════════════════╣
// ║  版本历史:                                                                 ║
// ║  v2.4.0 - 2025-12-24 - 🔧 修复iOS Safari重定向错误(PWA打不开问题)           ║
// ║  v2.3.0 - 2025-12-20 - 简洁反馈UI：原文(号码)注数×金额=总额 盈亏            ║
// ║  v2.2.0 - 2025-12-20 - 重构分组解析+小票风格反馈UI                          ║
// ║  v2.1.1 - 2025-12-20 - 修复反馈页原文显示和分组渲染                         ║
// ║  v2.1.0 - 2025-12-20 - 分组解析系统 + 孤儿行智能检测                        ║
// ║  v2.0.0 - 2025-12-20 - 反馈系统v2.0: 完整调试链条 + 精准纠错UI              ║
// ║  v1.9.3 - 2025-12-17 - 下载文件名含类型版本(特码_V2_xxx.csv)                ║
// ║  v1.9.0 - 2025-12-17 - 提示词v2 + 边缘测试 + JSON自动导出                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
const APP_VERSION = 'v2.4.0';  // 修复iOS Safari PWA重定向错误
const CACHE_NAME = 'liushu-rocket-' + APP_VERSION;

// 🆕 v2.4.0 使用绝对路径，避免iOS Safari的重定向问题
const urlsToCache = [
    'index.html',
    'manifest.json',
    'icon-192.svg',
    'data.json'
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

// 🆕 v2.4.0 请求拦截 - 修复iOS Safari重定向问题
// 关键：对于导航请求(navigate)，必须使用网络优先策略，避免重定向错误
self.addEventListener('fetch', event => {
    const request = event.request;
    
    // 过滤掉不支持的请求（如chrome-extension等）
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // POST 请求不能缓存，直接走网络
    if (request.method !== 'GET') {
        event.respondWith(fetch(request).catch(() => new Response('Network error', { status: 503 })));
        return;
    }
    
    // 🆕 v2.4.0 【关键修复】导航请求(页面打开)使用网络优先策略
    // iOS Safari 不允许 Service Worker 返回重定向响应给导航请求
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // 只缓存成功的、非重定向的响应
                    if (response && response.status === 200 && response.type === 'basic') {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // 离线时尝试返回缓存的页面（必须精确匹配URL）
                    return caches.match(request);
                })
        );
        return;
    }
    
    // 对于 data.json，始终从网络获取最新数据
    if (request.url.includes('data.json')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(request);
                })
        );
        return;
    }
    
    // 对于 API 请求，始终走网络（不缓存）
    if (request.url.includes('api') || request.url.includes('marksix') || 
        request.url.includes('corsproxy') || request.url.includes('allorigins') ||
        request.url.includes('workers.dev') || request.url.includes('deepseek')) {
        event.respondWith(fetch(request).catch(() => new Response('Network error', { status: 503 })));
        return;
    }
    
    // 对于静态资源，使用 缓存优先 + 网络更新
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            // 如果缓存中有，直接返回缓存
            if (cachedResponse) {
                // 后台静默更新缓存（不阻塞页面加载）
                fetch(request).then(response => {
                    if (response && response.status === 200 && response.type === 'basic') {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, response);
                        });
                    }
                }).catch(() => {});
                return cachedResponse;
            }
            
            // 缓存中没有，才去网络获取
            return fetch(request).then(response => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                }
                return response;
            }).catch(() => {
                // 🆕 v2.4.0 网络失败时，不要返回不匹配的资源（避免重定向错误）
                // 只返回空响应，让浏览器显示默认错误页
                return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
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

