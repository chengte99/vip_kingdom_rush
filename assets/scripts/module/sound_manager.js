var sound_manager = {
    b_music_mute: -1, //0: 有聲音，1:靜音
    b_effect_mute: -1, //0: 有聲音，1:靜音

    set_music_mute: function(b_mute){
        if(this.b_music_mute == b_mute){
            return;
        }
        this.b_music_mute = (b_mute) ? 1 : 0;
        if(this.b_music_mute === 1){
            cc.audioEngine.setMusicVolume(0);
        }else{
            cc.audioEngine.setMusicVolume(0.5);
        }

        cc.sys.localStorage.setItem("music_mute", this.b_music_mute);
    },

    set_effect_mute: function(b_mute){
        if(this.b_effect_mute == b_mute){
            return;
        }
        this.b_effect_mute = (b_mute) ? 1 : 0;
        if(this.b_effect_mute === 1){
            cc.audioEngine.setEffectsVolume(0);
        }else{
            cc.audioEngine.setEffectsVolume(0.5);
        }

        cc.sys.localStorage.setItem("effect_mute", this.b_effect_mute);
    },

    play_music: function(file_path, loop){
        cc.audioEngine.stopMusic();
        var url = cc.url.raw(file_path);
        cc.audioEngine.playMusic(url, loop);
        if(this.b_music_mute === 1){
            cc.audioEngine.setMusicVolume(0);
        }else{
            cc.audioEngine.setMusicVolume(0.5);
        }
    },

    play_effect: function(file_path){
        if(this.b_effect_mute === 1){
            return;
        }
        var url = cc.url.raw(file_path);
        cc.audioEngine.playEffect(url, false);
    },
};

var music_mute = cc.sys.localStorage.getItem("music_mute");
if(music_mute){
    music_mute = parseInt(music_mute);
}else{
    music_mute = 0;
}
sound_manager.set_music_mute(music_mute);

var effect_mute = cc.sys.localStorage.getItem("effect_mute");
if(effect_mute){
    effect_mute = parseInt(effect_mute);
}else{
    effect_mute = 0;
}
sound_manager.set_effect_mute(effect_mute);

module.exports = sound_manager;