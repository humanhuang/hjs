define('mod/mod1', function(require, exports, module){
	//require('mod/raw1');
	//var tpl = require('mod/test.tpl');
	//var json = require('mod/test.json');
	//var frag = require('mod/frag.html');
	//var script = require('mod/frag.script');
	//require('mod/1.css');
	//var mod2 = require('mod/mod2.js');

	var mod2 = require('mod/mod2');

	console.log('mod/mod1');

	//var data = require('mod/data.json');
	//var tpl = require('mod/tpl.html');


	// for(var i in data) {
	//	 var reg = new RegExp('{' + i + '}', 'gm');
	//	 tpl = tpl.replace(reg, function(_) {
	//			return data[i];
	//	 });
	// }
	//console.log(tpl);

	module.exports = {
		finish: true
		//tpl: tpl,
		//json: json,
		//frag: frag,
		//script: script
		//mod2: require('./mod2')
		//mod2:  require('mod/mod2'),
		//data:require('mod/data/data')
	};

});

//define('mod/mod1', ['mod/mod2', 'mod/data/data'], function(require, exports, module){
//	module.exports = {
//		mod2: require('mod/mod2'),
//		data:require('mod/data/data')
//	};
//});

//define('mod/mod1', ['mod/mod2', 'mod/raw1'], function(require, exports, module){
//	module.exports = {
//		mod2: require('mod/mod2')
//	};
//});

//define('mod/mod2', [], function(require, exports, module){
//	exports.name = 'mod2';
//	exports.desc = 'this is mod2';
//
//	return exports;
//});


