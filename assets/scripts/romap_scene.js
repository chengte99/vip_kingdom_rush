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
        level_num: 19,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.door_com = cc.find("UI_ROOT/loading_door").getComponent("loading_door");
        this.outSide = false;

        this.level_entry_set = [];
        this.new_level_root = cc.find("UI_ROOT/anchor_center/level_entry_root");
        this.map_entry_root = cc.find("UI_ROOT/anchor_center/map_entry_root");

        var i;
        for(i = 0; i < this.level_num; i ++){
            var name = "level" + (i + 1);
            this.level_entry_set.push(this.map_entry_root.getChildByName(name))
            var bt = this.level_entry_set[i].getComponent(cc.Button);
            var eventHandler = new cc.Component.EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = "romap_scene";
            eventHandler.handler = "on_click_passed_entry"
            eventHandler.customEventData = "" + i;
            bt.clickEvents = [eventHandler];
        }

        this.star_label = cc.find("UI_ROOT/anchor_rt/star_num/star_str");
        this.newest_level = -1;

        this.upgrade_config_root = cc.find("UI_ROOT/anchor_center/upgrade_config_root");
        this.upgrade_config_root.active = false;
    },

    show_user_star_num: function(){
        var cur_user = ugame.get_cur_user();
        this.star_label.getComponent(cc.Label).string = cur_user.star_num + " / " + cur_user.star_total;
    },

    show_level_entry: function(){
        var cur_user = ugame.get_cur_user();
        var cur_level_info = cur_user.level_info;
        // var cur_level_info = [1,2,3,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        
        var i;
        var len = (cur_level_info.length < this.level_num) ? cur_level_info.length : this.level_num;
        for(i = 0; i < len; i ++){
            if(cur_level_info[i] === 0){
                break;
            }
            this.level_entry_set[i].active = true;
            this.level_entry_set[i].getComponent("level_entry_info").show_star(cur_level_info[i]);
        }

        this.newest_level = i;
        if(this.newest_level >= this.level_num){
            this.new_level_root.active = false;
            this.newest_level = this.level_num - 1;
        }else{
            this.new_level_root.active = true;
            this.new_level_root.x = this.level_entry_set[i].x;
            this.new_level_root.y = this.level_entry_set[i].y;
        }

        for(; i < cur_level_info.length; i ++){
            this.level_entry_set[i].active = false;
        }
    },

    start () {
        this.show_level_entry();
        this.show_user_star_num();

        this.door_com.open_door(null);
        sound_manager.play_music("resources/sounds/music/roadmap_scene_bg.mp3", true);
    },

    goto_home: function(){
        if(this.outSide){
            return;
        }
        this.outSide = true;
        this.door_com.close_door(function(){
            cc.director.loadScene("home_scene", function(){
                var home_com = cc.find("UI_ROOT").getComponent("home_scene");
                home_com.after_loadScene();
            });
        });
    },

    go_to_game: function(level){
        ugame.set_cur_level(level);

        console.log("enter game_scene at level:", ugame.get_cur_level());
        this.door_com.close_door(function(){
            this.scheduleOnce(function(){
                cc.director.loadScene("game_scene");
            }, 0.3);
        }.bind(this));
    },

    on_click_new_level_entry: function(){
        if(this.outSide){
            return;
        }
        this.outSide = true;
        this.go_to_game(this.newest_level);
    },

    on_click_passed_entry: function(t, level){
        if(this.outSide){
            return;
        }
        this.outSide = true;
        var index = parseInt(level);
        this.go_to_game(index);
    },

    on_click_upgradeBtn: function(){
        this.upgrade_config_root.active = true;

        var anim_com = this.upgrade_config_root.getComponent(cc.Animation);
        anim_com.play("show_upgrade_config");
    },

    // update (dt) {},
});
