/* Offline cache limited to the static BANKFLOW shell; never cache API responses. */
const CACHE='bankflow-shell-e3173fca8f07';
const SHELL=['./','./index.html','./manifest.webmanifest','./kanygin.html','./modules/07-standards/variant-3.docx','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('bankflow-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.includes('/api/')||!url.href.startsWith(self.registration.scope))return;
 if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(response=>{if(!response.ok)throw Error('unavailable');return response}).catch(async()=>await caches.match(event.request)||caches.match(new URL('./index.html',self.registration.scope))));return}
 if(SHELL.some(p=>new URL(p,self.registration.scope).pathname===url.pathname))event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
});
