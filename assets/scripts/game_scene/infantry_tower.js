// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var infantry_tower_skin = cc.Class({
    name: "infantry_tower_skin",
    properties: {
        infantry_tower_frame:{
            default: [],
            type: cc.SpriteFrame
        },
        infantry_tower_duration: 0.1
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
            type: infantry_tower_skin
        },

        actor_prefab: {
            default: null,
            type: cc.Prefab
        },

        actor_root_path: "UI_ROOT/map_root/bullet_root"
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.tower_level = 1;
        this.anim = this.node.getChildByName("anim");
        this.actor_root = cc.find(this.actor_root_path);
        
        this._set_infantry_tower_idle();
    },

    _set_infantry_tower_idle: function(){
        var s = this.anim.getComponent(cc.Sprite);
        s.spriteFrame = this.level_tower_skin_res[this.tower_level - 1].infantry_tower_frame[0];
    },

    _play_tower_open_anim: function(){
        var frame_anim = this.anim.getComponent("frame_anim");
        if(!frame_anim){
            frame_anim = this.anim.addComponent("frame_anim");
        }
        frame_anim.sprite_frames = this.level_tower_skin_res[this.tower_level - 1].infantry_tower_frame;
        frame_anim.duration = this.level_tower_skin_res[this.tower_level - 1].infantry_tower_duration;
        frame_anim.play_once(function(){
            this._set_infantry_tower_idle();
        }.bind(this));
    },

    _gen_actor: function(w_dst_pos){
        var delay = cc.delayTime(0.6);
        var end_func = cc.callFunc(function(){
            var actor = cc.instantiate(this.actor_prefab);
            this.actor_root.addChild(actor);
            actor.active = true;
            var com = actor.getComponent("infantry_actor");
            com.infantry_level = this.tower_level;
            com.gen_actor(this.node.convertToWorldSpaceAR(cc.p(0, 0)), w_dst_pos);
        }.bind(this), this);
        var seq = cc.sequence([delay, end_func]);
        this.node.runAction(seq);
    },

    gen_infantry: function(w_dst_pos){
        this._play_tower_open_anim();

        this._gen_actor(w_dst_pos);
    },

    start () {
        this.schedule(function(){
            var R = 60;
            var r = Math.random() * 2 * Math.PI;
            var w_pos = this.node.convertToWorldSpaceAR(cc.p(0, 0));
            var w_dst_pos = cc.p(w_pos.x + R * Math.cos(r), w_pos.y + R * Math.sin(r));

            this.gen_infantry(w_dst_pos);
        }.bind(this), 4);
    },

    to_upgrade: function(){
        if(this.tower_level >= 4){
            return this.tower_level;
        }

        this.tower_level ++;
        this._set_infantry_tower_idle();

        return this.tower_level;
    },

    // update (dt) {},
});
