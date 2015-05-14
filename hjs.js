/*
 * @Summery: tiny mobile AMD loader
 *
 * @Author: human.hjh<halfthink@163.com>
 * @createdDate: 2014-4-29
 *
 * @issues: https://github.com/humanhuang/hjs/issues
 */
var hjs, define;
(function(window, document){


//判断是否为数组
function isArray(array){
    return Object.prototype.toString.call(array) == '[object Array]';
}

//转换数组
function makeArray(array){
    return array ? isArray(array) ? array : [array] : [];
}

//简单迭代数组
function each(obj, callback){
    if(isArray(obj)){
        for(var i = 0; i < obj.length; i++)
            callback(obj[i], i);
    }else{
        for(var i in obj)
            callback(obj[i], i);
    }
}

//查找元素是否在数组中
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

//是否函数
function isFunction(callback){
    return typeof callback == 'function';
}
var Module = function(modulename, depArr, callback, use){
    if(Module.cache[modulename]){
        console && console.log('module ' + modulename + ' is exists!');
        return;
    }

    var self = this;

    self.modulename = modulename;

    self.callback = callback;

    self.depths = Module.getDeps(depArr);

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
Module.mapSource = {};

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

    // 如果该模块已经加载，则直接通知依赖此模块的主模块
    if(cache = Module.cache[path]) return cache.noticeModule(notice);

    //如果该路径没有初始化，即没有new，也就是没有加载完毕，则缓存通知模块
    //如果该模块也被其他模块依赖，就在noticesCache[path].notices.push(依赖此模块的主模块)
    if(module = Module.noticesCache[path]) return module.notices.push(notice);

    //如果没有缓存，则创建
    Module.noticesCache[path] = {notices: [notice]};

    //获取该模块的全路径
    var _path = Module.getFullPath(path), map;

    //模块有可能被合并至一个大文件中，即一个文件中可能包含多个模块，或者非模块。
    if(!(map = Module.mapSource[_path])){
        map = Module.mapSource[_path] = [];
    }

    //将该模块放置map中，等待之后的通知
    map.push(path);

    //如果文件没有加载
    if(!Module.loadingSource[_path]){
        Module.loadingSource[_path] = 1;

        var
            isCss = /\.css$/.test(path),
            isLoaded = 0,
            isOldWebKit = +navigator.userAgent.replace(/.*(?:Apple|Android)WebKit\/(\d+).*/, "$1") < 536,
            source = document.createElement(isCss ? 'link' : 'script'),
            supportOnload = 'onload' in source;

        //支持css加载
        if(isCss){
            source.rel = 'stylesheet';
            source.type = 'text/css';
            source.href = _path;
        }else{
            source.type = 'text/javascript';
            source.src = _path;
        }

        function onload(){
            //这边放置css中存在@import  import后会多次触发onload事件
            if(isLoaded) return;

            if(!source.readyState || /loaded|complete/.test(source.readyState)){
                source.onload = source.onerror = source.onreadystatechange = null;
                //已加载
                Module.loadedSource[_path] = isLoaded = 1;
                //手动触发已加载方法，防止文件是非模块，hjs.async之类，导致无法通知依赖模块执行，也有可能是多个文件合并，需要挨个通知
                Module.loaded(_path);
            }
        }

        source.onload = source.onerror = source.onreadystatechange = onload;
        source.charset = hjs.config.charset;
        document.getElementsByTagName('head')[0].appendChild(source);

        //有些老版本浏览器不支持对css的onload事件，需检查css的sheet属性是否存在，如果加载完后，此属性会出现
        if(isCss && (isOldWebKit || !supportOnload)){
            var id = setTimeout(function(){
                if(source.sheet){
                    clearTimeout(id);
                    return onload();
                }

                setTimeout(arguments.callee);
            });
        }
    }else if(Module.loadedSource[_path]){
        //如果加载完毕，尝试初始化。
        Module.init(path);
    }
};

//此方法，用于兼容多个文件合并，或者非模块文件的加载，非模块文件不会define而导致的无法通知依赖模块的情况
Module.loaded = function(path){
    var map = Module.mapSource[path];

    each(map, function(p){
        Module.init(p);
    });

    map.length = 0;
};

//获取列表依赖
Module.getDeps = function(deps){
    var d = [];

    each(makeArray(deps), function(dep){
        dep = Module.getPath(dep);
        d.push(dep);
        d.push.apply(d, Module.getDeps(hjs.config.deps[dep]));
    });

    return d;
};

//获取模块路径
Module.getPath = function(path){
    //if(/:\/\//.test(path)) return path;
    //
    //var config = require.config, baseurl = config.baseurl || '';
    //
    //each(config.rules || [], function(item){
    //    path = path.replace(item[0], item[1]);
    //});
    //
    //if(baseurl && path.charAt(0) != '/') path = baseurl.replace(/\/+$/, '') + '/' + path;

    //return path.replace(/\/+/g, '/');

    path += '.js';
    return path;
};

//获取全路径
Module.getFullPath = function(path){
    //var config = hjs.config, map = config.map || {}, domain = config.domain || '';
    //
    //for(var i in map){
    //    if(map.hasOwnProperty(i) && inArray(map[i], path)){
    //        path = i; break;
    //    }
    //}
    //
    //return !/:\/\//.test(path) ? domain + path : path;

    return path
};


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
    mapSource: Module.mapSource
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


//define方法
define = function(modulename, depth, callback){
    modulename = Module.getPath(modulename);
    depth = depth || require.config.deps[modulename];

    new Module(modulename, depth, callback);
};

})(window, document);