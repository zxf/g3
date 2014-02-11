(function(){
    var utils = g3.module('utils');

    var EventMaster = g3.extendClass({
        init: function(scope){
            this._scope = scope || window;
            this._events = {};
        },
        _bind: function(event, callback){
            if(!(event in this._events)){
                this._events[event] = [];
            }
            this._events[event].push(callback);
        },
        bind: function(){
            if(typeof arguments[0] == 'string'){
                this._bind(arguments[0], arguments[1]);
            }
            else{
                for(var event in arguments[0]){
                    var callback = arguments[0][event];
                    this._bind(event, callback);
                }
            }
        },
        unbind:function(event, callback){
            if(callback == undefined){
                this._events[event] = null;
                delete this._events[event];
            }
            else{
                var index = (this._events[event] || []).indexOf(callback);
                if(index >= 0){
                    this._events[event].splice(index, 1);
                }
            }
        },
        trigger:function(){
            var args = utils.toArray(arguments);
            var event = args.shift();
            var callbacks = this._events[event] || [];
            for(var i in callbacks){
                if(callbacks[i].apply(this._scope, args) === false){
                    return false;
                }
            }
            return null;
        },
        clear: function(){
            this._events = {};
        }
    });

    
    G3Event = g3.extendClass({
        init: function(data){
            this._data = data;
        }
    });

    g3.module('event', {
        'Master': EventMaster,
        'Event': G3Event
    });
    
})();