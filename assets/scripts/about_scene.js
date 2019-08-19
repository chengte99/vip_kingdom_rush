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
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.door_com = cc.find("UI_ROOT/anchor_center/loading_door").getComponent("loading_door");
        this.goToHome = false;
    },

    start () {
        this.door_com.open_door(null);
    },

    goto_home: function(){
        if(this.goToHome){
            return;
        }
        this.goToHome = true;
        // sound_manager.play_effect("resources/sounds/click.wav");
        this.door_com.close_door(function(){
            // sound_manager.play_effect("resources/sounds/close_door.mp3");
            cc.director.loadScene("home_scene", function(){
                var home_com = cc.find("UI_ROOT").getComponent("home_scene");
                home_com.after_loadScene();
            });
        });
    },

    // update (dt) {},
});
