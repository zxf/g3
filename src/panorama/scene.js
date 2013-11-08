(function(){
    var Hotspot = g3.module('panorama.hotspot');

    var Scene = g3.extendClass({

    });

    var StaticScene = g3.extendClass(Scene, {
        
    });

    var PanoScene = g3.extendClass(Scene, {
        init: function(materials){
            this.materials = materials;
            this.lon = 0;
            this.lat = 0;
            this.hotspots = {};
        },
        setPos: function(lon, lat){
            this.lon = lon;
            this.lat = lat;
        },
        getLon: function(){
            return this.lon;
        },
        getLat: function(){
            return this.lat;
        },
        addHotspot: function(name, pos){
            this.hotspots[name] = new Hotspot(pos[0], pos[1]);
        },
        getHotspot: function(name){
            return this.hotspots[name];
        }
    });


    g3.module('panorama',{
        'scene': {
            'static' : StaticScene,
            'panorama' : PanoScene
        }
    });

})();