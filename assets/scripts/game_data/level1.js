var Enemy = require("Enemy");

var level1_data = [
    //第一波
    {
        delay: 2,
        num: 3,

        enemy_type: [Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2],
        round_time_set: [0, 0.6, 0.6],

        random_road: true,
        road_set: [0, 1, 2],

        actor_params: {
            speed: 50,
            health: 30,
            attack: 10,
            damage: 1,
            chip: 10
        }
    },
    //第二波
    {
        delay: 2,
        num: 6,

        enemy_type: [Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2],
        round_time_set: [0, 0.6, 0.6, 3.6, 0.6, 0.6],

        random_road: true,
        road_set: [0, 1, 2],

        actor_params: {
            speed: 50,
            health: 30,
            attack: 10,
            damage: 1,
            chip: 10
        }
    },
    //第三波
    {
        delay: 2,
        num: 9,

        enemy_type: [Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2],
        round_time_set: [0, 0.6, 0.6, 3.6, 0.6, 0.6, 3.6, 0.6, 0.6],

        random_road: true,
        road_set: [0, 1, 2],

        actor_params: {
            speed: 50,
            health: 30,
            attack: 10,
            damage: 1,
            chip: 10
        }
    },
    //第四波
    {
        delay: 2,
        num: 5,

        enemy_type: [Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_0],
        round_time_set: [0, 0.6, 0.6, 0.6, 2.6],

        random_road: true,
        road_set: [0, 1, 2],

        actor_params: {
            speed: 50,
            health: 80,
            attack: 10,
            damage: 1,
            chip: 10
        }
    },
    //第五波
    {
        delay: 2,
        num: 10,

        enemy_type: [Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_0, Enemy.enemy_0, Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_2, Enemy.enemy_0, Enemy.enemy_0],
        round_time_set: [0, 0.6, 0.6, 2.6, 0.6, 2.6, 0.6, 0.6, 2.6, 0.6],

        random_road: true,
        road_set: [0, 1, 2],

        actor_params: {
            speed: 50,
            health: 80,
            attack: 10,
            damage: 1,
            chip: 20
        }
    },
    //第六波
    // {
    //     delay: 2,
    //     num: 12,
    //     enemy_type: Enemy.enemy_5,
    //     delta_time: 0.5,
    //     random_time: 0.1,
    //     random_road: true,
    //     road_set: [0, 1, 2],

    //     actor_params: {
    //         speed: 25,
    //         health: 100,
    //         attack: 50
    //     }
    // },
    //第七波
    // {
    //     delay: 2,
    //     num: 3,
    //     enemy_type: Enemy.enemy_3,
    //     delta_time: 0.5,
    //     random_time: 0.1,
    //     random_road: false,
    //     road_set: [0, 1, 2],

    //     actor_params: {
    //         speed: 10,
    //         health: 100,
    //         attack: 50
    //     }
    // },
];

module.exports = level1_data;