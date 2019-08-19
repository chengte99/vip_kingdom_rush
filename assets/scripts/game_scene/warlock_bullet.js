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
var warlock_bullet_params = require("warlock_bullet_params");

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
        
        warlock_bullet_frame: {
            default: null,
            type: cc.SpriteFrame
        },

        warlock_bullet_bomb_frame: {
            default: [],
            type: cc.SpriteFrame
        },

        duration: 0.1
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.anim = this.node.getChildByName("anim");
    },

    shoot_at: function(w_start_pos, w_dst_pos, enemy){
        if(!this.node.parent){
            console.log("shoot_at must add to parent first");
            return;
        }

        this.shoot_enemy = enemy;
        var start_pos = this.node.parent.convertToNodeSpaceAR(w_start_pos);
        var dst_pos = this.node.parent.convertToNodeSpaceAR(w_dst_pos);

        this.node.setPosition(start_pos);
        this.anim.rotation = 0;

        var dir = cc.pSub(w_dst_pos, w_start_pos);
        var len = cc.pLength(dir);
        var time = len / warlock_bullet_params[this.bullet_level - 1].speed;

        if(this.shoot_enemy != null){
            var actor = this.shoot_enemy.getComponent("actor");
            dst_pos = actor.position_after_time(time);
            w_dst_pos = this.shoot_enemy.parent.convertToWorldSpaceAR(dst_pos);
        }

        var m = cc.moveTo(time, dst_pos);
        var end_func = cc.callFunc(function(){
            this._play_bullet_bomb_frame();
        }.bind(this), this);

        var seq = cc.sequence([m, end_func]);
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

    _play_bullet_bomb_frame: function(){
        this._on_bullet_bomb();
        var frame_anim = this.anim.getComponent("frame_anim");
        if(!frame_anim){
            frame_anim = this.anim.addComponent("frame_anim");
        }
        frame_anim.sprite_frames = this.warlock_bullet_bomb_frame;
        frame_anim.duration = this.duration;
        frame_anim.play_once(function(){
            this.node.removeFromParent();
        }.bind(this));
    },

    _on_bullet_bomb: function(){
        if(this.shoot_enemy === null){
            return;
        }

        if(ugame.is_enemy_exist(this.shoot_enemy)){
            var actor = this.shoot_enemy.getComponent("actor");
            actor.on_attacked_by_warlock(warlock_bullet_params[this.bullet_level - 1].attack);
        }
    },

    start () {
        
    },

    // update (dt) {},
});
