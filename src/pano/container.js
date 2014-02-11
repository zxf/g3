(function(){
    var Container = g3.extendClass({
        init: function(width, height, top, left){
            this.width = width;
            this.left = left;
            this.top = top;
            this.left = left;
        }
    });

    g3.module('pano',{
        'Container': Container
    });

})();