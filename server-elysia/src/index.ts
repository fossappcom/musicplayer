import { readdir } from "node:fs/promises"
import { join } from "node:path"

import { Elysia } from "elysia"
import { staticPlugin } from "@elysiajs/static"
import { bearer } from "@elysiajs/bearer"
import { cors } from "@elysiajs/cors"

const MUSIC_FOLDER_PATH = "/music"

const app = new Elysia()
    .use(cors({
        origin: "*"
    }))
    .use(staticPlugin({
        assets: MUSIC_FOLDER_PATH,
        prefix: "/song",
        enableDecodeURI: true
    }))

app.get("/music", async () => {
    const albums = await readdir(MUSIC_FOLDER_PATH)
    return albums
})

app.get("/album/:album", async ({params: {album}}) => {
    const songs = await readdir(join(MUSIC_FOLDER_PATH, album))
    return songs.sort()
} )

app.listen(8080)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)