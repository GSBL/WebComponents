define(function(require, exports, module) {
	var TimeMeter = require('./time-meter');
	var $ = require('jquery');
	$(function() {
      new TimeMeter({
      	digitColor:"rgb(0,102,153)"
      });
    })
})