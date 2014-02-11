/*!
* g3 v0.0.1
* Copyright 2014 Felix.Zhu
*/
var g3 = (function(){
var g3 = {};
var MODULESPARATOR = ".";
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
(function(){
    var BackendObject = g3.extendClass({
        init: function(){

        }
    });

    g3.module('backends', {
        'Base': BackendObject
    });

})();
(function(){
    var utils = g3.module('utils');
    var ThreeBackend = g3.extendClass('backends.Base', {
        init: function(width, height){
            if(!window.THREE){
                throw "require three.js.";
            }
            this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 1100);
            this.scene = new THREE.Scene();
            this.renderer = new THREE.CanvasRenderer();
            this.renderer.setSize(width, height);

            this.texture_placeholder = document.createElement( 'canvas' );
            this.texture_placeholder.width = 128;
            this.texture_placeholder.height = 128;
        },
        addCubeScene: function(materials){
            var _this = this;
            materials = utils.map(materials, function(material){
                return _this.loadTexture(material);
            });
            var mesh = new THREE.Mesh(new THREE.CubeGeometry(300, 300, 300, 7, 7, 7), new THREE.MeshFaceMaterial(materials));
            var group = new THREE.Object3D();
            mesh.scale.x = -1;
            this.scene.add(mesh);
            this.scene.add(group);
            this.group = group;
        },
        loadTexture: function(path){
            var _this = this;
            var texture = new THREE.Texture( this.texture_placeholder );
            var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: true } );
            var image = new Image();

            image.onload = function () {
                texture.needsUpdate = true;
                material.map.image = this;
                _this.render();
            };
            image.src = path;
            return material;
        },
        lookAt: function(target){
            target = new THREE.Vector3(target.x, target.y, target.z);
            this.camera.lookAt(target);
        },
        render: function(){
            this.renderer.render(this.scene, this.camera );
        },
        dom: function(){
            return this.renderer.domElement;
        }
    });

    g3.module('backends', {
        'ThreeBackend': ThreeBackend
    });
})();
(function(){
    var utils = g3.module('utils');
    var Position = g3.extendClass({
        init: function(pos){
            this.lon = pos[0];
            this.lat = pos[1];
        },
        getLon: function(){
            return this.lon;
        },
        getLat: function(){
            return this.lat;
        },
        getCoord: function(){
            var lon = this.lon;
            var lat = this.lat;
            lat = Math.max(-85, Math.min(85, lat));
            var phi = utils.degToRad(90 - lat);
            var theta = utils.degToRad(lon);

            var x = 500 * Math.sin(phi) * Math.cos(theta);
            var y = 500 * Math.cos(phi);
            var z = 500 * Math.sin(phi) * Math.sin(theta);
            return {
                x:x,
                y:y,
                z:z
            };
        }
    });

    g3.module('pano',{
        'Position': Position
    });

})();
(function(){
    var Hotspot = g3.extendClass({
        init: function(pos){
            this.pos = pos;
        }
    });

    g3.module('pano',{
        'Hotspot': Hotspot
    });

})();
(function(){
    var Hotspot = g3.module('pano.Hotspot');
    var Position = g3.module('pano.Position');

    var Scene = g3.extendClass({

    });

    var StaticScene = g3.extendClass(Scene, {
        
    });

    var PanoScene = g3.extendClass(Scene, {
        init: function(materials, pos){
            this.materials = materials;
            this.pos = pos || new Position([0,0]);
            this.hotspots = {};
        },
        setPos: function(pos){
            this.pos = pos;
        },
        getPos: function(){
            return this.pos;
        },
        getLon: function(){
            return this.getPos().getLon();
        },
        getLat: function(){
            return this.getPos().getLat();
        },
        getCoord: function(){
            return this.getPos().getCoord();
        },
        addHotspot: function(name, hotspot){
            this.hotspots[name] = hotspot;
        },
        getHotspot: function(name){
            return this.hotspots[name];
        }
    });


    g3.module('pano',{
        'StaticScene': StaticScene,
        'Scene' : PanoScene
    });

})();
(function(){
    var utils = g3.module('utils'),
        Backend = g3.module('backends.ThreeBackend'),
        EventMaster = g3.module('event.Master'),
        StaticScene = g3.module('pano.StaticScene'),
        PanoScene = g3.module('pano.Scene'),
        Position = g3.module('pano.Position');

    var PRenderer = g3.extendClass({
        init: function(container, width, height){
            this.container = container;
            this.backend = new Backend(width, height);
            this.scene = null;
            this._draggable = true;
            this.bindEvents();
        },
        bindEvents: function(){
            var _this = this;

            var isUserInteracting = false,
            onMouseDownMouseX = 0, onMouseDownMouseY = 0,
            onPointerDownLon = 0, onPointerDownLat = 0,
            lon = 0, lat = 0;

            var onMouseDown = function(event){
                if(_this.isDraggable()){
                    event.preventDefault();
                    isUserInteracting = true;
                    onPointerDownPointerX = event.clientX;
                    onPointerDownPointerY = event.clientY;
                    onPointerDownLon = _this.scene.getLon();
                    onPointerDownLat = _this.scene.getLat();
                }
            };

            var onMouseMove = function(event){
                if(_this.isDraggable()){
                    if (isUserInteracting){
                        lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
                        lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
                        _this.moveTo(new Position([lon, lat]));
                    }
                }
            };

            var onMouseUp = function(event){
                if(_this.isDraggable()){
                    isUserInteracting = false;
                    _this.moveTo(new Position([lon, lat]));
                }
            };

            var onTouchStart = function(event){
                if(_this.isDraggable()){
                    if (event.touches.length == 1){
                        event.preventDefault();
                        onPointerDownPointerX = event.touches[ 0 ].pageX;
                        onPointerDownPointerY = event.touches[ 0 ].pageY;
                        onPointerDownLon = lon;
                        onPointerDownLat = lat;
                    }
                }
            };

            var onTouchMove = function(event){
                if(_this.isDraggable()){
                    if (event.touches.length == 1){
                        event.preventDefault();
                        lon = ( onPointerDownPointerX - event.touches[0].pageX ) * 0.1 + onPointerDownLon;
                        lat = ( event.touches[0].pageY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
                        _this.moveTo(new Position([lon, lat]));
                    }
                }
            };

            this.container.addEventListener('mousedown', onMouseDown, false);
            this.container.addEventListener('mousemove', onMouseMove, false);
            this.container.addEventListener('mouseup', onMouseUp, false);

            this.container.addEventListener('touchstart', onTouchStart, false);
            this.container.addEventListener('touchmove', onTouchMove, false);
        },
        dom: function(){
            return this.backend.dom();
        },
        draggable: function(enable){
            this._draggable = enable;
        },
        isDraggable: function(){
            return this._draggable && this.scene;
        },
        moveTo: function(pos){
            this.backend.lookAt(pos.getCoord());
            this.scene.setPos(pos);
            this.backend.render();
        },
        render: function(scene){
            this.backend.addCubeScene(scene.materials);
            this.backend.lookAt(scene.getCoord());
            this.backend.render();
            this.scene = scene;
        }
    });

    var Panorama = g3.extendClass({
        init: function(options){
            this.opts = utils.extend({}, options);
            this.container = this.getOption('container');
            this.renderer = new PRenderer(this.container, this.getOption('width'), this.getOption('height'));
            this.draggable(this.getOption('draggable'));
            this.mevent = new EventMaster(this);
            this.scenes = {};
            //active scene
            this._scene = null;
            this.bindEvents();
        },
        getOption: function(name, defalut_value){
            if(name in this.opts){
                return this.opts[name];
            } else {
                return defalut_value;
            }
        },
        draggable: function(enable){
            this.renderer.draggable(enable);
            this.opts['draggable'] = enable;
        },
        bindEvents: function(){
            var _this = this;
            this.container.appendChild(this.dom());
        },
        addScene: function(name, scene){
            this.scenes[name] = scene;
            if(!this._default){
                this._default = name;
            }
        },
        switchScene: function(name){
            this._active = name;
            this.renderer.render(this.scenes[name]);
        },
        setDefaultScene: function(name){
            this._default = name;
        },
        render: function(){
            var name = this._active || this._default;
            this.switchScene(name);
        },
        dom: function(){
            return this.renderer.dom();
        },
        bind: function(){
            this.mevent.bind.apply(this.mevent, arguments);
        }
    });

    g3.module('pano', {
        'Render': PRenderer,
        'Panorama': Panorama
    });

})();
(function(){
    var pano = g3.module('pano');
    var event = g3.module('event');
    
    g3.exports({
        'Event': event.G3Event,
        'pano': {
            'Panorama': pano.Panorama,
            'Scene': pano.Scene,
            'Hotspot': pano.Hotspot,
            'Position': pano.Position
        }
    });

})();
return exports;
})();