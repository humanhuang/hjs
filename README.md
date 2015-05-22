hjs
---
A very very tiny mobile AMD Loader which has a neat architecture.


### Usage

#### 实现了AMD和CMD规范

#### lookup the Module Status for debug;
```js
    console.log(js.module)
```

```js
// define a module explicit dependences array
define('mod/mod1', ['mod/mod2'], function(require, exports, module){
    var mod2 = require('mod/mod2');
	module.exports = {
		mod2: mod2
	};
});

// define a module anonymous
define(function(require, exports, module){
    var mod1 = require('mod/mod1');
    exports.mod1 = mod1;
});

// define a module implicit dependences array
define('mod/mod1', function(require, exports, module){

    // 支持css
    require('mod/1.css');

    var mod2 = require('mod/mod2');

    // 支持脚本
    var script = require('mod/frag.script');

    // 支持json
    var data = require('mod/data.json');

    // 支持html片段
    var tpl = require('mod/tpl.html');

    var mod2 = require('mod/mod2.js');

	module.exports = {
		mod2: mod2
	};
    /*
    // also It support return statements like module.exports;
    return {
        mod2: mod2
    }
    */
});

// config
hjs.config({
    base:'http://localhost/project_fe/kindteam/hjs/demo/',
    alias: {
        'mod1': 'mod/mod1'
    },
    paths: {
        'aaaa': 'abc/abc/abc'
    },
    map: [
        ['.js', '.js?' + +(new Date())]
    ],
    preload:[
            'mod/mod2'
    ]
});
```

