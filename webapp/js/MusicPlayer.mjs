export default class MusicPlayer {
    constructor(config){
        this.config = config
        this.elements = {}

        if(config.elements){
            for(const id in config.elements){
                const el = document.getElementById(id)
                console.log(el)
            }
        }
    }
}