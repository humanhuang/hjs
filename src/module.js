function Module(modulename, depArr, callback, use){

    modulename = Module.getPath(modulename);

    if(Module.cache[modulename]){
        console && console.log('module ' + modulename + ' is exists!');
        return;
    }

    // 匿名模块执行 onload 回调
    if(depArr == undefined) {
        callback = Module.anonymousCallback;
        depArr = Module.anonymouseDeps;
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

