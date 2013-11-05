(function(){
    var utils = {
        each: function(list, handler){
            for(var i in list){
                if(handler(list[i], i) === false){
                    break;
                }
            }
        },
        map: function(list, handler){
            var result;
            if(list instanceof Array){
                result = [];
            } else {
                result = {};
            }
            for(var i in list){
                result[i] = handler(list[i], i);
            }
            return result;
        },
        extend: function(){
            var deep = false;
            var s = 0;
            if(arguments[0] === true){
                deep = true;
                s = 1;
            }
            var copy = function(value){
                if(deep){
                    if(value instanceof Array){
                        return utils.extend(true, [], value);
                    } else if(value instanceof Object){
                        return utils.extend(true, {}, value);
                    }
                }
                return value;
            };
            var r = arguments[s];
            for(var i=s+1;i<arguments.length;i++){
                if(arguments[i] instanceof Array){
                    for(var j=0;j<arguments[i].length;j++){
                        r[j] = copy(arguments[i][j]);
                    }
                } else {
                    for(var k in arguments[i]){
                        r[k] = copy(arguments[i][k]);
                    }
                }
            }
            return r;
        },
        toArray: function(obj){
            return Array.prototype.slice.call(obj);
        },
        degToRad: function(degrees){
            var degreeToRadiansFactor = Math.PI / 180;
            return degrees * degreeToRadiansFactor;
        }
    };
    g3.module('utils', utils);
})();