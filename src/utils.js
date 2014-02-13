(function(){
    var utils = {};

    utils = {
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
        },
        proxy: function(func, scope){
            return function(){
                return func.apply(scope, arguments);
            };
        }
    };

    utils.WidgetObject = g3.extendClass({
        default_options: {},
        init: function(options){
            this.opts = utils.extend({}, this.default_options, options);
        },
        option: function(){
            if(arguments.length == 1){
                if(typeof arguments[0] == "string"){
                    return this.getOption(arguments[0]);
                } else {
                    utils.extend(this.opts, arguments[0]);
                    return true;
                }
            }
            else {
                this.setOption(arguments[0], arguments[1]);
                return true;
            }
        },
        getOption: function(name, defalut_value){
            if(name in this.opts){
                return this.opts[name];
            } else {
                return defalut_value;
            }
        },
        setOption: function(name, value){
            this.opts[name] = value;
        }
    });

    g3.module('utils', utils);
})();