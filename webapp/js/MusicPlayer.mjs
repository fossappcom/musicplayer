import {join} from "./utils.mjs"

export default class MusicPlayer{
    constructor(config){

        this.timePlayed = 0
        this.songDuration = 0

        this.playlist = {}
        this.playlistPlayingIndex = 0

        this.serverList = {}
        
        const serverList = localStorage.getItem('serverList')
        if(serverList){
            this.serverList = JSON.parse(serverList)
        }

        if(config.hooks){
            this.hooks = config.hooks
        }
        
        if(config.elements){
            const {audio, songDuration, timeSlider, timePlayed, playButton, volumeSlider, volumeText, muteButton, coverImage, playNextSongButton, playPrevSongButton, playingSongText} = config.elements

            this.audioEl = document.querySelector(audio)
            this.songDurationEl = songDuration ? document.querySelector(songDuration) : songDuration
            this.songSliderEl = timeSlider ? document.querySelector(timeSlider) : timeSlider
            this.timePlayedEl = timePlayed ? document.querySelector(timePlayed) : timePlayed
            this.playButtonEl = playButton ? document.querySelector(playButton) : playButton
            this.volumeSliderEl = volumeSlider ? document.querySelector(volumeSlider) : volumeSlider
            this.volumeTextEl = volumeText ? document.querySelector(volumeText) : volumeText
            this.muteButtonEl = muteButton ? document.querySelector(muteButton) : muteButton
            this.coverImageEl = coverImage ? document.querySelector(coverImage) : coverImage
            this.playNextEl = playNextSongButton ? document.querySelector(playNextSongButton) : playNextSongButton
            this.playPrevEl = playPrevSongButton ? document.querySelector(playPrevSongButton) : playPrevSongButton
            this.playingSongTextEl = playingSongText ? document.querySelector(playingSongText) : playingSongText

            this.muteButtonEl?.addEventListener('click', () => {
                if(this.audioEl.muted === false){
                    this.audioEl.muted = true
                }else{
                    this.audioEl.muted = false
                }
            })
    
            this.volumeSliderEl?.addEventListener('input', (e) => {
                const value = e.target.value
    
                this.volumeTextEl.textContent = value
                this.audioEl.volume = value / 100
            })
    
            this.songSliderEl?.addEventListener('change', () => {
                this.audioEl.currentTime = this.songSliderEl.value
            })
    
            this.audioEl?.addEventListener('timeupdate', () => {
                const timePlayed = Math.floor(this.audioEl.currentTime)
                this.timePlayed = this.calcTime(timePlayed)
                
                this.songSliderEl.value = timePlayed
                this.timePlayedEl.textContent = this.timePlayed
            })
    
            this.playButtonEl?.addEventListener('click', () => {
                if(this.audioEl.paused){
                    this.play()
                }else{
                    this.pause()
                }
            })
    
            this.audioEl?.addEventListener('loadedmetadata', () => {
                this.songDuration = this.calcTime(this.audioEl.duration)
                this.songDurationEl.textContent = this.songDuration
                this.songSliderEl.max = Math.floor(this.audioEl.duration)
    
                this.audioEl.buffered.end(this.audioEl.buffered.length-1)
                this.audioEl.seekable.end(this.audioEl.seekable.length-1)
    
                this.songSliderEl.value = 0
            })
    
            this.songSliderEl?.addEventListener('input', () => {
                this.timePlayedEl.textContent = this.timePlayed
            })

            this.audioEl.addEventListener('play', (e) => {
                this.hooks?.onSongStart(this)
            })
    
            this.audioEl.addEventListener('ended', (e) => {
                this.hooks?.onSongEnd(this)
                
                this.playNextSong()

                if(this.playlistPlayingIndex >= this.playlist.songs.length-1){
                    this.playButtonEl.classList.replace("musicplayer-icon-pause", "musicplayer-icon-play")
                    this.playlistPlayingIndex = 0
                }
            })

            this.playNextEl?.addEventListener('click', () => this.playNextSong())
            this.playPrevEl?.addEventListener('click', () => this.playPrevSong())
    
            if(this.audioEl.readyState > 0){
                this.songDurationEl.textContent = this.songDuration
                this.songSliderEl.max = Math.floor(this.audioEl.duration)
            }
        }
    }

    static normalizeName(text){
        return text.replace("-", " - ").replaceAll("_", " ").replace('.flac', "")
    }

    static sortCoverAndSongs(files){
        let cover = ""
        let songs = []
        
        files.forEach((file) => {

            const extName = file._title.split('.').at(-1)
            if(['flac'].includes(extName)){
                songs.push(file)
            }else if(extName === 'jpg'){
                cover = file._title
            }
        })

        return { cover, songs }
    }

    calcTime(seconds){
        const min = Math.floor(seconds / 60)
        const sec = Math.floor(seconds % 60)
        const returnedSec = sec < 10 ? `0${sec}` : sec
        return `${min}:${returnedSec}`
    }

