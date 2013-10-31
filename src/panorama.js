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
                lat = Math.max(-85, Math.min(85, lat));
                phi = THREE.Math.degToRad(90 - lat);
                theta = THREE.Math.degToRad(lon);

                _this.target.x = 500 * Math.sin(phi) * Math.cos(theta);
                _this.target.y = 500 * Math.cos(phi);
                _this.target.z = 500 * Math.sin(phi) * Math.sin(theta);
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