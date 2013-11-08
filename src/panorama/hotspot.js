(function(){
    var Hotspot = g3.extendClass({
        init: function(lon, lat){
            this.lon = lon;
            this.lat = lat;
        },
        getLon: function(){
            return this.lon;
        },
        getLat: function(){
            return this.lat;
        }
    });

    g3.module('panorama',{
        'hotspot': Hotspot
    });

})();