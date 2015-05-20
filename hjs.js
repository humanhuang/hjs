/*
 * @Summery: tiny mobile AMD loader
 *
 * @Author: human.hjh<halfthink@163.com>
 * @createdDate: 2014-4-29
 *
 * @issues: https://github.com/humanhuang/hjs/issues
 */
var hjs, define;
(function(window, doc){

function Module(modulename, depArr, callback, use){

    modulename = Module.getPath(modulename);

    if(Module.cache[modulename]){
        console && console.log('module ' + modulename + ' is exists!');
        return;
    }

    var self = this;

    self.modulename = modulename;

    self.callback = callback;

    self.depths = Module.getDeps(depArr, self);

    self.needLoadDepth = self.depths.length;

    //当模块所有依赖以及本身全部加载完后, 所通知的主模块列表
    self.notices = (Module.noticesCache[modulename] || {}).notices || [];

    self.exports = {};

    self.execed = false;

    //是否是页面require
    self.use = use;

    self.init();
};

Module.prototype = {
    init: function(){
        var self = this;

        //当模块类被实例话后表示该模块本身的js已经被成功加载 删除loading表中自身所对应的js
        Module.cache[self.modulename] = self;

        self.needLoadDepth ? self.loadDepths() : self.complete();
    },

    complete: function(){
        var self = this;

        self.status = Module.loadStatus.LOADED;
        //如果是hjs()  则立即执行
        self.use && self.exec();
        self.noticeModule();
    },

    loadDepths: function(){
        var self = this;

        self.status = Module.loadStatus.LOADING_DEPTHS;

        each(self.depths, function(modulename){
            // 加载脚本
            Module.load(modulename, self.modulename);
        });
    },

    //此处当依赖本模块的模块加载完后 会执行
    receiveNotice: function(){
        if(!--this.needLoadDepth) {
            this.complete();
        }
    },

    //当本身加载完后 通知所依赖本模块的模块
    noticeModule: function(notice){
        var self = this;

        //手动通知某个模块
        if(notice){
            //如果该模块自己的依赖还没加载完，将需要通知的模块添加至通知队列
            if(self.status != Module.loadStatus.LOADED){
                return self.notices.push(notice);
            }

            //通知所依赖本模块的模块
            Module.cache[notice].receiveNotice();
        }else{
            //通知所有模块
            each(self.notices, function(item){
                Module.cache[item].receiveNotice();
            });

            self.notices.length = 0;
        }
    },

    // 执行模块， 暴露exports
    exec: function(){
        var self = this;

        if(self.execed) return;

        self.execed = true;

        if(isFunction(self.callback)){
            var exports;

            if(exports = self.callback.call(window, Module.require, self.exports, self)){
                self.exports = exports;
            }
        }
    }
};



Module.loadStatus = {
    LOADING_DEPTHS: 1,   //正在努力加载依赖文件
    LOADED: 2
};

Module.cache = {};          //当模块的js文件加载完后 会存放在此处 不管依赖是否加载完  这里是存放实例module
Module.noticesCache = {};   //缓存每个模块所需要通知被依赖模块的实例
Module.loadingSource = {};
Module.loadedSource = {};

//尝试初始化
Module.init = function(path){
    !Module.cache[path] && new Module(path);
};

//require
Module.require = function(modulename){
    var cache = Module.cache[Module.getPath(modulename)];
    cache.exec();
    return cache.exports;
};

//加载一个模块的js文件, 加载完毕通知notice对象
Module.load = function(path, notice){
    var cache, module;

    if(notice) {
        // 如果该模块已经加载，则直接通知依赖此模块的主模块
        if(cache = Module.cache[path]) return cache.noticeModule(notice);

        //如果该路径没有初始化，即没有new，也就是没有加载完毕，则缓存通知模块
        //如果该模块也被其他模块依赖，就在noticesCache[path].notices.push(依赖此模块的主模块)
        //Module.noticesCache[path] 这个有值，说明已经准备加载了，但是还没有执行。
        if(module = Module.noticesCache[path]) return module.notices.push(notice);

        //如果没有缓存，则创建
        Module.noticesCache[path] = {notices: [notice]};
    }

    //获取该模块的全路径
    var fullPath = Module.getFullPath(path);


    //如果文件没有加载
    if(!Module.loadingSource[fullPath]){
        Module.loadingSource[fullPath] = 1;

        /*
            匹配文件后缀
         demo/demo.html
         demo/demo.html?v=123
         demo/demo.html#aaa
         demo/demo.html?v=123#aaa
         demo/demo.html?v=123.123
         aaa/de.mo/demo.html?v=123.123
         /\.([^?/]+)(?:\?\S+)?$/.exec('aaa/de.mo/demo.html?b=123.123')
        */

        var filePrefix = /\.([^?/]+)(?:\?\S+)?$/.exec(path)[1],
            isCss = /\.css(?:\?\S+)?$/.test(path),
            isLoaded = 0,
            isOldWebKit = +navigator.userAgent.replace(/.*(?:Apple|Android)WebKit\/(\d+).*/, "$1") < 536,
            source,
            supportOnload;


        if(filePrefix == 'js') {
            source = doc.createElement('script');
            source.type = 'text/javascript';
            source.src = fullPath;

        }
        else if(filePrefix == 'css') {

            source = doc.createElement('link');
            source.rel = 'stylesheet';
            source.type = 'text/css';
            source.href = fullPath;
            supportOnload = 'onload' in source;


            if(isCss && (isOldWebKit || !supportOnload)){
                var id = setTimeout(function(){
                    if(source.sheet){
                        clearTimeout(id);
                        return onload();
                    }
                    setTimeout(arguments.callee);
                });
            }

        }
        else {
            xhr(path, function(text) {
                if(filePrefix == 'json') {
                    var jsonObj;
                    try { jsonObj = JSON.parse(text);} catch(e) {jsonObj = text};

                    define(path, [], function(){return jsonObj;});
                }
                else if(filePrefix == 'script') {
                    define(path, [], function(){return glbalEval(text);});
                }
                else  {
                    define(path, [], function(){return text;});
                }
            });
        }

        function glbalEval(text) {
            text && (window.execScript || function(text){
                eval.call(window, text);
            })(text);
        }

        function xhr(url, callback) {
            var r = window.XMLHttpRequest ?
                new XMLHttpRequest() :
                new ActiveXObject("Microsoft.XMLHTTP");

            r.open("GET", url, true)

            r.onreadystatechange = function() {
                if (r.readyState === 4) {
                    // Support local file
                    if (r.status > 399 && r.status < 600) {
                        throw new Error("Could not load: " + url + ", status = " + r.status)
                    }
                    else {
                        callback(r.responseText)
                    }
                }
            };

            return r.send(null);
        }

        if(filePrefix == 'js' || filePrefix == 'css') {
            source.onload = source.onerror = source.onreadystatechange = onload;
            source.charset = hjs.config().charset;
            doc.getElementsByTagName('head')[0].appendChild(source);
        }

        function onload(){
            // 先执行代码的define, 再执行onload回调
            // 这边放置css中存在@import  import后会多次触发onload事件
            if(isLoaded) return;

            if(!source.readyState || /loaded|complete/.test(source.readyState)){
                source.onload = source.onerror = source.onreadystatechange = null;

                Module.loadedSource[fullPath] = isLoaded = 1;

                // 处理raw.js, css. 或者combo的情况
                Module.loaded(path);
            }
        }

    }
    else if(Module.loadedSource[fullPath]){
        //如果加载完毕，尝试初始化。
        Module.init(path);
    }
};

// a) 为了兼容加载没有define头的js文件
// b) 兼容多个文件combo的情况 @todo
Module.loaded = function(path){
    if(Module.cache[path]) {
        return ;
    }
    Module.init(path);
};

//获取列表依赖
Module.getDeps = function(deps, self){
    var d = [];

    each(makeArray(deps), function(dep){
        dep = Module.getPath(dep, self);
        d.push(dep);
    });

    return d;
};

//获取模块路径
/*
    mod/mod1
    mod/mod1.js
    ./mod/mod1.js
    /mod/mod1.js
    mod/aa.ff/mod1.js?aa=123.jpg
 */
Module.getPath = function(path, self){
    var  lastIndex = path.length - 1,
        config = hjs.config();


    //alias
    if(config.alias[path]) {
        path = config.alias[path];
    }

    //paths
    if(config.paths[path]) {
        path = config.paths[path];
    }


    // ./mod1.js
    // moduleName: mod/mod1.js,    mod1.js,   ./mod1.js
    //
    //if(path.substr(0,2) == './') {
    //    //
    //    if(self) {
    //        var matches = /(\S+)\/(?=[^/]+$)/g.exec(self.modulename);
    //        if(matches) {
    //            path = matches[1] +  path.substr(1);
    //        }
    //    }
    //}

    var matches = /\.([^?/]+)(?:\?\S+)?$/.exec(path);

    if( !matches) {
        path = path + '.js';
    }

    return path;
};

var re_dot = /\/\.\//g,
    re_double_dot = /\/[^/]+\/\.\.\//g,
    re_double_slash = /[^:/]\/{2}/g;

//获取全路径
Module.getFullPath = function(path){
    var config = hjs.config(),
        base = config.base;

    if(base) {
        if(base.substr(base.length - 1) !== '/') {
            base += '/'
        }
        path = base + path;
    }

    // 相对路径

    // /a/b/./c/./d ==> /a/b/c/d
    path = path.replace(re_dot, '/');

    // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
    path = path.replace(re_double_dot, '/');

    // a//b/c  ==>  a/b/c
    path = path.replace(re_double_slash, '/');


    //config.map
    each(config.map, function(v) {
        path = path.replace(v[0], v[1]);
    });

    return path
};


var hjsid = 0;
function sid() {
    return hjsid++;
}
hjs = function(paths, callback){

    if(Module.cache[paths]) {
        return Module.cache[paths].exports;
    }

    new Module('_r_' + sid(), paths, function(){
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

        if(isArray(v)) {
            each(v, function(v_v, k_k) {
                _config[k].push(v_v);

                if(k === 'preload') {
                    Module.load(Module.getPath(v_v));
                }
            });
        }
        else if(typeof v === 'object'){
            each(v, function(v_v, k_k) {
                _config[k][k_k] = v_v;
            });
        }
        else {
            _config[k] = v;
        }

    });

};


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

function isArray(array){
    return Object.prototype.toString.call(array) == '[object Array]';
}

function makeArray(array){
    return array ? isArray(array) ? array : [array] : [];
}

function each(obj, callback){
    if(isArray(obj)){
        for(var i = 0; i < obj.length; i++)
            callback(obj[i], i);
    }else{
        for(var i in obj)
            callback(obj[i], i);
    }
}

function inArray(array, item){
    array = makeArray(array);

    if(array.indexOf){
        return array.indexOf(item) > -1;
    }else{
        for( var i = 0; i < array.length; i++){
            if(array[i] == item) return true;
        }

        return false;
    }
}

function isFunction(callback){
    return typeof callback == 'function';
}

})(window, document);