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