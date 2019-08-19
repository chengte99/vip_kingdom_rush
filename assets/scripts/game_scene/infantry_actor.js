// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var infantry_actor_skin = cc.Class({
    name: "infantry_actor_skin",
    properties: {
        actor_walk_frame: {
            default: [],
            type: cc.SpriteFrame
        },
        actor_walk_duration: 0.1,

        actor_attack_frame: {
            default: [],
            type: cc.SpriteFrame
        },
        actor_attack_duration: 0.1,

        actor_dead_frame: {
            default: [],
            type: cc.SpriteFrame
        },
        actor_dead_duration: 0.1,
    }
});

var infantry_actor_params = require("infantry_actor_params");

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
        infantry_level: 1,

        level_infantry_skin_res: {
            default: [],
            type: infantry_actor_skin
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.anim = this.node.getChildByName("anim");

        //ai
        this.state = 0; //0: idle, 1: walk, 2: attack, 3: dead
        this.walk_dst_pos = cc.p(0, 0);
        this.walk_time = 0;
        this.walk_vx = 0;
        this.walk_vy = 0;
        this.face_dir = 1; // 0: left, 1: right

        this._set_actor_idle(this.face_dir);
    },

    _set_actor_idle: function(is_right){
        if(is_right){
            this.anim.scaleX = 1;
        }else{
            this.anim.scaleX = -1;
        }
        var s = this.anim.getComponent(cc.Sprite);
        s.spriteFrame = this.level_infantry_skin_res[this.infantry_level - 1].actor_walk_frame[0];
    },

    gen_actor: function(w_start_pos, w_dst_pos){
        this.speed = infantry_actor_params[this.infantry_level - 1].speed;
        var pos = this.node.parent.convertToNodeSpaceAR(w_start_pos);
        this.node.setPosition(pos);

        this.walk_to_dst(w_dst_pos);
    },

    walk_to_dst: function(w_dst_pos){
        this.state = 1;
        this.walk_dst_pos = this.node.parent.convertToNodeSpaceAR(w_dst_pos);
        var start_pos = this.node.getPosition();
        
        var dir = cc.pSub(this.walk_dst_pos, start_pos);
        var len = cc.pLength(dir);
        this.walk_time = len / this.speed;
        this.walk_vx = this.speed * dir.x / len;
        this.walk_vy = this.speed * dir.y / len;

        if(this.walk_vx < 0){
            this.face_dir = 0;
            this.anim.scaleX = -1;
        }else{
            this.face_dir = 1;
            this.anim.scaleX = 1;
        }

        var frame_anim = this.anim.getComponent("frame_anim");
        if(!frame_anim){
            frame_anim = this.anim.addComponent("frame_anim");
        }
        frame_anim.sprite_frames = this.level_infantry_skin_res[this.infantry_level - 1].actor_walk_frame;
        frame_anim.duration = this.level_infantry_skin_res[this.infantry_level - 1].actor_walk_duration;
        frame_anim.play_loop();
    },

    actor_ai: function(){
        if(this.state === 3){
            //dead
            return;
        }
    },

    start () {

    },

    _walk_update: function(dt){
        if(this.walk_time <= 0){
            //idle
            this.state = 0;
            var frame_anim = this.anim.getComponent("frame_anim");
            frame_anim.stop_anim();
            this._set_actor_idle(this.face_dir);
            this.walk_vx = 0;
            this.walk_vy = 0;
            return;
        }

        if(this.walk_time <= dt){
            dt = this.walk_time;
        }

        var sx = this.walk_vx * dt;
        var sy = this.walk_vy * dt;
        this.node.x += sx;
        this.node.y += sy;

        this.walk_time -= dt;
    },

    update (dt) {
        if(this.state === 0){
            //idle
            return;
        }else if(this.state === 1){
            //walk
            this._walk_update(dt);
        }
    },
});
