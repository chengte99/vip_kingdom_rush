var ugame = require("ugame");

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        this.anim_com = this.node.getComponent(cc.Animation);
        var clips = this.anim_com.getClips();
        var clip = clips[0];
        
        this.draw_node = new cc.DrawNode();
        this.node._sgNode.addChild(this.draw_node);
        
        var paths = clip.curveData.paths;
        // console.log(paths);
        
        this.road_data_set = [];
        
        var k;
        for (k in paths) {
            var road_data = paths[k].props.position;
            this.gen_path_data(road_data);
        }

        this.set_road_data();
    },

    start () {
        // var actor = cc.find("UI_ROOT/map_root/enemy_6").getComponent("actor");
        // actor.gen_at_road(this.road_data_set[1]);
    },

    set_road_data: function(){
        ugame.set_cur_road_data(this.road_data_set);
    },
    
    gen_path_data: function(road_data) {
        var ctrl1 = null;
        var start_point = null;
        var end_point = null;
        var ctrl2 = null;
        
        var road_curve_path = []; // [start_point, ctrl1, ctrl2, end_point],
        for(var i = 0; i < road_data.length; i ++) {
            var key_frame = road_data[i];
            if (ctrl1 !== null) {
                road_curve_path.push([start_point, ctrl1, ctrl1, cc.p(key_frame.value[0], key_frame.value[1])]);
            }
            
            start_point = cc.p(key_frame.value[0], key_frame.value[1]);
            
            for(var j = 0; j < key_frame.motionPath.length; j ++) {
                var end_point = cc.p(key_frame.motionPath[j][0], key_frame.motionPath[j][1]);
                ctrl2 = cc.p(key_frame.motionPath[j][2], key_frame.motionPath[j][3]);
                if (ctrl1 === null) {
                    ctrl1 = ctrl2;
                }
                // 贝塞尔曲线 start_point, ctrl1, ctrl2, end_point,
                road_curve_path.push([start_point, ctrl1, ctrl2, end_point]);
                ctrl1 = cc.p(key_frame.motionPath[j][4], key_frame.motionPath[j][5]);
                start_point = end_point;
            }
        }
        
        // console.log(road_curve_path);
        
        var one_road = [road_curve_path[0][0]];
        
        for(var index = 0; index < road_curve_path.length; index ++) {
            start_point = road_curve_path[index][0];
            ctrl1 = road_curve_path[index][1];
            ctrl2 = road_curve_path[index][2];
            end_point = road_curve_path[index][3];
            
            var len = this.bezier_length(start_point, ctrl1, ctrl2, end_point);
            var OFFSET = 16;
            var count = len / OFFSET;
            count = Math.floor(count);
            var t_delta = 1 / count;
            var t = t_delta;
            
            for(var i = 0; i < count; i ++) {
                var x = start_point.x * (1 - t) * (1 - t) * (1 - t) + 3 * ctrl1.x * t * (1 - t) * (1 - t) + 3 * ctrl2.x * t * t * (1 - t) + end_point.x * t * t * t;
                var y = start_point.y * (1 - t) * (1 - t) * (1 - t) + 3 * ctrl1.y * t * (1 - t) * (1 - t) + 3 * ctrl2.y * t * t * (1 - t) + end_point.y * t * t * t;
                one_road.push(cc.p(x, y));
                t += t_delta;
            }
        }
        
        // console.log(one_road);
        // for (var i = 0; i < one_road.length; i ++) {
        //     this.draw_node.drawSegment(one_road[i], 
        //                               cc.p(one_road[i].x + 1, one_road[i].y + 1),
        //                               1, cc.color(255, 0, 0, 255));
        // }
        this.road_data_set.push(one_road);
    }, 

    bezier_length: function(start_point, ctrl1, ctrl2, end_point) {
        // t [0, 1] t 分成20等分 1 / 20 = 0.05
        var prev_point = start_point;
        var length = 0;
        var t = 0.05;
        for(var i = 0; i < 20; i ++) {
            var x = start_point.x * (1 - t) * (1 - t) * (1 - t) + 3 * ctrl1.x * t * (1 - t) * (1 - t) + 3 * ctrl2.x * t * t * (1 - t) + end_point.x * t * t * t;
            var y = start_point.y * (1 - t) * (1 - t) * (1 - t) + 3 * ctrl1.y * t * (1 - t) * (1 - t) + 3 * ctrl2.y * t * t * (1 - t) + end_point.y * t * t * t;
            var now_point = cc.p(x, y);
            var dir = cc.pSub(now_point, prev_point);
            prev_point = now_point;
            length += cc.pLength(dir);
            
            t += 0.05;
        }
        return length;
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
