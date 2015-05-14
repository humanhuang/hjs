
Module.loadStatus = {
    LOADING_DEPTHS: 1,   //正在努力加载依赖文件
    LOADED: 2
};

Module.cache = {};          //当模块的js文件加载完后 会存放在此处 不管依赖是否加载完  这里是存放实例module
Module.noticesCache = {};   //缓存每个模块所需要通知被依赖模块的实例
Module.loadingSource = {};
Module.loadedSource = {};
//Module.mapSource = {};

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
    //if(!(map = Module.mapSource[_path])){
    //    map = Module.mapSource[_path] = [];
    //}

    //将该模块放置map中，等待之后的通知
    //map.push(path);

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
            // 先执行代码的define, 再执行onload回调
            // 这边放置css中存在@import  import后会多次触发onload事件
            if(isLoaded) return;

            if(!source.readyState || /loaded|complete/.test(source.readyState)){
                source.onload = source.onerror = source.onreadystatechange = null;

                Module.loadedSource[_path] = isLoaded = 1;

                // 处理raw.js, 或者combo的情况
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

// a) 为了兼容加载没有define头的js文件
// b) 兼容多个文件combo的情况 @todo
Module.loaded = function(path){
    if(Module.cache[path]) {
        return ;
    }
    Module.init(path);
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

