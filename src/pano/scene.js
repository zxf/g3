(function(){
    var Position = g3.module('pano.Position');

    var Scene = g3.extendClass({
        init: function(materials, pos){
            this.materials = materials;
            this.pos = pos || new Position([0,0]);
            this.hotspots = {};
        },
        getPos: function(){
            return this.pos;
        },
        setPos: function(pos){
            this.pos = pos;
        },
        addHotspot: function(name, hotspot){
            this.hotspots[name] = hotspot;
        }
    });

    var BoxScene = g3.extendClass(Scene, {

    });


    g3.module('pano',{
        'Scene' : Scene,
        'BoxScene': BoxScene
    });

})();