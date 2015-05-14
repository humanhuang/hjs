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

// define a module
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
	/*
});
```

