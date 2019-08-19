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
        tower_prefab: {
            type: cc.Prefab,
            default: []
        },

        //arrow: -200,-140. warlock: -200, -140. cannon: -200, -145. infantry: -200, -165
        //tower_builder: -195, -150
        tower_offset: {
            default: [],
            type: cc.Vec2
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // this.gui_builder = this.node.getChildByName("gui_builder");
        // this.gui_builder.active = false;

        // this.gui_undo = this.node.getChildByName("gui_undo");
        // this.gui_undo.active = false;

        // this.upgrade_button = this.gui_undo.getChildByName("build_ring").getChildByName("build_upgrade_icon").getComponent(cc.Button);

        this.gui_tower_builder= cc.find("UI_ROOT/gui_tower_builder").getComponent("gui_tower_builder");

        this.icon = this.node.getChildByName("icon");

        this.map_root = cc.find("UI_ROOT/map_root");

        this.is_builded = false;
        this.tower = null;
        this.tower_type = 0;
        this.tower_level = 0;

        this.tower_params = [];
        this.tower_params[0] = require("arrow_tower_params");
        this.tower_params[1] = require("warlock_tower_params");
        this.tower_params[2] = require("cannon_tower_params");
        this.tower_params[3] = require("infantry_tower_params");

        this.game_scene = cc.find("UI_ROOT").getComponent("game_scene");
    },

    show_gui_builder: function(){
        var s = cc.scaleTo(0.3, 1).easing(cc.easeBackOut());
        if(this.is_builded){
            this.gui_tower_builder.show_gui_undo(this);
            this.gui_tower_builder.node.scale = 0;
            this.gui_tower_builder.node.runAction(s);

            // this.gui_undo.scale = 0;
            // this.gui_undo.active = true;
            // this.gui_undo.runAction(s);
        }else{
            this.gui_tower_builder.show_gui_builder(this);
            this.gui_tower_builder.node.scale = 0;
            this.gui_tower_builder.node.runAction(s);

            // this.gui_builder.scale = 0;
            // this.gui_builder.active = true;
            // this.gui_builder.runAction(s);
        }
    },

    // hide_gui_builder: function(){
    //     this.gui_builder.active = false;
    //     this.gui_undo.active = false;
    // },

    check_chip_can_build: function(tower_level){
        var uchip = ugame.get_user_chip();
        var build_chip = this.tower_params[this.tower_type - 1][tower_level - 1].build_chip;
        if(uchip >= build_chip){
            return true;
        }

        return false;
    },

    // 1: arrow, 2: warlock, 3: cannon, 4: infantry tower
    build_tower: function(t, tower_type){
        if(this.is_builded === true){
            return;
        }

        tower_type = parseInt(tower_type);
        console.log(tower_type);
        if(tower_type <= 0 || tower_type > 4){
            return;
        }
        
        this.tower_type = tower_type;

        if(!this.check_chip_can_build(1)){
            return;
        }

        this.is_builded = true;
        this.tower = cc.instantiate(this.tower_prefab[tower_type - 1]);
        this.map_root.addChild(this.tower);
        var center_pos = this.node.getPosition();

        center_pos.x += this.tower_offset[tower_type -1].x;
        center_pos.y += this.tower_offset[tower_type -1].y;

        this.tower.setPosition(center_pos);
        this.icon.active = false;
        // this.gui_builder.active = false;

        var tower_com = this.get_tower_com();
        this.tower_level = tower_com.tower_level;

        var build_chip = this.tower_params[this.tower_type - 1][this.tower_level - 1].build_chip
        ugame.add_chip(-build_chip);
        this.game_scene.update_chip_string();
    },

    get_tower_com: function(){
        var tower_com;
        switch(this.tower_type){
            case 1:
                tower_com = this.tower.getComponent("arrow_tower");
                break;
            case 2:
                tower_com = this.tower.getComponent("warlock_tower");
                break;
            case 3:
                tower_com = this.tower.getComponent("cannon_tower");
                break;
            case 4:
                tower_com = this.tower.getComponent("infantry_tower");
                break;
            default:
                console.log("tower_type error");
                break;
        }

        return tower_com;
    },

    upgrade_tower: function(){
        if (this.is_builded === false || this.tower === null) {
            return;
        }

        if(this.tower_level >= 4){
            console.log("here!!!!");
            return;
        }

        var uchip = ugame.get_user_chip();
        var upgrade_chip = this.tower_params[this.tower_type - 1][this.tower_level].build_chip - 
                            this.tower_params[this.tower_type - 1][this.tower_level - 1].build_chip;
        if(upgrade_chip > uchip){
            return;
        }

        var tower_com = this.get_tower_com();
        this.tower_level = tower_com.to_upgrade();

        ugame.add_chip(-upgrade_chip);
        this.game_scene.update_chip_string();

        // if(tower_level >= 4){
        //     this.upgrade_button.interactable = false;
        // }
        // this.gui_undo.active = false;
    },

    undo_tower: function(){
        if(this.is_builded === false){
            return;
        }

        // this.gui_undo.active = false;
        // this.upgrade_button.interactable = true;
        var build_chip = this.tower_params[this.tower_type - 1][this.tower_level - 1].build_chip
        ugame.add_chip(build_chip);
        this.game_scene.update_chip_string();

        this.tower.removeFromParent();
        this.tower = null;
        this.tower_type = 0;
        this.icon.active = true;
        this.is_builded = false;
    },

    start () {

    },

    // update (dt) {},
});
