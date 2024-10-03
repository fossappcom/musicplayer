import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { parseArgs } from "util"

import { Elysia } from "elysia"
import { staticPlugin } from "@elysiajs/static"
import { bearer } from "@elysiajs/bearer"
import { cors } from "@elysiajs/cors"

import Sharp from "sharp"

function createNewCoverName(path: string){
    let newPath = path.split(".")
    newPath[newPath.length-2] += "-mobile"
    return newPath.join(".")
}

function getCoverSize(coverSize: string){
    const size = coverSize.split("x")
    return [parseInt(size[0]), parseInt(size[1])]
}

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

const { MUSICFOLDER, PORT, COVERSIZE } = Bun.env || values
const [COVER_W, COVER_H] = getCoverSize(COVERSIZE)

const app = new Elysia()
    .use(cors({
        origin: "*"
    }))
    .use(staticPlugin({
        assets: MUSICFOLDER,
        prefix: "/song",
        enableDecodeURI: true
    }))

app.get("/cover/:album/:cover", async ({params: {album, cover}}) => {
    const newCoverName = createNewCoverName(cover)
    const newCoverPath = join(MUSICFOLDER, album, newCoverName)
    const coverPath = join(MUSICFOLDER, album, cover)
    
    const coverFile = Bun.file(newCoverPath)
    if(await coverFile.exists()){
        return coverFile
    }else{
        await Sharp(coverPath)
            .resize(COVER_W, COVER_H)
            .toFile(newCoverPath)
    }
    
    return Bun.file(newCoverPath)
})

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