var modules = {};
g3.module = function(){
    if(arguments.length == 1){
        if(typeof arguments[0] == "string"){
            var _paths = [];
            if(arguments[0]){
                _paths = arguments[0].split(MODULESPARATOR);
            }
            var _module = modules;
            for(var i = 0; i < _paths.length; i++){
                if(_paths[i] in _module){
                    _module = _module[_paths[i]];
                } else {
                    _module = undefined;
                    break;
                }
            }
            return _module;
        } else {
            for(var k in arguments[0]){
                var _module_path = k.split(MODULESPARATOR);
                var _module_name = _module_path.pop();
                var _parent_module = g3.module(_module_path.join(MODULESPARATOR));
                _parent_module[_module_name] = arguments[0][k];
            }
            return modules;
        }
    } else if (typeof arguments[0] == "string") {
        var _module = g3.module(arguments[0]);
        if(_module !== undefined){
            for(var k in arguments[1]){
                _module[k] = arguments[1][k];
            }
        } else {
            var _module_define = {};
            _module_define[arguments[0]] = arguments[1];
            g3.module(_module_define);
            _module = arguments[1];
        }
        return _module;
    }
    return undefined;
};

/*
* g3 object
*
*/
g3.Object = function(){};
g3.Object.prototype = {
    init:function(){}
};
g3.extendClass = function(){
    var parent = g3.Object;
    var prototypes = {};
    if(typeof arguments[0] == 'string'){
        parent = g3.module(arguments[0]);
        prototypes = arguments[1];
    } else if(typeof arguments[0] == 'function'){
        parent = arguments[0];
        prototypes = arguments[1];
    } else {
        prototypes = arguments[0];
    }
    var g3Object = function(){
        this.parent = parentObject.prototype;
        this.super = function(name, params){
            return this.parent[name].apply(this, params);
        };
        this.init.apply(this, arguments);
    };
    var parentObject = function(){};
    parentObject.prototype = parent.prototype;
    g3Object.prototype = new parentObject();
    for(var k in prototypes){
        g3Object.prototype[k] = prototypes[k];
    }
    return g3Object;
};

/*
* exports
*/
var exports = {};
g3.exports = function(value){
    for(var k in value){
        exports[k] = value[k];
    }
};