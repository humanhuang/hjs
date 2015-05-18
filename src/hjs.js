var hjsid = 0;

hjs = function(paths, callback){

    if(Module.cache[paths]) {
        return Module.cache[paths].exports;
    }

    new Module('_r_' + hjsid++, paths, function(){
        var depthmodules = [];

        each(makeArray(paths), function(path){
            depthmodules.push(Module.require(path));
        });

        isFunction(callback) && callback.apply(window, depthmodules);
    },  true);
};

hjs.version = '1.0.0';


hjs.module = {
    cache: Module.cache,
    noticesCache: Module.noticesCache,
    loadingSource: Module.loadingSource,
    loadedSource: Module.loadedSource
};

var _config = {
    base: '',
    alias: {

    },
    paths: {

    },
    map: [

    ],
    preload: [

    ],
    debug: true,
    charset: 'utf-8'
};

hjs.config = function(config) {

    if(!config) return _config;

    each(config, function(v, k) {
        _config[k] = config[k];
    });

};
