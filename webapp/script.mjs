import {$, join} from "./js/utils.mjs"
import MusicPlayer from "./js/MusicPlayer.mjs"
import MusicList from "./js/MusicList.mjs"

const musicPlayer = new MusicPlayer({
    elements: {
        audio: '#musicAudio',
        songDuration: '#musicDuration',
        timeSlider: '#musicTimeSlider',
        timePlayed: '#musicTimePlayed',
        volumeSlider: '#musicVolume',
        volumeText: '#musicVolumeText',
        playButton: '#musicPlay',
        muteButton: '#musicMute',
        playNextSongButton: '#musicPlayNext',
        playPrevSongButton: '#musicPlayPrev',
        playingSongText: '#nowPlaying',
        coverImage: '#musicList'
    }
})

const musicList = new MusicList("#musicList", {
    onUpdate: () => {
        return musicPlayer.getAlbums()
    },
    onPlayPlaylist: function(album){
        musicPlayer.highlightAlbumElement(album.element)
        musicPlayer.loadPlaylist(album)
    }
})

const settingsForm = document.getElementById('settings')

document.getElementById('settingsBtn').addEventListener('click', () => {
    settingsForm.classList.toggle('hidden')
})

document.getElementById('settings-save').addEventListener('click', async () => {
    const token = document.getElementById('api-key').value
    const server = document.getElementById('api-url').value
    const musicListRoute = document.getElementById('api-music-route').value
    const albumRoute = document.getElementById('api-album-route').value
    const songRoute = document.getElementById('api-song-route').value

    await musicPlayer.addServer({ server, token, musicListRoute, albumRoute, songRoute })

    musicList.update()

    settingsForm.classList.toggle("hidden")
})

async function main(){
    await musicPlayer.getAlbumsFromAllServers()

    musicList.update()
}

main()

