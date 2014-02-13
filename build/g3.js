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
            this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
            this.scene = new THREE.Scene();
            this.group = null;
            this.renderer = new THREE.CanvasRenderer();
            this.renderer.setSize(width, height);

            this.texture_placeholder = document.createElement( 'canvas' );
            this.texture_placeholder.width = 128;
            this.texture_placeholder.height = 128;

        },
        setScene: function(scene){
            var _this = this;
            this.clear();
            this.group = new THREE.Object3D();
            this.scene.add(this.group);
            //set scene
            materials = utils.map(scene.materials, function(material){
                return _this.loadTexture(material);
            });
            var mesh = new THREE.Mesh(new THREE.SphereGeometry(300, 300, 300, 7, 7, 7), new THREE.MeshFaceMaterial(materials));
            mesh.scale.x = - 1;
            //this.group.add(mesh);
            this.setHotspots(scene.hotspots);
        },
        setHotspots: function(hotspots){
            for(var k in hotspots){
                var hotspot = hotspots[k];
                //var mesh = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), material);
                var mesh = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100), new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, opacity: 0.5 }));
                //utils.extend(mesh.position, hotspot.getPos().getVectorCoord());
                //mesh.scale.x = -1;

                //var mesh = new THREE.Mesh(new THREE.PlaneGeometry( 480, 204, 4, 4 ), this.loadTexture(hotspot.material));
                //mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.5;
                //mesh.rotation.z = 90;
                this.group.add(mesh);
            }
        },
        loadTexture: function(path){
            var _this = this;
            var texture = new THREE.Texture(this.texture_placeholder);
            var material = new THREE.MeshBasicMaterial({ map: texture, overdraw: true });
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
            this.render();
        },
        setZoom: function(zoom){
            this.camera.fov = 75 - zoom * 6;
            this.camera.updateProjectionMatrix();
            this.render()
        },
        setSize: function(width, height){
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        },
        clear: function(){
            if(this.group){
                this.scene.remove(this.group);
                this.group = null;
            }
        },
        render: function(){
            this.renderer.render(this.scene, this.camera);
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
        getSphereCoord: function(){
            return {
                lon:this.lon,
                lat:this.lat
            };
        },
        getVectorCoord: function(){
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

    var ImageHotspot = g3.extendClass(Hotspot, {
        init: function(material, width, height, pos){
            this.material = material;
            this.width = width;
            this.height = height;
            this.pos = pos;
        },
        getPos: function(){
            return this.pos;
        }
    });

    g3.module('pano',{
        'ImageHotspot': ImageHotspot
    });

})();
(function(){
    var Position = g3.module('pano.Position');

    var Scene = g3.extendClass({
        init: function(materials, pos){
            this.materials = materials;
            this.pos = pos || new Position([0,0]);
            this.hotspots = {};
        },
        getPos: function(){
            return this.pos;
        },
        setPos: function(pos){
            this.pos = pos;
        },
        addHotspot: function(name, hotspot){
            this.hotspots[name] = hotspot;
        }
    });

    var BoxScene = g3.extendClass(Scene, {

    });


    g3.module('pano',{
        'Scene' : Scene,
        'BoxScene': BoxScene
    });

})();
(function(){
    var utils = g3.module('utils'),
        Backend = g3.module('backends.ThreeBackend'),
        EventMaster = g3.module('event.Master'),
        Position = g3.module('pano.Position');

    var TouchMeter = g3.extendClass({
        init: function(){
            this.isUserInteracting = false;
            this.onMouseDownMouseX = 0;
            this.onMouseDownMouseY = 0;
            this.onPointerDownLon = 0;
            this.onPointerDownLat = 0;
        },
        startMove: function(MousePos, ScenePos){
            this.isUserInteracting = true;
            this.onPointerDownPointerX = MousePos.x;
            this.onPointerDownPointerY = MousePos.y;
            this.onPointerDownLon = ScenePos.lon;
            this.onPointerDownLat = ScenePos.lat;
        },
        getMovePos: function(MousePos){
            var lon = ( this.onPointerDownPointerX - MousePos.x ) * 0.1 + this.onPointerDownLon;
            var lat = ( MousePos.y - this.onPointerDownPointerY ) * 0.1 + this.onPointerDownLat;
            return new Position([lon, lat]);
        },
        stopMove: function(){
            this.isUserInteracting = false;
        }
    });

    var Panorama = g3.extendClass(utils.WidgetObject, {
        /*
        * options:
        */
        default_options: {
            width                  :0,
            height                 :0,
            container              :'',
            draggable              :true,
            enableScrollWheelZoom  :true,
            maxZoom                :5,
        },
        init: function(options){
            this.super('init', [options]);
            this.container = this.getOption('container');
            this.backend = new Backend(
                this.getOption('width', this.container.width), 
                this.getOption('height', this.container.height));
            this.mevent = new EventMaster(this);
            this.touch_meter = new TouchMeter();
            this.scenes = {};
            this._active_scene = null;
            this._default_scene = null;
            this._zoom = 0;
            this.bindEvents();
        },
        bindEvents: function(){
            this.container.appendChild(this.backend.dom());
            this.container.addEventListener('mousedown', utils.proxy(this._onMouseDown, this), false);
            this.container.addEventListener('mousemove', utils.proxy(this._onMouseMove, this), false);
            this.container.addEventListener('mouseup', utils.proxy(this._onMouseUp, this), false);
            this.container.addEventListener('mousewheel', utils.proxy(this._onMouseWheel, this), false);

            this.container.addEventListener('touchstart', utils.proxy(this._onTouchStart, this), false);
            this.container.addEventListener('touchmove', utils.proxy(this._onTouchMove, this), false);
        },
        _onMouseDown: function(event){
            event.preventDefault();
            this.touch_meter.startMove(event, this.getActiveScene().getPos());
        },
        _onMouseMove: function(event){
            if(this.touch_meter.isUserInteracting){
                var pos = this.touch_meter.getMovePos(event);
                if(this.getOption('draggable')){
                    this.moveTo(pos);
                }
            }
        },
        _onMouseUp: function(event){
            this.touch_meter.stopMove();
        },
        _onMouseWheel: function(event){
            event.preventDefault();
            var delta = event.wheelDeltaY;
            var zoom = this._zoom + Math.floor(delta / 120);
            if(this.getOption('enableScrollWheelZoom')){
                this.setZoom(zoom);
            }
        },
        _onTouchStart: function(event){
            if (event.touches && event.touches.length == 1){
                event.preventDefault();
                this.touch_meter.startMove({
                    x:event.touches[0].pageX,
                    y:event.touches[0].pageY
                }, this.getActiveScene().getPos());
            }
        },
        _onTouchMove: function(event){
            if (event.touches && event.touches.length == 1){
                event.preventDefault();
                var pos = this.touch_meter.getMovePos({
                    x:event.touches[0].pageX,
                    y:event.touches[0].pageY
                });
                if(this.getOption('draggable')){
                    this.moveTo(pos);
                }
            }
        },
        getActiveScene: function(){
            return this.scenes[this._active_scene];
        },
        getScene: function(name){
            return this.scenes[name];
        },
        addScene: function(name, scene){
            this.scenes[name] = scene;
            if(!this._default_scene){
                this._default_scene = name;
            }
        },
        switchScene: function(name){
            var scene = this.scenes[name];
            this.backend.setScene(scene);
            this.backend.lookAt(scene.getPos().getVectorCoord());
            this._active_scene = name;
        },
        setDefaultScene: function(name){
            this._default_scene = name;
        },
        render: function(){
            var name = this._active_scene || this._default_scene;
            this.switchScene(name);
        },
        bind: function(){
            this.mevent.bind.apply(this.mevent, arguments);
        },
        setZoom: function(zoom){
            var maxZoom = this.getOption('maxZoom', this.default_options['maxZoom']),
                minZoom = 0;
            if(zoom > maxZoom){
                zoom = maxZoom;
            }
            if(zoom < minZoom){
                zoom = minZoom;
            }
            this.backend.setZoom(zoom);
            this._zoom = zoom;
        },
        zoomIn: function(){
            this.setZoom(this._zoom + 1);
        },
        zoomOut: function(){
            this.setZoom(this._zoom - 1);
        },
        moveTo: function(pos){
            this.backend.lookAt(pos.getVectorCoord());
            this.getActiveScene().setPos(pos);
        },
        refresh: function(){
            this.backend.render();
        }
    });

    g3.module('pano', {
        'Panorama': Panorama
    });

})();
(function(){
    var pano = g3.module('pano');
    var event = g3.module('event');
    
    g3.exports({
        'Event': event.G3Event,
        'pano': {
            'Panorama'       : pano.Panorama,
            'BoxScene'       : pano.BoxScene,
            'ImageHotspot'   : pano.ImageHotspot,
            'Position'       : pano.Position
        }
    });

})();
return exports;
})();