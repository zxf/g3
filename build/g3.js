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
        }
    };
    g3.module('utils', utils);
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
            mesh = new THREE.Mesh(new THREE.CubeGeometry(300, 300, 300, 7, 7, 7), new THREE.MeshFaceMaterial(materials));
            mesh.scale.x = -1;
            this.scene.add(mesh);
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
    var Panorama = g3.extendClass({
        init: function(container, width, height){
            this.container = container;
            this.backend = new (g3.module('backends.three'))(width, height);
            this.scenes = {};
            this.bindEvents();
        },
        bindEvents: function(){
            var _this = this;
            this.container.appendChild(this.dom());

            var isUserInteracting = false,
            onMouseDownMouseX = 0, onMouseDownMouseY = 0,
            lon = 90, onMouseDownLon = 0,
            lat = 0, onMouseDownLat = 0,
            phi = 0, theta = 0;
            var render = function(){
                lat = Math.max( - 85, Math.min( 85, lat ) );
                phi = THREE.Math.degToRad( 90 - lat );
                theta = THREE.Math.degToRad( lon );

                _this.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
                _this.target.y = 500 * Math.cos( phi );
                _this.target.z = 500 * Math.sin( phi ) * Math.sin( theta );
                _this.backend.lookAt(_this.target);
                _this.backend.render();
            }

            var onMouseDown = function(event){
                event.preventDefault();
                isUserInteracting = true;
                onPointerDownPointerX = event.clientX;
                onPointerDownPointerY = event.clientY;
                onPointerDownLon = lon;
                onPointerDownLat = lat;
            };
            var onMouseMove = function(event){
                if (isUserInteracting){
                    lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
                    lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
                    render();
                }
            }

            var onMouseUp = function(event){
                isUserInteracting = false;
                render();
            }

            var onTouchStart = function(event){
                if (event.touches.length == 1){
                    event.preventDefault();
                    onPointerDownPointerX = event.touches[ 0 ].pageX;
                    onPointerDownPointerY = event.touches[ 0 ].pageY;
                    onPointerDownLon = lon;
                    onPointerDownLat = lat;
                }
            }

            var onTouchMove = function(event){
                if (event.touches.length == 1){
                    event.preventDefault();
                    lon = ( onPointerDownPointerX - event.touches[0].pageX ) * 0.1 + onPointerDownLon;
                    lat = ( event.touches[0].pageY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
                    render();
                }
            }

            this.container.addEventListener('mousedown', onMouseDown, false);
            this.container.addEventListener('mousemove', onMouseMove, false);
            this.container.addEventListener('mouseup', onMouseUp, false);

            this.container.addEventListener('touchstart', onTouchStart, false);
            this.container.addEventListener('touchmove', onTouchMove, false);
        },
        addScene: function(name, materials, target){
            target = target || {
                x:0,
                y:0,
                z:0
            };
            this.scenes[name] = {
                materials:materials,
                target:target
            }
        },
        setScene: function(name){
            this.backend.addCubeScene(this.scenes[name]['materials']);
            this.backend.lookAt(this.scenes[name]['target']);
            this.target = this.scenes[name]['target'];
            this.backend.render();
        },
        dom: function(){
            return this.backend.dom();
        }
    });

    g3.module('panorama', {
        'Panorama': Panorama
    });

    g3.exports({
        'Panorama': Panorama
    });

})();
return exports;
})();