// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var sound_manager = require("sound_manager");

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        audio_type: 0, //0: music, 1: effect
        music_sprite_frame: {
            default: [],
            type: cc.SpriteFrame
        },
        effect_sprite_frame: {
            default: [],
            type: cc.SpriteFrame
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.sp = this.node.getChildByName("anim").getComponent(cc.Sprite);
    },

    start () {
        if(this.audio_type === 0){
            var music_mute = sound_manager.b_music_mute;
            this.sp.spriteFrame = this.music_sprite_frame[music_mute];
        }else{
            var effect_mute = sound_manager.b_effect_mute;
            this.sp.spriteFrame = this.effect_sprite_frame[effect_mute];
        }
    },

    on_click: function(){
        if(this.audio_type === 0){
            var music_mute = sound_manager.b_music_mute;
            music_mute = (music_mute) ? 0 : 1;
            sound_manager.set_music_mute(music_mute);

            this.sp.spriteFrame = this.music_sprite_frame[music_mute];
        }else{
            var effect_mute = sound_manager.b_effect_mute;
            effect_mute = (effect_mute) ? 0 : 1;
            sound_manager.set_effect_mute(effect_mute);

            this.sp.spriteFrame = this.effect_sprite_frame[effect_mute];
        }
    },

    // update (dt) {},
});
