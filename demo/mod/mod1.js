define('mod/mod1', ['mod/mod2'], function(require, exports, module){

	module.exports = {
		mod2: require('mod/mod2')
	};
});