// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var utils = require("utils");
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
        failed_tips: {
            default: [],
            type: cc.String
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.active = false;

        this.failed_root = this.node.getChildByName("failed");
        this.passed_root = this.node.getChildByName("passed");

        this.fail_tip = this.failed_root.getChildByName("tips").getComponent(cc.Label);
        this.pass_tip = this.passed_root.getChildByName("tips").getComponent(cc.Label);
    },

    show_result_fail: function(){
        this.node.active = true;

        this.failed_root.active = true;
        this.passed_root.active = false;

        if(this.failed_tips.length > 0){
            var index = utils.random_int(0, this.failed_tips.length - 1);
            this.fail_tip.string = this.failed_tips[index];
        }
    },

    show_result_success: function(health){
        if(health <= 0){
            return;
        }
        console.log("health = ", health);

        this.node.active = true;

        this.failed_root.active = false;
        this.passed_root.active = true;

        var star1 = this.passed_root.getChildByName("star1").getChildByName("star");
        star1.active = true;
        var score = 1;
        
        if(health >= 10){
            var star2 = this.passed_root.getChildByName("star2").getChildByName("star");
            star2.active = true;
            score = 2;
        }

        if(health > 17){
            var star3 = this.passed_root.getChildByName("star3").getChildByName("star");
            star3.active = true;
            score = 3;
        }

        var cur_user = ugame.get_cur_user();
        if(score > cur_user.level_info[ugame.cur_level]){
            var add_value = score - cur_user.level_info[ugame.cur_level];
            cur_user.level_info[ugame.cur_level] = score;
            cur_user.star_num += add_value;

            ugame.sync_user_data();
        }
    },

    start () {

    },

    // update (dt) {},
});
