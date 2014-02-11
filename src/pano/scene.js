(function(){
    var Hotspot = g3.module('pano.Hotspot');
    var Position = g3.module('pano.Position');

    var Scene = g3.extendClass({

    });

    var StaticScene = g3.extendClass(Scene, {
        
    });

    var PanoScene = g3.extendClass(Scene, {
        init: function(materials, pos){
            this.materials = materials;
            this.pos = pos || new Position([0,0]);
            this.hotspots = {};
        },
        setPos: function(pos){
            this.pos = pos;
        },
        getPos: function(){
            return this.pos;
        },
        getLon: function(){
            return this.getPos().getLon();
        },
        getLat: function(){
            return this.getPos().getLat();
        },
        getCoord: function(){
            return this.getPos().getCoord();
        },
        addHotspot: function(name, hotspot){
            this.hotspots[name] = hotspot;
        },
        getHotspot: function(name){
            return this.hotspots[name];
        }
    });


    g3.module('pano',{
        'StaticScene': StaticScene,
        'Scene' : PanoScene
    });

})();