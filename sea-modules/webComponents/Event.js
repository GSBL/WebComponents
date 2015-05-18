define(function(require, exports, module) {
	var Class = require("./Class");
	// 实现一个事件监听机制
	var Event = Class.extend({
		// 用于存储所有处理函数
		_handlers: {},
		// 添加监听，形参为事件类型和处理函数
		on: function(type, handler) {
			this._handlers[type] = this._handlers[type] || [];
			this._handlers[type].push(handler); // 允许出现同名处理函数
			return this;
		},
		// 触发事件，形参为事件对象，event.type必须为事件类型，其他属性随意
		fire: function(event) {
			event.target = event.target || this;
			if (_isArray(this._handlers[event.type])) {
				var handlers = this._handlers[event.type];
				for (var i = 0, len = handlers.length; i < len; i++) {
					handlers[i].call(this, event);
				}
			}
			return this;
		},
		// 取消监听
		off: function(type, handler) {
			// 若只传一个参数，则删除该类型下的所有处理函数
			if (type && !handler) {
				delete this._handlers[type];
			}
			if (_isArray(this._handlers[type])) {
				var handlers = this._handlers[type];
				for (var i = 0, len = handlers.length; i < len; i++) {
					if (handlers[i] === handler) {
						break;
					}
				}
				handlers.splice(i, 1);
			}
			return this;
		}
	});
	//辅助函数，判断是否为数组类型

	function _isArray(arr) {
		return {}.toString.call(arr) === "[object Array]";
	}
	module.exports = Event;
})