// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

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

    onLoad () {
        this.gui_builder = this.node.getChildByName("gui_builder");
        this.gui_undo = this.node.getChildByName("gui_undo");

        this.tower_builder = null;
    },

    show_gui_builder: function(tower_builder){
        this.tower_builder = tower_builder;
        if(!this.tower_builder){
            return;
        }

        this.node.active = true;
        this.gui_builder.active = true;
        this.gui_undo.active = false;

        this.node.x = tower_builder.node.x;
        this.node.y = tower_builder.node.y;
    },

    show_gui_undo: function(tower_builder){
        this.tower_builder = tower_builder;
        if(!this.tower_builder){
            return;
        }

        this.node.active = true;
        this.gui_builder.active = false;
        this.gui_undo.active = true;

        this.node.x = tower_builder.node.x;
        this.node.y = tower_builder.node.y;
    },

    hide_gui_builder: function(){
        this.gui_builder.active = false;
        this.gui_undo.active = false;
    },

    on_click_build_tower: function(t, tower_type){
        tower_type = parseInt(tower_type);
        if(tower_type <= 0 || tower_type > 4){
            return;
        }

        this.tower_builder.build_tower(t, tower_type);
        this.hide_gui_builder();
    },

    on_click_upgrade_tower: function(){
        this.tower_builder.upgrade_tower();
        this.hide_gui_builder();
    },

    on_click_undo_tower: function(){
        this.tower_builder.undo_tower();
        this.hide_gui_builder();
    },

    start () {

    },

    // update (dt) {},
});
