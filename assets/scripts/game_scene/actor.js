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

var STATE = {
    IDLE: 0,
    WALK: 1,
    ATTACK: 2,
    DEAD: 3,
    ARRIVED: 4
};

var DIRECTION = {
    INVALID: -1,
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
};

var walk_skin = cc.Class({
    name: "walk_skin",
    properties: {
        walk_frame_anim: {
            default: [],
            type: cc.SpriteFrame
        },
        walk_frame_duration: 0.1,
        scale_x: 1
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
        walk_anim_res: {
            default: [],
            type: walk_skin
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.speed = 50;
        this.state = STATE.IDLE;
        this.anim_dir = DIRECTION.INVALID;

        this.anim = this.node.getChildByName("anim");
        this.frame_anim = this.anim.addComponent("frame_anim");

        this.game_scene = cc.find("UI_ROOT").getComponent("game_scene");
        this.is_paused = false;
    },

    set_actor_params: function(actor_params){
        this.actor_params = actor_params;
        this.speed = this.actor_params.speed;
        this.health = this.actor_params.health;
        this.attack = this.actor_params.attack;
        this.damage = this.actor_params.damage;
    },

    gen_at_road: function(road_data){
        if(road_data < 2){
            return;
        }

        this.state = STATE.WALK;
        this.road_data = road_data;
        this.node.setPosition(road_data[0]);

        this.next_step = 1;
        this.walk_to_next();
    },

    _play_frame_anim: function(dir){
        var r = Math.atan2(dir.y, dir.x);

        //[-PI, -3/4PI]左， [-3/4PI, -1/4PI]下， [-1/4PI, 1/4PI]右， [1/4PI, 3/4PI]上， [3/4PI, PI]左
        var cur_dir = DIRECTION.INVALID;

        if(r >= -Math.PI && r < -0.75 * Math.PI){
            cur_dir = DIRECTION.LEFT;
        }else if(r >= -0.75 * Math.PI && r < -0.25 * Math.PI){
            cur_dir = DIRECTION.DOWN;
        }else if(r >= -0.25 * Math.PI && r < 0.25 * Math.PI){
            cur_dir = DIRECTION.RIGHT;
        }else if(r >= 0.25 * Math.PI && r < 0.75 * Math.PI){
            cur_dir = DIRECTION.UP;
        }else{
            cur_dir = DIRECTION.LEFT;
        }

        if(cur_dir === this.anim_dir){
            return;
        }
        this.anim_dir = cur_dir;
        this.frame_anim.stop_anim();
        this.frame_anim.sprite_frames = this.walk_anim_res[this.anim_dir].walk_frame_anim;
        this.frame_anim.duration = this.walk_anim_res[this.anim_dir].walk_frame_duration;
        this.anim.scaleX = this.walk_anim_res[this.anim_dir].scale_x;

        this.frame_anim.play_loop();
    },

    walk_to_next: function(){
        this.state = STATE.WALK;
        var start_pos = this.node.getPosition();
        var end_pos = this.road_data[this.next_step];
        var dir = cc.pSub(end_pos, start_pos);
        var len = cc.pLength(dir);
        this.walk_time_total = len / this.speed;
        this.walk_vx = this.speed * dir.x / len;
        this.walk_vy = this.speed * dir.y / len;
        this.walk_time = 0;

        this._play_frame_anim(dir);
    },

    start () {

    },

    position_after_time: function(dt){
        //靜止
        if(this.state != STATE.WALK){
            return this.node.getPosition();
        }

        //行走
        var prev_pos = this.node.getPosition();
        var next_step = this.next_step;
        while(dt > 0 && next_step < this.road_data.length){
            var now_pos = this.road_data[next_step];
            var dir = cc.pSub(now_pos, prev_pos);
            var len = cc.pLength(dir);
            var t = len / this.speed;

            if(dt > t){
                dt -= t;
                prev_pos = now_pos;
                next_step ++;
            }else{
                var vx = this.speed * dir.x / len;
                var vy = this.speed * dir.y / len;

                var sx = vx * dt;
                var sy = vy * dt;

                prev_pos.x += sx;
                prev_pos.y += sy;
                return prev_pos;
            }
        }

        return this.road_data[next_step - 1];
    },

    on_attacked: function(attack_value){
        this.health -= attack_value;
        if(this.health <= 0){
            this.health = 0;
            this.state = STATE.DEAD;
            var killed_chip = this.actor_params.chip;
            ugame.add_chip(killed_chip);
            this.game_scene.update_chip_string();
            ugame.remove_enemy_set(this.node);
            this.node.removeFromParent();
        }else{
            var per = this.health / this.actor_params.health;
            var blood_bar = this.node.getChildByName("blood").getComponent(cc.ProgressBar);
            blood_bar.progress = per;
        }
    },

    on_attacked_by_warlock: function(attack_value){
        this.on_attacked(attack_value);
    },

    on_attacked_by_arrow: function(attack_value){
        this.on_attacked(attack_value);
    },

    attack_player: function(damage){
        this.game_scene.player_on_attacked(damage);
        ugame.remove_enemy_set(this.node);
        this.node.removeFromParent();
    },

    _walk_update: function(dt){
        if(this.state != STATE.WALK){
            return;
        }

        this.walk_time += dt;
        if(this.walk_time >= this.walk_time_total){
            dt = (this.walk_time - this.walk_time_total);
        }

        var sx = this.walk_vx * dt;
        var sy = this.walk_vy * dt;

        this.node.x += sx;
        this.node.y += sy;

        if(this.walk_time >= this.walk_time_total){
            this.next_step ++;
            if(this.next_step >= this.road_data.length){
                this.state = STATE.ARRIVED;
                this.attack_player(this.damage);
            }else{
                this.walk_to_next();
            }
        }
    },

    update (dt) {
        if(ugame.is_game_started === false){
            this.frame_anim.stop_anim();
            return;
        }

        if(ugame.is_game_paused){
            this.frame_anim.stop_anim();
            this.is_paused = true;
            return;
        }

        if(this.is_paused){
            this.frame_anim.play_loop();
            this.is_paused = false;
        }

        if(this.state === STATE.WALK){
            this._walk_update(dt);
        }
    },
});
