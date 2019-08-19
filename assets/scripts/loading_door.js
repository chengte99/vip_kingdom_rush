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
        duration: 0.5,
        default_state: 0, //0: close, 1: open
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.l_door = this.node.getChildByName("l_door");
        this.r_door = this.node.getChildByName("r_door");
        this.set_door_state(this.default_state);
    },

    start () {

    },

    set_door_state: function(state){
        this.status_state = state;

        var win_size = cc.director.getWinSize();
        if(this.status_state === 1){
            this.l_door.x = -win_size.width * 0.5;
            this.r_door.x = win_size.width * 0.5;
        }else{
            this.l_door.x = 2;
            this.r_door.x = -2;
        }
    },

    open_door: function(end_func){
        if(this.status_state === 1){
            return;
        }
        this.status_state = 1;
        var win_size = cc.director.getWinSize();
        var m1 = cc.moveBy(this.duration, -win_size.width * 0.5 - 2, 0);
        this.l_door.runAction(m1);

        var m2 = cc.moveBy(this.duration, win_size.width * 0.5 + 2, 0);
        var func = cc.callFunc(function(){
            if(end_func){
                end_func();
            }
        }.bind(this), this);
        this.r_door.runAction(cc.sequence([m2, func]));
    },

    close_door: function(end_func){
        if(this.status_state === 0){
            return;
        }
        this.status_state = 0;
        sound_manager.play_effect("resources/sounds/click.wav");
        var win_size = cc.director.getWinSize();
        var m1 = cc.moveBy(this.duration, win_size.width * 0.5 + 2, 0);
        this.l_door.runAction(m1);

        var m2 = cc.moveBy(this.duration, -win_size.width * 0.5 - 2, 0);
        var func = cc.callFunc(function(){
            sound_manager.play_effect("resources/sounds/close_door.mp3");
            if(end_func){
                end_func();
            }
        }.bind(this), this);
        this.r_door.runAction(cc.sequence([m2, func]));
    },

    // update (dt) {},
});
