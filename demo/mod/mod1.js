define('mod/mod1', ['mod/mod2', 'mod/raw1'], function(require, exports, module){
	module.exports = {
		mod2: require('mod/mod2')
	};
});


//define('mod/mod2', [], function(require, exports, module){
//	exports.name = 'mod2';
//	exports.desc = 'this is mod2';
//
//	return exports;
//});


