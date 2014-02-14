(function(){
    var utils = g3.module('utils');
    var ThreePanoBackend = g3.extendClass('backends.Base', {
        init: function(width, height){
            if(!window.THREE){
                throw "require three.js.";
            }
            this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
            this.renderer = new THREE.CanvasRenderer();
            this.renderer.setSize(width, height);
            this.renderer.autoClear = false;

            this.scene_scene = new THREE.Scene();
            this.hotspot_scene = new THREE.Scene();
            this.scene = null;
            this.hotspots = [];

            this.texture_placeholder = document.createElement('canvas');
            this.texture_placeholder.width = 128;
            this.texture_placeholder.height = 128;

        },
        setScene: function(scene){
            var _this = this;
            this.clear();
            //set scene
            materials = utils.map(scene.materials, function(material){
                return _this.loadTexture(material);
            });
            utils.map(scene.hotspots, function(hotspot){
                return _this.setHotspot(hotspot);
            });
            var mesh = new THREE.Mesh(new THREE.CubeGeometry(300, 300, 300, 7, 7, 7), new THREE.MeshFaceMaterial(materials));
            //skyMesh = new THREE.Mesh( new Cube( 300, 7000, 7000, 1, 1, 1,  skyMaterials, true, { px: true, nx: true, py: true, ny: false, pz: true, nz: true } ), new THREE.MeshFaceMaterial() );
            mesh.scale.x = -1
            //this.scene_scene.add(mesh);
            this.scene = mesh;
            
        },
        setHotspot: function(hotspot){
            /*
            var mesh = new THREE.Mesh( new THREE.CubeGeometry(100, 100, 100), 
                new THREE.MeshFaceMaterial([
                    new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } ),
                    new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } ),
                    new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } ),
                    new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } ),
                    new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } ),
                    new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } )
                    ]) );
            */
            
            var mesh = new THREE.Mesh( new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial());
            //var mesh = new THREE.Mesh(new THREE.PlaneGeometry( 100, 100), this.loadTexture(hotspot.material));
            utils.extend(mesh.position, hotspot.getPos().getVectorCoord());
            mesh.scale.x = -1
            //mesh.rotation.x = - Math.PI / 2;
            //mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.5;
            //mesh.rotation.x = 90;
            //mesh.rotation.y = Math.PI / 2;
            mesh.rotation.z = Math.PI / 2;
            //mesh.rotation.x = - Math.PI / 2;
            //mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.5;
            this.hotspot_scene.add(mesh);
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
            if(this.scene){
                this.scene_scene.remove(this.scene);
                this.scene = null;
            }
            while(this.hotspots.length > 0){
                this.hotspot_scene.remove(this.hotspots.pop());
            }
        },
        render: function(){
            this.renderer.clear();
            this.renderer.render(this.scene_scene, this.camera);
            this.renderer.render(this.hotspot_scene, this.camera);
        },
        dom: function(){
            return this.renderer.domElement;
        }
    });

    g3.module('backends', {
        'ThreePanoBackend': ThreePanoBackend
    });
})();