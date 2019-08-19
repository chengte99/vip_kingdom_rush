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
    },

    // LIFE-CYCLE CALLBACKS:

    set_button_state: function(item, state){
        var bt = item.getComponent(cc.Button);
        var bt1 = item.getChildByName("star_bg").getComponent(cc.Button);
        //state 0:無法點擊、反灰。 1:可升級，可點擊、不反灰。 2:已升級，不可點擊、不反灰，需要星數隱藏。
        if(state === 0){
            bt.interactable = false;
            bt.enableAutoGrayEffect = true;

            bt1.interactable = false;
            bt1.enableAutoGrayEffect = true;

            item.getChildByName("star_bg").active = true;
        }else if(state === 1){
            bt.interactable = true;

            bt1.interactable = false;
            bt1.enableAutoGrayEffect = false;

            item.getChildByName("star_bg").active = true;
        }else if(state === 2){
            bt.interactable = false;
            bt.enableAutoGrayEffect = false;

            item.getChildByName("star_bg").active = false;
        }
    },

    onLoad () {
        this.outside = false;
        var anim_root = this.node.getChildByName("anim_root");
        this.last_star_label = anim_root.getChildByName("star_num").getChildByName("src").getComponent(cc.Label);
        this.config_items = []; //[[item1, item2, item3, item4, item5], [], [], [], [], []]
        for(var col = 0; col < 6; col ++){
            var line_items = [];
            var skill_node = anim_root.getChildByName("skill" + (col + 1));
            for(var line = 0; line < 5; line ++){
                var item = skill_node.getChildByName("" + (line + 1));
                line_items.push(item);
                var bt = item.addComponent(cc.Button);

                var eventHandler = new cc.Component.EventHandler();
                eventHandler.target = this.node;
                eventHandler.component = "upgrade_config";
                eventHandler.handler = "on_click_skill"
                eventHandler.customEventData = ((col + 1) + "" + (line + 1));

                bt.clickEvents = [eventHandler];

                item.getChildByName("star_bg").addComponent(cc.Button);
                // this.set_button_state(item, 0);
            }
            this.config_items.push(line_items);
        }

        var udata = ugame.get_cur_user();
        this.show_button_level(udata.skill_level_info, udata.star_num);

        //this.show_button_level([0,1,2,3,4,5]);
    },

    //level_config [0,1,2,3,4,5]
    show_button_level: function(level_config, star_num){
        //計算剩餘星星量
        var last_star = star_num;
        for(var i = 0; i < level_config.length; i ++){
            var level = level_config[i];
            for(var j = 0; j <= level; j ++){
                last_star -= ugame.tower_skills_upgrade_config[i][j];
            }
        }

        for(var i = 0; i < level_config.length; i ++){
            var level = level_config[i];
            var skill_items = this.config_items[i];

            var j = 0;
            for(j = 0; j < level; j ++){
                this.set_button_state(skill_items[j], 2);
            }

            if(j < 5 && last_star >= ugame.tower_skills_upgrade_config[i][level + 1]){
                this.set_button_state(skill_items[j], 1);
                j ++;
            }

            for(; j < 5; j++){
                this.set_button_state(skill_items[j], 0);
            }
        }

        this.last_star_label.string = "" + last_star;
    },

    start () {

    },

    on_click_skill: function(t, skill_level){
        if(this.outside === true){
            return;
        }

        skill_level = parseInt(skill_level);
        console.log(skill_level);
        
        var index = Math.floor(skill_level / 10);
        var level = skill_level - (index * 10);
        index --;

        var udata = ugame.get_cur_user();
        udata.skill_level_info[index] = level;

        this.show_button_level(udata.skill_level_info, udata.star_num);
    },

    on_click_reset: function(){
        if(this.outside === true){
            return;
        }

        var udata = ugame.get_cur_user();
        udata.skill_level_info = [0,0,0,0,0,0];

        this.show_button_level(udata.skill_level_info, udata.star_num);
    },

    on_click_done: function(){
        if(this.outside === true){
            return;
        }
        this.outside = true;

        ugame.sync_user_data();

        var anim_com = this.node.getComponent(cc.Animation);
        anim_com.play("hide_upgrade_config");
        this.scheduleOnce(function(){
            this.node.active = false;
            this.outside = false;
        }.bind(this), anim_com.currentClip.duration);
    },

    // update (dt) {},
});
