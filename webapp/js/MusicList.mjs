import {$, join} from "./utils.mjs"

export default class MusicList{
    constructor(parent, config){
        this.root = typeof parent === "string" ? document.querySelector(parent) : parent

        this.albums = {}

        this.onUpdateHook = config.onUpdate
        this.onPlayPlaylistHook = config.onPlayPlaylist
        this.onPlaySongHook = config.onPlaySong
    }

    update(){
        const albums = this.onUpdateHook()

        for (let i = 0; i < albums.length; i++) {
            const album = albums[i];

            if(this.albums[album]) continue

            this.addAlbum(album)
        }

        this.render()
    }

    addAlbum(data){
        data.songs = data.songs.map(song => {
            return {
                ...song, songPath: join(data.server, data.songRoute, data._album, song._title)
            }
        })
            
        this.albums[data._album] = this.createAlbum(data)
    }

    render(){
        const albums = Object.values(this.albums)

        for(let i = 0, l = albums.length, parent = this.root; i < l; i++){
            parent.appendChild(albums[i].element)
        }
    }

    createAlbum({server, album, _album, albumRoute, songRoute, songs, cover}){
        const playButtonEl = $('button', {className: "icon-s musicplayer-icon-play pointer"})
        playButtonEl.dataset.album = _album
        playButtonEl.dataset.server = server
        playButtonEl.addEventListener("click", async (e) => {
            const {album} = e.target.dataset
            this.onPlayPlaylistHook(this.albums[album])
        })

        const songsListEl = $("div", {className: "albumSongs hidden"})

        const albumNameEl = $("div", {className: "albumName"}, album)
        albumNameEl.addEventListener('click', (e) => {
            songsListEl.classList.toggle("hidden")
        })

        const albumEl = $("div", {className: "album"}, [
            $("div", {className: "albumHeader"}, [
                albumNameEl,
                playButtonEl
            ]),
            songsListEl
        ])

        songs = songs.map((obj, i) => this.createSong(obj, i))
        
        songsListEl.append(...songs.map(s => s.element))

        return {
            element: albumEl,
            name: album,
            server,
            route: join(server, albumRoute),
            songs,
            cover: join(server, songRoute, _album, cover)
        }
    }

    createSong(data, index){
        const songEl = $("div", {className: "song"}, data.title)
        songEl.dataset.index = index

        songEl.addEventListener('click', (e) => {
            const {album} = e.target.parentElement.parentElement.querySelector(".albumHeader button").dataset
            const {index} = e.target.dataset
            this.onPlaySongHook(this.albums[album], index)
        })
        return {...data, element: songEl}
    }
}