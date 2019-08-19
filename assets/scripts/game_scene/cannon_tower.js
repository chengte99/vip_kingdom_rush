// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var cannon_tower_params = require("cannon_tower_params");
var ugame = require("ugame");

var cannon_tower_skin = cc.Class({
    name: "cannon_tower_skin",
    properties: {
        shoot_frame: {
            default: [],
            type: cc.SpriteFrame
        },

        shoot_duration: 0.1,

        cannon_bullet: {
            default: [],
            type: cc.SpriteFrame
        }
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
            type: cannon_tower_skin
        },

        cannon_bullet_prefab: {
            default: null,
            type: cc.Prefab
        },

        bullet_root_path: "UI_ROOT/map_root/bullet_root"
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.tower_level = 1;
        this.anim = this.node.getChildByName("anim");
        this.bullet_icon = this.anim.getChildByName("bullet_icon");
        this.bullet_icon.scale = 0;

        this.params = cannon_tower_params;

        this.bullet_root = cc.find(this.bullet_root_path);

        this._set_tower_idle();
    },

    _set_tower_idle: function(){
        var s = this.anim.getComponent(cc.Sprite);
        s.spriteFrame = this.level_tower_skin_res[this.tower_level - 1].shoot_frame[0];
    },

    _preload_bullet: function(){
        if(this.tower_level === 4){
            return;
        }
        var delay_time_set = [0.8, 1.5, 1.2];
        var rot_set = [180 + Math.random() * 90, 180 + Math.random() * 90, 45];

        this.bullet_icon.getComponent(cc.Sprite).spriteFrame = this.level_tower_skin_res[this.tower_level - 1].cannon_bullet[0];

        var delay = cc.delayTime(delay_time_set[this.tower_level - 1]);
        var first_func = cc.callFunc(function(){
            this.bullet_icon.x = -24;
            this.bullet_icon.y = 3;
            this.bullet_icon.rotation = -45;
            this.bullet_icon.scale = 1;

            var rot = cc.rotateBy(0.4, rot_set[this.tower_level - 1]);
            this.bullet_icon.runAction(rot);
        }.bind(this), this);

        var bze_array = [cc.p(-10, 31), cc.p(-10, 31), cc.p(3, 21)];
        var bze_action = cc.bezierTo(0.4, bze_array);
        var s = cc.scaleTo(0.1, 0);

        var seq = cc.sequence([delay, first_func, bze_action, s]);
        this.bullet_icon.runAction(seq);
    },

    _shoot_bullet: function(w_dst_pos, bullet_level){
        var start_pos_set = [cc.p(3, 15), cc.p(3, 17), cc.p(3, 17), cc.p(-1, 20), cc.p(-21, 25)];
        var delay_set = [0.7, 0.8, 0.6, 1.3, 3.5];

        var w_start_pos = this.anim.convertToWorldSpaceAR(start_pos_set[bullet_level - 1]);

        var delay = cc.delayTime(delay_set[bullet_level - 1]);
        var doFunc = cc.callFunc(function(){
            var center_pos = this.node.getPosition();
            var space_R = this.params[this.tower_level - 1].space_R;
            var enemy = ugame.search_enemy(center_pos, space_R);
            if(enemy){
                w_dst_pos = enemy.convertToWorldSpaceAR(cc.p(0, 0));
            }

            var bullet = cc.instantiate(this.cannon_bullet_prefab);
            this.bullet_root.addChild(bullet);
            var cannon_bullet = bullet.getComponent("cannon_bullet");
            cannon_bullet.bullet_level = bullet_level;
            cannon_bullet.shoot_at(w_start_pos, w_dst_pos, enemy);
        }.bind(this), this);
        var seq = cc.sequence([delay, doFunc]);
        this.node.runAction(seq);
    },

    shoot_at: function(w_dst_pos){
        var frame_anim = this.anim.getComponent("frame_anim");
        frame_anim.sprite_frames = this.level_tower_skin_res[this.tower_level - 1].shoot_frame;
        frame_anim.duration = this.level_tower_skin_res[this.tower_level - 1].shoot_duration;
        frame_anim.play_once(function(){
            this._set_tower_idle();
        }.bind(this));
        this._preload_bullet();
        this._shoot_bullet(w_dst_pos, this.tower_level);

        if(this.tower_level === 4){
            this._shoot_bullet(w_dst_pos, this.tower_level + 1);
        }
    },

    tower_think: function(){
        var center_pos = this.node.getPosition();
        var space_R = this.params[this.tower_level - 1].space_R;
        var enemy = ugame.search_enemy(center_pos, space_R);
        var time = 0.1;

        if(enemy){
            var w_dst_pos = enemy.convertToWorldSpaceAR(cc.p(0, 0));
            this.shoot_at(w_dst_pos);

            time = 1.5;
            if(this.tower_level === 4){
                time = 3.5;
            }
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
        // }.bind(this), 4);
    },

    to_upgrade: function(){
        if(this.tower_level >= 4){
            return this.tower_level;
        }

        this.tower_level ++;
        this._set_tower_idle();

        return this.tower_level;
    },

    // update (dt) {},
});
