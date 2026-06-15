const CACHE_NAME="fitness-beta-v6";
self.addEventListener("install",event=>{event.waitUntil(self.skipWaiting())});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("fitness-beta-")&&key!==CACHE_NAME).map(key=>caches.delete(key)))));self.clients.claim()});
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;const isBetaAsset=new URL(event.request.url).pathname.includes("/fitness/beta/");const request=isBetaAsset?new Request(event.request,{cache:"reload"}):event.request;event.respondWith(fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request))) });
