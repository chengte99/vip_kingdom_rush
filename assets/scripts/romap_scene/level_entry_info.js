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
        star_num: 3,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.star_set = [];
        this.star_set[0] = this.node.getChildByName("star1").getChildByName("star");
        this.star_set[1] = this.node.getChildByName("star2").getChildByName("star");
        this.star_set[2] = this.node.getChildByName("star3").getChildByName("star");
    },

    show_star: function(starNum){
        if(starNum < 0 || starNum > 3){
            return;
        }
        
        var i;
        for(i = 0; i < starNum; i ++){
            this.star_set[i].active = true;
        }

        for(; i < 3; i ++){
            this.star_set[i].active = false;
        }
    },

    start () {
        // this.show_star(1);
    },

    // update (dt) {},
});
