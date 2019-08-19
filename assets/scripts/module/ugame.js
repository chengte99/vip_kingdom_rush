/*
clip: 2000,
blood: 20,
level_info: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
star_num: 0,
star_total: 77

tower_skills_level: {
    arrow_level: 1, // 弓箭
    infantry_level: 1, // 兵营;
    warlock_level: 1, // 术士;
    artillery_level: 1, // 火炮;

    skills_bomb_level: 1, // 炸弹技能的级别;
    skills_infantry_level: 1 // 放兵的技能的级别
}
*/

var ugame = {
    user_data: {
        0: null,
        1: null,
        2: null
    },
    cur_user: 0,
    
    tower_skills_upgrade_config: {
        0: [0, 1, 1, 2, 2, 3], // 弓箭塔
        1: [0, 1, 1, 2, 2, 3], // 步兵塔
        2: [0, 1, 1, 2, 2, 3], // 术士塔;
        3: [0, 1, 1, 3, 3, 3], // 火炮塔
        
        4: [0, 1, 1, 2, 2, 3], // 技能炸弹;
        5: [0, 2, 3, 3, 3, 4] // 技能步兵
    },

    cur_level: 0,

    sync_user_data: function(){
        var j_str = JSON.stringify(ugame.user_data);
        cc.sys.localStorage.setItem("user_data", j_str);
    },

    is_game_started: false,
    is_game_paused: false,

    enemy_set: [],

    clear_enemy_set: function(){
        this.enemy_set = [];
    },

    add_enemy_set: function(e){
        this.enemy_set.push(e);
    },

    remove_enemy_set: function(e){
        var index = this.enemy_set.indexOf(e);
        this.enemy_set.splice(index, 1);
    },

    is_enemy_exist: function(e){
        var index = this.enemy_set.indexOf(e);
        if(index < 0 || index >= this.enemy_set.length){
            return false;
        }

        return true;
    },

    get_enemy_set: function(){
        return this.enemy_set;
    },

    search_enemy: function(center_pos, R){
        for(var i = 0; i < this.enemy_set.length; i ++){
            var dst = this.enemy_set[i].getPosition();
            var dir = cc.pSub(dst, center_pos);
            if(cc.pLength(dir) <= R){
                return this.enemy_set[i];
            }
        }

        return null;
    },

    add_chip: function(chip){
        var cur_user = ugame.get_cur_user();
        cur_user.chip += chip;
    },

    get_user_chip: function(){
        var cur_user = ugame.get_cur_user();
        return cur_user.chip;
    },

    set_cur_user: function(index){
        if(index < 0 || index >= 3){
            user_index = 0;
        }
        ugame.cur_user = index;
    },

    get_cur_user: function(){
        return ugame.user_data[ugame.cur_user];
    },

    set_cur_level: function(level){
        ugame.cur_level = level;
    },

    get_cur_level: function(){
        return ugame.cur_level;
    },

    cur_road_data: [],

    set_cur_road_data: function(road_data){
        ugame.cur_road_data = road_data;
    },

    get_cur_road_data: function(){
        return ugame.cur_road_data;
    },
};

function _load_user_data(){
    var j_data = cc.sys.localStorage.getItem("user_data");
    if(j_data){
    // if(0){
        ugame.user_data = JSON.parse(j_data);
        return;
    }
    
    ugame.user_data = {
        0: {
            chip: 2000,
            blood: 20,
            level_info: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            star_num: 0,
            star_total: 77,

            skill_level_info: [0,0,0,0,0,0]
        },
        1: {
            chip: 2000,
            blood: 20,
            level_info: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            star_num: 0,
            star_total: 77,

            skill_level_info: [0,0,0,0,0,0]
        },
        2: {
            chip: 2000,
            blood: 20,
            level_info: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            star_num: 0,
            star_total: 77,

            skill_level_info: [0,0,0,0,0,0]
        }
    }
    ugame.sync_user_data();
};
function _compute_user_star(){
    for(var i = 0; i < 3; i ++){
        var total_star = 0;
        for(var j = 0; j < ugame.user_data[i].level_info.length; j ++){
            total_star += ugame.user_data[i].level_info[j];
        }
        ugame.user_data[i].star_num = total_star;
    }
};

_load_user_data();
_compute_user_star();

module.exports = ugame;