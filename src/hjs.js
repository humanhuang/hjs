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
    loadedSource: Module.loadedSource,
    //mapSource: Module.mapSource
};


hjs.config = {
    domain: '',
    baseurl: '',
    rules: [],
    charset: 'utf-8',
    deps: {},
    map: {}
};


//hjs.mergeConfig = function(config){
//    var _config = hjs.config;
//
//    each(config, function(c, i){
//        var tmp = _config[i];
//
//        if(i == 'map'){
//            each(c, function(map, name){
//                var yMap = tmp[name];
//
//                if(!yMap){
//                    yMap = map;
//                }else{
//                    each(makeArray(map), function(item){
//                        !inArray(yMap, item) && yMap.push(item);
//                    });
//                }
//
//                tmp[name] = yMap;
//            });
//        }else if(i == 'deps'){
//            each(c, function(dep, name){
//                tmp[name] = dep;
//            });
//        }else if(isArray(c)){
//            tmp.push.apply(tmp, c);
//        }else{
//            tmp = c;
//        }
//
//        _config[i] = tmp;
//    });
//};
