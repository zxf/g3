(function(){
    var Hotspot = g3.module('pano.Hotspot');
    var Position = g3.module('pano.Position');

    var Scene = g3.extendClass({

    });

    var PanoScene = g3.extendClass(Scene, {
        init: function(materials, pos){
            this.materials = materials;
            this.pos = pos || new Position([0,0]);
        },
        getPos: function(){
            return this.pos;
        },
        setPos: function(pos){
            this.pos = pos;
        }
    });


    g3.module('pano',{
        'Scene' : PanoScene
    });

})();