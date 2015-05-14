
//define方法
define = function(modulename, depth, callback){
    modulename = Module.getPath(modulename);
    depth = depth || require.config.deps[modulename];

    new Module(modulename, depth, callback);
};