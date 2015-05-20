define(function(require, exports, module) {
	var TimeMeter = require('./time-meter');
	var $ = require('jquery');
	$(function() {
      var t= new TimeMeter({
      	digitColor:"rgb(0,102,153)"
      });
      console.dir(t);
    })
})