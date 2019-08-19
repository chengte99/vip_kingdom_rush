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
        enemy_prefab: {
            default: [],
            type: cc.Prefab
        },

        game_map_set: {
            default: [],
            type: cc.Prefab
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        sound_manager.play_music("resources/sounds/music/game_bg1.mp3", true);

        this.door_com = cc.find("UI_ROOT/loading_door").getComponent("loading_door");
        this.goToHome = false;

        this.resume_root = cc.find("UI_ROOT/anchor_center/resume_root");
        this.resume_root.active = false;

        this.setting_root = cc.find("UI_ROOT/anchor_center/setting_root");
        this.setting_root.active = false;

        this.blood_label = cc.find("UI_ROOT/anchor_lt/user_info").getChildByName("blood_label").getComponent(cc.Label);
        this.chip_label = cc.find("UI_ROOT/anchor_lt/user_info").getChildByName("chip_label").getComponent(cc.Label);
        this.round_label = cc.find("UI_ROOT/anchor_lt/user_info").getChildByName("round_label").getComponent(cc.Label);

        this.blood = 0;
        this.game_started = false;

        this.map_root = cc.find("UI_ROOT/map_root");

        this.checkout = cc.find("UI_ROOT/checkout").getComponent("checkout");

        var map_level = ugame.cur_level;
        if(map_level >= this.game_map_set.length){
            map_level = this.game_map_set.length - 1;
        }
        // console.log(map_level);
        this.game_map = cc.instantiate(this.game_map_set[map_level]);
        this.node.addChild(this.game_map);
        this.game_map.setLocalZOrder(-100);
        this.tower_tag = this.game_map.getChildByName("tower_tag");
    },

    start () {
        this.start_game();

        this.door_com.open_door(null);
    },

    update_chip_string: function(){
        this.chip_label.string = ugame.get_user_chip();
    },

    start_game: function(){
        if(this.game_started === true){
            return;
        }

        this.all_enemy_generated = false;

        ugame.clear_enemy_set();
        this.unscheduleAllCallbacks();
        for(var i = 0; i < this.tower_tag.children.length; i ++){
            var tower_builder = this.tower_tag.children[i].getComponent("tower_builder");
            tower_builder.undo_tower();
        }
        this.map_root.removeAllChildren();

        this.game_started = true;
        ugame.is_game_started = this.game_started;
        this.checkout.node.active = false;

        var udata = ugame.get_cur_user();
        this.blood = udata.blood;

        this.blood_label.string = this.blood;
        this.chip_label.string = udata.chip;
        this.round_label.string = "Round 0 / 7";

        this.cur_level = ugame.get_cur_level();
        this.level_data = require("level" + (this.cur_level + 1));
        this.round_label.string = "Round 0 / " + this.level_data.length;
        this.cur_round = 0; //第一波
        
        this.cur_road_index = 0; //在非随机模式下，当前的选择路径的索引
        this.cur_gen_total = 0;
        this.cur_gen_now = 0;
        this.map_road_data = ugame.get_cur_road_data();
        // console.log(this.map_road_data);
        this.gen_enemy_at_road();
    },

    player_on_attacked: function(damage){
        if(this.game_started === false){
            return;
        }
        this.blood -= damage;
        this.blood_label.string = "" + this.blood;
        if(this.blood <= 0){
            this.blood = 0;
            this.game_started = false
            ugame.is_game_started = this.game_started;
            this.show_failed();
        }
    },

    gen_one_enemy: function(){
        if(this.game_started === false){
            return;
        }

        var cur_round_data = this.level_data[this.cur_round];
        var random_road = cur_round_data.random_road;
        var road_set = cur_round_data.road_set;
        var enemy_type = cur_round_data.enemy_type[this.cur_gen_now];

        var enemy = cc.instantiate(this.enemy_prefab[enemy_type]);
        this.map_root.addChild(enemy);
        ugame.add_enemy_set(enemy);
        enemy.active = true;
        var actor = enemy.getComponent("actor");

        var index;
        if(random_road){
            var random_index = Math.random() * road_set.length;
            random_index = Math.floor(random_index);
            if(random_index >= road_set.length){
                random_index = 0;
            }
            index = road_set[random_index];
        }else{
            if(this.cur_road_index >= road_set.length){
                this.cur_road_index = 0;
            }
            var serial_index = this.cur_road_index;
            this.cur_road_index ++;
            index = road_set[serial_index];
        }
        // console.log(index);

        var road_data = this.map_road_data[index];
        actor.set_actor_params(cur_round_data.actor_params);
        actor.gen_at_road(road_data);

        if(this.cur_gen_now === 0){
            this.round_label.string = "Round " + (this.cur_round + 1) + " / " + this.level_data.length;
        }

        this.cur_gen_now ++;
        if(this.cur_gen_now === this.cur_gen_total){
            this.cur_round ++;
            this.gen_enemy_at_road();
        }
    },

    think_level_pass: function(){
        if(this.game_started === false || 
            this.all_enemy_generated === false || 
            ugame.enemy_set.length > 0){
                this.scheduleOnce(this.think_level_pass.bind(this), 1);
            return;
        }
        
        this.show_successed(this.blood);
    },

    gen_enemy_at_road: function(){
        if(this.cur_round >= this.level_data.length){
            this.all_enemy_generated = true;
            this.scheduleOnce(this.think_level_pass.bind(this), 1);
            return;
        }

        var cur_round_data = this.level_data[this.cur_round];
        var time = cur_round_data.delay;
        var num = cur_round_data.num;

        this.cur_gen_total = num;
        this.cur_gen_now = 0;

        for(var i = 0; i < num; i ++){
            time += cur_round_data.round_time_set[i];
            this.scheduleOnce(function(){
                this.gen_one_enemy();
            }.bind(this), time);
        }
    },

    goto_romap: function(){
        if(this.goToHome){
            return;
        }
        this.goToHome = true;
        this.checkout.node.active = false;
        this.door_com.close_door(function(){
            this.scheduleOnce(function(){
                cc.director.loadScene("romap_scene");
            }, 0.3);
        }.bind(this));
    },

    show_failed: function(){
        this.checkout.show_result_fail();
    },

    show_successed: function(blood){
        this.checkout.show_result_success(blood);
    },

    on_click_pause: function(){
        this.resume_root.active = true;
        ugame.is_game_paused = true;
    },

    on_click_pause_resume: function(){
        this.resume_root.active = false;
        ugame.is_game_paused = false;
    },

    on_click_setting: function(){
        this.setting_root.active = true;
        ugame.is_game_paused = true;
    },

    on_click_setting_back: function(){
        this.setting_root.active = false;
        ugame.is_game_paused = false;
    },

    on_click_replay: function(){
        this.setting_root.active = false;
        this.game_started = false;
        this.start_game();
    },

    on_click_enemy_start: function(){
        if(this.game_started === true){
            return;
        }
        console.log("game start");
        this.game_started = true;
    },

    // update (dt) {},
});
