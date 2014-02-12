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

    var Panorama = g3.extendClass({
        init: function(options){
            this.opts = utils.extend({}, options);
            this.container = this.getOption('container');
            this.backend = new Backend(
                this.getOption('width', this.container.width), 
                this.getOption('height', this.container.height));
            this.mevent = new EventMaster(this);
            this.touch_meter = new TouchMeter();
            this.scenes = {};
            this._active_scene = null;
            this._default_scene = null
            this.bindEvents();
        },
        bindEvents: function(){
            this.container.appendChild(this.backend.dom());
            this.container.addEventListener('mousedown', utils.proxy(this._onMouseDown, this), false);
            this.container.addEventListener('mousemove', utils.proxy(this._onMouseMove, this), false);
            this.container.addEventListener('mouseup', utils.proxy(this._onMouseUp, this), false);

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
                this.moveTo(pos);
            }
        },
        _onMouseUp: function(event){
            this.touch_meter.stopMove();
        },
        _onTouchStart: function(event){
            if (event.touches && event.touches.length == 1){
                event.preventDefault();
                this.touch_meter.startMove({
                    x:event.touches[ 0 ].pageX,
                    y:event.touches[ 0 ].pageY
                }, this.getActiveScene().getPos());
            }
        },
        _onTouchMove: function(event){
            if (event.touches && event.touches.length == 1){
                event.preventDefault();
                var pos = this.touch_meter.getMovePos({
                    x:event.touches[ 0 ].pageX,
                    y:event.touches[ 0 ].pageY
                });
                this.moveTo(pos);
            }
        },
        getOption: function(name, defalut_value){
            if(name in this.opts){
                return this.opts[name];
            } else {
                return defalut_value;
            }
        },
        getActiveScene: function(){
            return this.scenes[this._active_scene];
        },
        addScene: function(name, scene){
            this.scenes[name] = scene;
            if(!this._default_scene){
                this._default_scene = name;
            }
        },
        switchScene: function(name){
            this._active_scene = name;
            var scene = this.scenes[name];
            this.backend.setScene(scene);
            this.backend.lookAt(scene.getPos().getVectorCoord());
            this.backend.render();
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
        moveTo: function(pos){
            this.backend.lookAt(pos.getVectorCoord());
            this.getActiveScene().setPos(pos);
            this.backend.render();
        }
    });

    g3.module('pano', {
        'Panorama': Panorama
    });

})();