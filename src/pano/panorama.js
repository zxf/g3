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