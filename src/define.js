
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

var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;

function findDepsArr(deps, callbackStr) {
    callbackStr.toString().replace(REQUIRE_RE, function(_, _, dep) {
        dep && deps.push(dep);
    });
}