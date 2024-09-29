import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { parseArgs } from "util"

import { Elysia } from "elysia"
import { staticPlugin } from "@elysiajs/static"
import { bearer } from "@elysiajs/bearer"
import { cors } from "@elysiajs/cors"

const { values } = parseArgs({
    args: Bun.argv,
    options: {
        MUSICFOLDER: {
            type: "string"
        },
        port: {
            type: "string"
        }
    },
    allowPositionals: true
})

const { MUSICFOLDER, PORT } = Bun.env || values

const app = new Elysia()
    .use(cors({
        origin: "*"
    }))
    .use(staticPlugin({
        assets: MUSICFOLDER,
        prefix: "/song",
        enableDecodeURI: true
    }))

app.get("/music", async () => {
    const albums = await readdir(MUSICFOLDER)
    return albums
})

app.get("/album/:album", async ({params: {album}}) => {
    const songs = await readdir(join(MUSICFOLDER, album))
    return songs.sort()
} )

app.listen(PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)