if("serviceWorker" in navigator){
    navigator.serviceWorker.register("service-worker.js")
        .then(result => {
            console.log(`Service Worker running, Scope: ${result.scope}`)
        })
        .catch(error => {
            console.error(error)
        })
} else {
    console.log("Service Worker not supported by the browser.")
}