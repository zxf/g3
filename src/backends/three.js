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
        'three': ThreeBackend
    });
})();