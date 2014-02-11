(function(){
    var Hotspot = g3.extendClass({
        init: function(pos){
            this.pos = pos;
        }
    });

    g3.module('pano',{
        'Hotspot': Hotspot
    });

})();