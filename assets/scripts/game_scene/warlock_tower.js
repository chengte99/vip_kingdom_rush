// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var ugame = require("ugame");
var warlock_tower_params = require("warlock_tower_params");

var warlock_tower_skin = cc.Class({
    name: "warlock_tower_skin",
    properties: {
        tower_skin_frame: {
            default: [],
            type: cc.SpriteFrame
        },
        tower_druation: 0.1,

        warlock_up_frame: {
            default: [],
            type: cc.SpriteFrame
        },
        warlock_up_druation: 0.1,

        warlock_down_frame: {
            default: [],
            type: cc.SpriteFrame
        },
        warlock_down_druation: 0.1,
        
        x_pos: -1,
        y_pos: 19
    }
});

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
        tower_level: 1,

        level_tower_skin_res: {
            default: [],
            type: warlock_tower_skin
        },

        warlocl_bullet_prefab: {
            default: null,
            type: cc.Prefab
        },

        bullet_root_path: "UI_ROOT/map_root/bullet_root"
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.tower_level = 1;
        this.anim = this.node.getChildByName("anim");
        this.man = this.node.getChildByName("man");
        this.bullet_root = cc.find(this.bullet_root_path);

        this._set_warlock_tower_idle();
        this._set_warlock_man_idle(false);
    },

    _set_warlock_tower_idle: function(){
        var s = this.anim.getComponent(cc.Sprite);
        s.spriteFrame = this.level_tower_skin_res[this.tower_level - 1].tower_skin_frame[0];
    },

    _set_warlock_man_idle: function(b_up){
        this.man.x = this.level_tower_skin_res[this.tower_level - 1].x_pos;
        this.man.y = this.level_tower_skin_res[this.tower_level - 1].y_pos;
        var s = this.man.getComponent(cc.Sprite);

        if(b_up){
            s.spriteFrame = this.level_tower_skin_res[this.tower_level - 1].warlock_up_frame[0];
        }else{
            s.spriteFrame = this.level_tower_skin_res[this.tower_level - 1].warlock_down_frame[0];
        }
    },

    _shoot_bullet: function(w_dst_pos, is_up){
        var start_pos_down_set = [cc.p(-5, 8), cc.p(-5, 8), cc.p(-5, 8), cc.p(-5, 8)];
        var delay_down_set = [0.5, 0.5, 0.5, 1];
        var start_pos_up_set = [cc.p(6, 8), cc.p(6, 8), cc.p(6, 8), cc.p(6, 8)];
        var delay_up_set = [0.6, 0.6, 0.6, 1];

        var w_start_pos, delay;
        if(is_up){
            w_start_pos = this.man.convertToWorldSpaceAR(start_pos_up_set[this.tower_level - 1]);
            delay = cc.delayTime(delay_up_set[this.tower_level - 1]);
        }else{
            w_start_pos = this.man.convertToWorldSpaceAR(start_pos_down_set[this.tower_level - 1]);
            delay = cc.delayTime(delay_down_set[this.tower_level - 1]);
        }

        var end_func = cc.callFunc(function(){
            var center_pos = this.node.getPosition();
            var R = warlock_tower_params[this.tower_level - 1].space_R;
            var enemy = ugame.search_enemy(center_pos, R);
            if(enemy){
                w_dst_pos = enemy.convertToWorldSpaceAR(cc.p(0, 0));
            }

            var bullet = cc.instantiate(this.warlocl_bullet_prefab);
            this.bullet_root.addChild(bullet);
            var warlock_bullet = bullet.getComponent("warlock_bullet");
            warlock_bullet.bullet_level = this.tower_level;
            warlock_bullet.shoot_at(w_start_pos, w_dst_pos, enemy);
        }.bind(this), this);
        var seq = cc.sequence([delay, end_func]);
        this.node.runAction(seq);
    },

    _play_warlock_anim: function(w_dst_pos){
        var frame_anim = this.man.getComponent("frame_anim");
        if(!frame_anim){
            frame_anim = this.man.addComponent("frame_anim");
        }

        var w_start_pos = this.man.convertToWorldSpaceAR(cc.p(0, 0));
        var is_up = (w_start_pos.y < w_dst_pos.y) ? true : false;

        if(is_up){
            frame_anim.sprite_frames = this.level_tower_skin_res[this.tower_level - 1].warlock_up_frame;
            frame_anim.duration = this.level_tower_skin_res[this.tower_level - 1].warlock_up_druation;
        }else{
            frame_anim.sprite_frames = this.level_tower_skin_res[this.tower_level - 1].warlock_down_frame;
            frame_anim.duration = this.level_tower_skin_res[this.tower_level - 1].warlock_down_druation;
        }
        frame_anim.play_once(function(){
            this._set_warlock_man_idle(is_up);
        }.bind(this));

        this._shoot_bullet(w_dst_pos, is_up);
    },

    shoot_at: function(w_dst_pos){
        var frame_anim = this.anim.getComponent("frame_anim");
        if(!frame_anim){
            frame_anim = this.anim.addComponent("frame_anim");
        }
        frame_anim.sprite_frames = this.level_tower_skin_res[this.tower_level - 1].tower_skin_frame;
        frame_anim.duration = this.level_tower_skin_res[this.tower_level - 1].tower_druation;
        frame_anim.play_once(function(){
            this._set_warlock_tower_idle();
        }.bind(this));
        this._play_warlock_anim(w_dst_pos);
    },

    tower_think: function(){
        var center_pos = this.node.getPosition();
        var R = warlock_tower_params[this.tower_level - 1].space_R;
        var enemy = ugame.search_enemy(center_pos, R);
        var time = 0.1;

        if(enemy){
            var w_dst_pos = enemy.convertToWorldSpaceAR(cc.p(0, 0));
            this.shoot_at(w_dst_pos);

            time = 1.5;
        }

        this.scheduleOnce(this.tower_think.bind(this), time);
    },

    start () {
        this.scheduleOnce(this.tower_think.bind(this), 0.1);
        // this.schedule(function(){
        //     var R = 100;
        //     var r = Math.random() * 2 * Math.PI;
        //     var w_pos = this.node.convertToWorldSpaceAR(cc.p(0, 0));
        //     var w_dst_pos = cc.p(w_pos.x + 60 * Math.cos(r), w_pos.y + 60 * Math.sin(r));
        //     this.shoot_at(w_dst_pos);
        // }.bind(this), 3);
    },

    to_upgrade: function(){
        if(this.tower_level >= 4){
            return this.tower_level;
        }

        this.tower_level ++;
        this._set_warlock_tower_idle();
        this._set_warlock_man_idle(false);

        return this.tower_level;
    },

    // update (dt) {},
});