    parseTitle(t){
        t = t.split(".")
        t.pop() // remove extension
        t = t.join()
        t = t.replace(/([0-9]+(-| ))+/, "")
        return t
    }

    parseAlbum(t){
        t = t.replace("-", " - ")
        t = t.replaceAll("_", " ")
        return t
    }

    getArtist(t){
        t = t.split("-")
        t = t[0].replaceAll("_", " ")
        return t
    }

    play(song){
        if(song){
            const {artist, title, songPath, element} = song
            const {album, cover} = this.playlist

            this.audioEl.src = songPath
            this.showPlayingSongName(`${artist} - ${title}`)
            this.highlightSongElement(element)
            

            navigator.mediaSession.metadata = new MediaMetadata({
                title,
                artist,
                album,
                artwork: [
                    {
                        src: cover,
                        sizes: "600x600",
                        type: "image/jpg"
                    }
                ]
            })
        }

        if(this.audioEl.src){
            this.audioEl.play()
            navigator.mediaSession.playbackState = "playing"
            this.playButtonEl.classList.replace("musicplayer-icon-play", "musicplayer-icon-pause")
        }else if(!song){
            this.showPlayingSongName("No Song Selected")
        }
    }

    pause(){
        this.audioEl.pause()
        navigator.mediaSession.playbackState = "paused"
        this.playButtonEl.classList.replace("musicplayer-icon-pause", "musicplayer-icon-play")
    }

    setAlbumCoverBase64(code){
        this.coverImageEl.style.backgroundImage = `url("${code}")`
    }

    setAlbumCover(src){
        this.coverImageEl.style.backgroundImage = `url("${src}")`
    }

    setSongIndex(position){
        this.playlistPlayingIndex = position
    }

    loadPlaylist(playlist){
        if(playlist.cover){
            this.setAlbumCover(playlist.cover)
        }
        
        this.playlist = playlist
        this.play(playlist.songs[this.playlistPlayingIndex])
    }

    playNextSong(){
        if(this.playlistPlayingIndex >= this.playlist.songs.length-1){
            return
        }

        this.playlistPlayingIndex++
        const songIndex = this.playlistPlayingIndex
        const nextSongPath = this.playlist.songs[songIndex]
        this.play(nextSongPath)
    }

    playPrevSong(){
        if(this.playlistPlayingIndex > 0){
            this.playlistPlayingIndex--
        }

        const songIndex = this.playlistPlayingIndex
        const nextSongPath = this.playlist.songs[songIndex]
        this.play(nextSongPath)
    }

    showPlayingSongName(song){
        this.playingSongTextEl.textContent = song.title || song
    }

    highlightSongElement(element){
        const selector = "musicplayer-highlight-song"

        Array.from(document.getElementsByClassName(selector)).forEach(e => e.classList.remove(selector))
        element.classList.add(selector)
    }

    highlightAlbumElement(element){
        const selector = "musicplayer-highlight-album"

        Array.from(document.getElementsByClassName(selector)).forEach(e => e.classList.remove(selector))
        element.querySelector(".albumHeader").classList.add(selector)
        element.querySelector(".albumSongs").classList.remove("hidden")
    }

    saveToLocalStorage(){
        const serverListJson = JSON.stringify(this.serverList)
        localStorage.setItem('serverList', serverListJson)
    }

    async addServer(config){
        // {server, token, musicListRoute, albumRoute, songRoute}
        this.serverList[config.server] = config

        await this.getAlbumsFromServer(config.server)

        this.saveToLocalStorage()
    }

    async getAlbumsFromServer(server){
        const {token, musicListRoute, albumRoute} = this.serverList[server]

        const fetchConfig = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': "*"
            }
        }

        const albums = await fetch(join(server, musicListRoute), fetchConfig).then(async (res) => await res.json())

        const albumContents = await Promise.all(
            albums.map(async (_album) => fetch(
                    encodeURI(join(server, albumRoute, _album)), fetchConfig
                ).then(async res => {
                    const data = await res.json()
                    return data.map(_title => (
                        { _title, title: this.parseTitle(_title), artist: this.getArtist(_album)}
                    ))
                })
            )
        )

        this.serverList[server].albums = albums.map((_album, i) => {
            const {cover, songs} = MusicPlayer.sortCoverAndSongs(albumContents[i])
            return {_album, album: this.parseAlbum(_album), cover, songs}
        })

        return albumContents
    }

    async getAlbumsFromAllServers(){
        const servers = Object.values(this.serverList)
        await Promise.all(servers.map(server => this.getAlbumsFromServer(server.server)))

        this.saveToLocalStorage()
    }

    getAlbums(){
        return Object.values(this.serverList).reduce((acc, v) => {
            const {server, albums, albumRoute, songRoute} = v

            return [
                ...acc,
                ...albums.map(
                    album => {
                        const obj = {server, ...album, albumRoute: join(albumRoute, album._album), songRoute}
                        return obj
                    }
                )
            ]
        }, [])
    }

    getToken(server){
        return this.serverList[server].token
    }

}