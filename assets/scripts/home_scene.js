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
var ugame = require("ugame");

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
        this.anchor_center = this.node.getChildByName("anchor_center");
        this.loading_door = this.anchor_center.getChildByName("loading_door");
        this.loading_door_com = this.loading_door.getComponent("loading_door");

        this.anim_com = this.anchor_center.getChildByName("start_anim_root").getComponent(cc.Animation);
        this.user_info_anim_com = this.anchor_center.getChildByName("user_game_info_root").getComponent(cc.Animation);
        this.game_started = false;
        this.goOutSide = false;
        this.user_info_press = false;
        this.goRomap = false;
    },

    set_user_info: function(user_node, user){
        var star_score_label = user_node.getChildByName("star_score").getComponent(cc.Label);
        star_score_label.string = user.star_num + " / " + user.star_total;
    },

    show_user_info: function(){
        this.set_user_info(cc.find("UI_ROOT/anchor_center/user_game_info_root/user1"), ugame.user_data[0]);
        this.set_user_info(cc.find("UI_ROOT/anchor_center/user_game_info_root/user2"), ugame.user_data[1]);
        this.set_user_info(cc.find("UI_ROOT/anchor_center/user_game_info_root/user3"), ugame.user_data[2]);
    },

    start () {
        this.show_user_info();

        sound_manager.play_music("resources/sounds/music/home_scene_bg.mp3", true);

        this.scheduleOnce(function(){
            this.anim_com.play();
        }.bind(this), 0.5);
    },

    start_game: function(){
        if (this.game_started) {
            return;
        }
        this.game_started = true;
        this.anim_com.play("start_game_hide");

        this.scheduleOnce(function(){
            this.user_info_anim_com.play("user_info_show");
            this.game_started = false;
        }.bind(this), this.anim_com.currentClip.duration);
        // this.loading_door_com.close_door(function(){

        // });
    },

    close_user_info: function(){
        if(this.user_info_press){
            return;
        }
        this.user_info_press = true;
        this.user_info_anim_com.play("user_info_hide");

        this.scheduleOnce(function(){
            this.anim_com.play("start_game_show");
            this.user_info_press = false;
        }.bind(this), this.user_info_anim_com.currentClip.duration);
    },

    go_about: function(){
        if (this.goOutSide) {
            return;
        }
        this.goOutSide = true;
        // sound_manager.play_effect("resources/sounds/click.wav");
        this.loading_door_com.close_door(function(){
            // sound_manager.play_effect("resources/sounds/close_door.mp3");
            this.scheduleOnce(function(){
                cc.director.loadScene("about_scene");
            }, 0.3);
        }.bind(this));
    },

    on_click_to_romap: function(event, index){
        if(index < 0 || index >= 3){
            index = 0;
        }
        ugame.cur_user = index;

        if (this.goRomap) {
            return;
        }
        this.goRomap = true;
        this.loading_door_com.close_door(function(){
            this.scheduleOnce(function(){
                cc.director.loadScene("romap_scene");
            }, 0.3);
        }.bind(this));
    },

    after_loadScene: function(){
        this.loading_door_com.set_door_state(0);
        this.scheduleOnce(function(){
            this.loading_door_com.open_door(null);
        }, 0.3);
    },

    // update (dt) {},
});
