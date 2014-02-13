(function(){
    var Hotspot = g3.extendClass({
        init: function(pos){
            this.pos = pos;
        }
    });

    var ImageHotspot = g3.extendClass(Hotspot, {
        init: function(material, width, height, pos){
            this.material = material;
            this.width = width;
            this.height = height;
            this.pos = pos;
        },
        getPos: function(){
            return this.pos;
        }
    });

    g3.module('pano',{
        'ImageHotspot': ImageHotspot
    });

})();