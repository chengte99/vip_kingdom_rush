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
var cannon_bullet_params = require("cannon_bullet_params");

var bullet_skin = cc.Class({
    name: "cannon_bullet_params",
    properties: {
        bullet_frame: {
            default: null,
            type: cc.SpriteFrame
        },

        bullet_bomb_frame: {
            default: [],
            type: cc.SpriteFrame
        },
        
        duration: 0.08
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
        bullet_level: 1,

        level_bullet_res:{
            default: [],
            type: bullet_skin
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.anim = this.node.getChildByName("anim");

        this._set_bullet_idle();
    },

    _set_bullet_idle: function(){
        var s = this.anim.getComponent(cc.Sprite);
        s.spriteFrame = this.level_bullet_res[this.bullet_level - 1].bullet_frame;
    },

    shoot_at: function(w_start_pos, w_dst_pos, enemy){
        if(!this.node.parent){
            console.log("shoot_at must add to parent first");
            return;
        }

        this.shoot_enemy = enemy;

        this._set_bullet_idle();
        var start_pos = this.node.parent.convertToNodeSpaceAR(w_start_pos);
        var dst_pos = this.node.parent.convertToNodeSpaceAR(w_dst_pos);

        this.node.setPosition(start_pos);
        this.anim.rotation = 0;

        var dir = cc.pSub(w_dst_pos, w_start_pos);
        var len = cc.pLength(dir);
        var time = len / cannon_bullet_params[this.bullet_level - 1].speed;

        if(this.shoot_enemy != null){
            var actor = this.shoot_enemy.getComponent("actor");
            dst_pos = actor.position_after_time(time);
            w_dst_pos = this.shoot_enemy.parent.convertToWorldSpaceAR(dst_pos);
        }

        var ctrl_x = (start_pos.x + dst_pos.x) * 0.5;
        var ctrl_y = (dst_pos.y > start_pos.y) ? dst_pos.y : start_pos.y;
        ctrl_y += 40;

        var bze_list = [cc.p(ctrl_x, ctrl_y), cc.p(ctrl_x, ctrl_y), dst_pos];
        var b = cc.bezierTo(time, bze_list);

        var end_func = cc.callFunc(function(){
            this.on_bullet_bomb(w_dst_pos);
            this.play_bullet_bomb_anim();
        }.bind(this), this);

        var seq = cc.sequence([b, end_func]);
        this.node.runAction(seq);

        var degree;
        if(w_dst_pos.x < w_start_pos.x){
            degree = -180 + Math.random() * 10;
        }else{
            degree = 180 - Math.random() * 10;
        }
        var r = cc.rotateBy(time, degree);
        this.anim.runAction(r);
    },

    play_bullet_bomb_anim: function(){
        var frame_anim = this.anim.getComponent("frame_anim");
        if(!frame_anim){
            frame_anim = this.anim.addComponent("frame_anim");
        }

        frame_anim.sprite_frames = this.level_bullet_res[this.bullet_level - 1].bullet_bomb_frame;
        frame_anim.duration = this.level_bullet_res[this.bullet_level - 1].duration;
        frame_anim.play_once(function(){
            this.node.removeFromParent();
        }.bind(this));
    },

    on_bullet_bomb: function(w_dst_pos){
        var bomb_R = cannon_bullet_params[this.bullet_level - 1].bomb_R;
        var pos = this.node.getPosition();
        var enemy_set = ugame.get_enemy_set();
        for(var i = 0; i < enemy_set.length; i ++){
            var e_pos = enemy_set[i].getPosition();
            var dir = cc.pSub(e_pos, pos);
            if(bomb_R >= cc.pLength(dir)){
                var actor = enemy_set[i].getComponent("actor");
                actor.on_attacked(cannon_bullet_params[this.bullet_level - 1].attack);
            }
        }
    },

    start () {

    },

    // update (dt) {},
});
