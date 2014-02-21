(function(){
    var utils = g3.module('utils');

    var Space = g3.extendClass(utils.WidgetObject, {
        /*
        * options:
        */
        default_options: {
            width                  :0,
            height                 :0,
            container              :'',
            draggable              :true,
            enableScrollWheelZoom  :true,
            maxZoom                :5
        },
        init: function(options){
            this.super('init', [options]);
        }
    });

    g3.module('astro',{
        'Space': Space
    });

})();