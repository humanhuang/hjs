
/*

a) define(callback); 还没有做

b) define('modname', callback);

c) define('modname', ['mod1', 'mod2'], callback);

 */
define = function(modulename, deps, callback){

    if(typeof deps == 'function') {
        callback = deps;
        deps = [];
    }

    //如果没有定义依赖，则从callback里面找依赖关系
    if(!deps.length) {
        findDepsArr(deps, callback.toString())
    }

    new Module(modulename, deps, callback);
};

function findDepsArr(deps, callbackStr) {
    callbackStr.toString().replace(/require\(\s*['"](.*)['"]\s*\)/mg, function(_, dep) {
        deps.push(dep);
    });
}