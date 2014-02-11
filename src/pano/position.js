(function(){
    var utils = g3.module('utils');
    var Position = g3.extendClass({
        init: function(pos){
            this.lon = pos[0];
            this.lat = pos[1];
        },
        getLon: function(){
            return this.lon;
        },
        getLat: function(){
            return this.lat;
        },
        getCoord: function(){
            var lon = this.lon;
            var lat = this.lat;
            lat = Math.max(-85, Math.min(85, lat));
            var phi = utils.degToRad(90 - lat);
            var theta = utils.degToRad(lon);

            var x = 500 * Math.sin(phi) * Math.cos(theta);
            var y = 500 * Math.cos(phi);
            var z = 500 * Math.sin(phi) * Math.sin(theta);
            return {
                x:x,
                y:y,
                z:z
            };
        }
    });

    g3.module('pano',{
        'Position': Position
    });

})();