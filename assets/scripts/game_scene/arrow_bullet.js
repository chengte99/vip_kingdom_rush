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
var arrow_bullet_params = require("arrow_bullet_params");

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

        arrow_bullet_frame: {
            default: null,
            type: cc.SpriteFrame
        },

        decal_arrow_bullet_frame: {
            default: null,
            type: cc.SpriteFrame
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.anim = this.node.getChildByName("anim");
        this.speed = arrow_bullet_params[this.bullet_level - 1].speed;
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
        this.anim.rotation = 90;

        var dir = cc.pSub(w_dst_pos, w_start_pos);
        var len = cc.pLength(dir);
        var time = len / this.speed;

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

        var func = cc.callFunc(function(){
            var s = this.anim.getComponent(cc.Sprite);
            s.spriteFrame = this.decal_arrow_bullet_frame;
            this._on_bullet_bomb();
        }.bind(this), this);

        var end_func = cc.callFunc(function(){
            this.node.removeFromParent();
        }.bind(this), this);

        var seq = cc.sequence([b, func, cc.delayTime(3), cc.fadeOut(0.3), end_func]);
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

    _on_bullet_bomb: function(){
        if(this.shoot_enemy === null || !ugame.is_enemy_exist(this.shoot_enemy)){
            return;
        }

        var actor = this.shoot_enemy.getComponent("actor");
        actor.on_attacked_by_arrow(arrow_bullet_params[this.bullet_level - 1].attack);
        this.node.removeFromParent();
    },

    start () {

    },

    // update (dt) {},
});
