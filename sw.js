const CACHE='hospital-bed-manager-v5';
const SHELL=['./','./index.html','./manifest.json','./icon.svg','./icon-192.png','./icon-512.png'];
const LIBS=['https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js','https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(async c=>{
  await c.addAll(SHELL);
  // QR libraries भी ऑफ़लाइन के लिए सेव करें; न मिलें तो इंस्टॉल न रुके
  await Promise.allSettled(LIBS.map(u=>fetch(u,{mode:'no-cors'}).then(r=>c.put(u,r))));
}).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(resp=>{
    if(resp.ok&&new URL(req.url).origin===location.origin){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
    return resp;
  }).catch(()=>req.mode==='navigate'?caches.match('./index.html'):Response.error())));
});
