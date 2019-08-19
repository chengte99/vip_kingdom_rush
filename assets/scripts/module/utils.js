var utils = {
    random_int: function(start, end){
        var num = start + Math.random() * end;
        num = Math.floor(num);
        if(num >= end){
            num = end;
        }
        return num;
    },
};

module.exports = utils;