
//define方法
define = function(modulename, depth, callback){
    if(typeof depth == 'function') {
        callback = depth;
        depth = [];
    }
    modulename = Module.getPath(modulename);

    //如果没有定义依赖，则从callback里面找依赖关系
    if(!depth.length) {
        callback.toString().replace(/require\(\s*['"](.*)['"]\s*\)/mg, function(_, dep) {
            depth.push(dep);
        });
    }

    new Module(modulename, depth, callback);
};