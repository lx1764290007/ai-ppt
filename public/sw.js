
const MANIFEST_URL = "/cache-manifest.json", DEFAULT_LIMIT = 100;
let cache_name = String(~~Date.now()), limitCount = DEFAULT_LIMIT; //缓存数量最大限制
const urlsToCache = [
  '/index.html',
  // '/src/assets/image1.png', // 明确列出所有需要缓存的图片
  // '/src/assets/image2.jpg',
  // 添加其他需要缓存的资源...
];

// 安装阶段
self.addEventListener('install', event => {
  event.waitUntil(

    caches.open(cache_name).then(cache => {
      self.skipWaiting();
      return cache.addAll(urlsToCache);
    })
  );
});

// 激活阶段
self.addEventListener('activate', event => {

  event.waitUntil(
     fetch(MANIFEST_URL).then((response) => {
       return response.json();
     }).then((res)=>{
       if(res){
         caches.keys().then((cacheNames) => {
           return Promise.all(
             cacheNames.map((cacheName) => {
               if (cacheName !== res.version) {
                 console.log(`Deleting old cache~: ${cacheName}`);
                 return caches.delete(cacheName);
               }
             })
           );
         })
         cache_name = res.version;
         limitCount = res.limit;

       }
     }).catch(err=>{
       console.error('Service Worker fetch failed:', err);
     })
   )
});
//動態緩存
self.addEventListener('fetch', (event) => {
  const request = event.request;
  // 检查请求类型是否为图片
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // 返回缓存中的图片
          return cachedResponse;
        }

        // 如果没有缓存，尝试从网络获取并缓存
        return fetch(request)
          .then((networkResponse) => {
            return caches.open(cache_name).then((cache) => {
              cache.put(request, networkResponse.clone()); // 缓存图片
              limitCacheSize(cache_name, limitCount); // 限制缓存大小
              return networkResponse;
            });
          })
          .catch((error) => {
            console.error('Fetch failed; returning placeholder image.', error);
            // 返回占位图片或其他处理逻辑
          });
      })
    );
  }
});

// 限制缓存大小（可选功能）
function limitCacheSize(cacheName, maxSize) {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > maxSize) {
        cache.delete(keys[0]).then(() => limitCacheSize(cacheName, maxSize));
      }
    });
  });
}