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