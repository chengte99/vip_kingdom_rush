// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var arrow_tower_params = require("arrow_tower_params");
var ugame = require("ugame");

var arrow_tower_skin = cc.Class({
    name: "arrow_tower_skin",
    properties: {
        tower_bg: {
            default: null,
            type: cc.SpriteFrame
        },

        up_idle: {
            default: null,
            type: cc.SpriteFrame
        },

        down_idle: {
            default: null,
            type: cc.SpriteFrame
        },

        up_anim: {
            default: [],
            type: cc.SpriteFrame
        },

        down_anim: {
            default: [],
            type: cc.SpriteFrame
        },
        y_offset: 0
    }
})

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

        level_tower_skin_res:{
            default: [],
            type: arrow_tower_skin
        },

        duration: 0.1,

        arrow_bullet_prefab: {
            default: null,
            type: cc.Prefab
        },

        bullet_root_path: "UI_ROOT/map_root/bullet_root"
    },

    // LIFE-CYCLE CALLBACKS:

    _set_tower_skin: function(){
        var tower_s = this.node.getComponent(cc.Sprite);
        tower_s.spriteFrame = this.level_tower_skin_res[this.tower_level - 1].tower_bg;

        this.lhs.y += this.level_tower_skin_res[this.tower_level - 1].y_offset;
        this.rhs.y += this.level_tower_skin_res[this.tower_level - 1].y_offset;

        if(Math.random() < 0.5){
            //up idle
            this._set_arrow_idle(this.lhs, 0);
            this._set_arrow_idle(this.rhs, 0);
        }else{
            //down idle
            this._set_arrow_idle(this.lhs, 1);
            this._set_arrow_idle(this.rhs, 1);
        }
    },

    _set_arrow_idle: function(man, dir){
        var s = man.getComponent(cc.Sprite);

        if(dir === 0){
            s.spriteFrame = this.level_tower_skin_res[this.tower_level - 1].up_idle;
        }else{
            s.spriteFrame = this.level_tower_skin_res[this.tower_level - 1].down_idle;
        }
    },

    _shoot_anim: function(man, w_dst_pos){
        var frame_anim = man.getComponent("frame_anim");
        if(!frame_anim){
            frame_anim = man.addComponent("frame_anim");
        }

        var w_pos = man.convertToWorldSpaceAR(cc.p(0, 0));
        var dir = cc.pSub(w_dst_pos, w_pos);

        if(dir.y > 0){
            frame_anim.sprite_frames = this.level_tower_skin_res[this.tower_level - 1].up_anim;
            frame_anim.duration = this.duration;
            frame_anim.play_once(function(){
                this._set_arrow_idle(man, 0);
            }.bind(this));
        }else{
            frame_anim.sprite_frames = this.level_tower_skin_res[this.tower_level - 1].down_anim;
            frame_anim.duration = this.duration;
            frame_anim.play_once(function(){
                this._set_arrow_idle(man, 1);
            }.bind(this));
        }

        var center_pos = this.node.getPosition();
        var R = arrow_tower_params[this.tower_level - 1].space_R;
        var enemy = ugame.search_enemy(center_pos, R);
        if(enemy){
            w_dst_pos = enemy.convertToWorldSpaceAR(cc.p(0, 0));
        }

        var bullet = cc.instantiate(this.arrow_bullet_prefab);
        this.bullet_root.addChild(bullet);
        var arrow_bullet = bullet.getComponent("arrow_bullet");
        arrow_bullet.bullet_level = this.tower_level;
        arrow_bullet.shoot_at(w_pos, w_dst_pos, enemy);
    },

    shoot_at: function(w_pos){
        if(this.current_anchor_index === 0){
            this._shoot_anim(this.lhs, w_pos);
        }else{
            this._shoot_anim(this.rhs, w_pos);
        }

        this.current_anchor_index ++;
        if(this.current_anchor_index >= 2){
            this.current_anchor_index = 0;
        }
    },

    onLoad () {
        this.tower_level = 1;
        this.lhs = this.node.getChildByName("lhs");
        this.rhs = this.node.getChildByName("rhs");
        this.bullet_root = cc.find(this.bullet_root_path);

        this.current_anchor_index = 0;
        this.shoot_time = 0;
        this._set_tower_skin();
    },

    tower_think: function(){
        var center_pos = this.node.getPosition();
        var R = arrow_tower_params[this.tower_level - 1].space_R;
        var enemy = ugame.search_enemy(center_pos, R);
        var time = 0.1;

        if(enemy){
            var w_dst_pos = enemy.convertToWorldSpaceAR(cc.p(0, 0));
            this.shoot_at(w_dst_pos);

            time = 0.5;
        }

        this.scheduleOnce(this.tower_think.bind(this), time);
    },

    start () {
        this.scheduleOnce(this.tower_think.bind(this), 0.1);

        // this.schedule(function(){
        //     var R = 100;
        //     var r = Math.random() * 2 * Math.PI;
        //     var w_pos = this.node.convertToWorldSpaceAR(cc.p(0, 0));
        //     var w_dst_pos = cc.p(w_pos.x + 100 * Math.cos(r), w_pos.y + 100 * Math.sin(r));
        //     this.shoot_at(w_dst_pos);
        // }.bind(this), 3);
    },

    update (dt) {

    },

    to_upgrade: function(){
        if(this.tower_level >= 4){
            return this.tower_level;
        }

        this.tower_level ++;
        this._set_tower_skin();

        return this.tower_level;
    },
});
