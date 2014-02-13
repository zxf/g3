(function(){
    var pano = g3.module('pano');
    var event = g3.module('event');
    
    g3.exports({
        'Event': event.G3Event,
        'pano': {
            'Panorama'       : pano.Panorama,
            'BoxScene'       : pano.BoxScene,
            'ImageHotspot'   : pano.ImageHotspot,
            'Position'       : pano.Position
        }
    });

})();