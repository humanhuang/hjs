hjs
---
A very very tiny mobile AMD Loader which has a neat architecture.


### Usage
```js
// require
hjs(['mod/mod1', 'mod/mod2'], function(mod1, mod2) {
    console.log(mod1, mod2);
});

// lookup the Loading/Loaded Modules for debug;
hjs.module

// define a module with dependences array
define('mod/mod1', ['mod/mod2'], function(require, exports, module){

    var mod2 = require('mod/mod2');

	module.exports = {
		mod2: mod2
	};
	/*
		also It support return statements;
		return {
			mod2: mod2
		}
	*/
});

// define a module without dependences array
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
});


// config
hjs.config({
    base:'http://a.com/project_fe/kindteam/hjs/demo/',
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

