/*!
* g3 v0.0.1
* Copyright 2013 Felix.Zhu
*/
var g3 = (function(){
var g3 = {};
MODULESPARATOR = ".";
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
        init: function(){
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
                if(callbacks[i].apply(this, args) === false){
                    return false;
                }
            }
            return null;
        },
        clear: function(){
            this._events = {};
        }
    });


    g3.module('event', {
        'master': EventMaster
    });
    
})();
(function(){
    var BackendObject = g3.extendClass({
        init: function(){

        }
    });

    g3.module('backends', {
        'base': BackendObject
    });

})();
(function(){
    var utils = g3.module('utils');
    var ThreeBackend = g3.extendClass('backends.base', {
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
            var material = new THREE.MeshFaceMaterial(materials);

            var particle = new THREE.Sprite( material );
            particle.scale.y = 1;
            particle.scale.x = 1;
            particle.position.x = 1;
            particle.position.z = 1;
            mesh.scale.x = -1;
            this.scene.add(mesh);
            this.scene.add(particle);
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
        'three': ThreeBackend
    });
})();
(function(){
    var Hotspot = g3.extendClass({
        init: function(){

        }
    });

    g3.module('panorama',{
        'hotspot': Hotspot
    });

})();
(function(){
    var Hotspot = g3.module('panorama.hotspot');

    var Scene = g3.extendClass({

    });

    var StaticScene = g3.extendClass(Scene, {
        
    });

    var PanoScene = g3.extendClass(Scene, {
        init: function(materials){
            this.materials = materials;
            this.lon = 0;
            this.lat = 0;
        },
        setPos: function(lon, lat){
            this.lon = lon;
            this.lat = lat;
        },
        getLon: function(){
            return this.lon;
        },
        getLat: function(){
            return this.lat;
        },
        addHotspot: function(lon, lat){
            
        }
    });


    g3.module('panorama',{
        'scene': {
            'static' : StaticScene,
            'panorama' : PanoScene
        }
    });

})();
(function(){
    var utils = g3.module('utils'),
        Backend = g3.module('backends.three'),
        EventMaster = g3.module('event.master'),
        StaticScene = g3.module('panorama.scene.static'),
        PanoScene = g3.module('panorama.scene.panorama');

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
                        _this.moveTo(lon, lat);
                    }
                }
            };

            var onMouseUp = function(event){
                if(_this.isDraggable()){
                    isUserInteracting = false;
                    _this.moveTo(lon, lat);
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
                        _this.moveTo(lon, lat);
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
        posToCoord: function(lon, lat){
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
        },
        draggable: function(enable){
            this._draggable = enable;
        },
        isDraggable: function(){
            return this._draggable && this.scene;
        },
        moveTo: function(lon, lat){
            this.backend.lookAt(this.posToCoord(lon, lat));
            this.scene.setPos(lon, lat);
            this.backend.render();
        },
        render: function(scene){
            this.backend.addCubeScene(scene.materials);
            this.backend.lookAt(this.posToCoord(scene.getLon(), scene.getLat()));
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
        addScene: function(name, materials){
            var scene = new PanoScene(materials);
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
        }
    });

    g3.module('panorama', {
        'render': PRenderer,
        'panorama': Panorama
    });

})();
(function(){
    var Panorama = g3.module('panorama.panorama');
    
    g3.exports({
        'Panorama': Panorama
    });

})();
return exports;
})();