const cacheName = "foss-musicplayer-cache"

const cachedFiles = [
    "/",
    "/index.html",
    "/manifest.json",
    "/main.js",
    "/style/style.css",
    "/scripts/script.js",
    "/pwa-icons/pwa_icon_16x16.png",
    "/pwa-icons/pwa_icon_24x24.png",
    "/pwa-icons/pwa_icon_32x32.png",
    "/pwa-icons/pwa_icon_48x48.png",
    "/pwa-icons/pwa_icon_64x64.png",
    "/pwa-icons/pwa_icon_72x72.png",
    "/pwa-icons/pwa_icon_96x96.png",
    "/pwa-icons/pwa_icon_128x128.png",
    "/pwa-icons/pwa_icon_256x256.png",
    "/pwa-icons/pwa_icon_512x512.png"
]

self.addEventListener("install", function(e){
    e.waitUntil(
        caches.open(cacheName).then(function(cache){
            return cache.addAll(cachedFiles)
        }).then(() => {
            return self.skipWaiting()
        }).catch(err => {
            console.error("Service Worker Cache failed:", err)
        })
    )
})

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request.url).then(response => {
            return response || fetch(e.request)
        })
    )
})