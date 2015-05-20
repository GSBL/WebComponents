define(function(require, exports, module) {
	var Event = require("./Event");
	var $ = require("jquery");
	var Class = require("./Class");
	
	// 混入事件监听模块
	var Base = Class.extend(Event);
	Base = Base.extend({
		// 用于存放注册事件
		events: "",
		// 模板内容
		template: "",
		// init用于初始化属性
		init: function(options) {
			this._options = options;
			this._delegateEvent();
			this.setUp();
		},
		// get用于获取配置项
		get: function(key) {
			return this._options[key];
		},
		// set用于设置配置项
		set: function(key, value) {
			this._options[key] = value;
		},
		// 遍历events属性，使用jquery的delegate代理到parentNode
		_delegateEvent: function() {
			var self = this;
			var events = this.events || {};
			var parentNode = this.get("parentNode") || $(document.body);
			var eventObj, selector, fn, type;
			for (selector in events) {
				eventObj = events[selector];
				for (type in eventObj) {
					fn = eventObj[type];
					parentNode.delegate(selector, type, function(e) {
						fn.call(null, self, e);
					});
				}
			}

		},
		//支持underscore的极简模板语法
		_parseTemplate: function(str, data) {
			/**
			 * http://ejohn.org/blog/javascript-micro-templating/
			 * https://github.com/jashkenas/underscore/blob/0.1.0/underscore.js#L399
			 */
			var fn = new Function('obj',
				'var p=[],print=function(){p.push.apply(p,arguments);};' +
				'with(obj){p.push(\'' + str
				.replace(/[\r\t\n]/g, " ")
				.split("<%").join("\t")
				.replace(/((^|%>)[^\t]*)'/g, "$1\r")
				.replace(/\t=(.*?)%>/g, "',$1,'")
				.split("\t").join("');")
				.split("%>").join("p.push('")
				.split("\r").join("\\'") +
				"');}return p.join('');")
			return data ? fn(data) : fn
		},
		//提供给子类覆盖实现
		setUp: function() {
			this.render();
		},
		// 用于自动刷新模板
		setChunkData: function(chunkData) {
			var self = this;
			var data = self.get("_renderdata");
			// 更新data
			for( var key in chunkData){
				if(chunkData.hasOwnProperty(key)){
					data[key]=chunkData[key];
				}
			}
			if (!self.template) return;
			// 重新渲染
			var newNode = $(self._parseTemplate(self.template, data));
			// 获取存储的渲染后的节点
			var curNode = self.get("_curNode");
			if (!curNode) return;
			// 替换内容
			curNode.replaceWith(newNode);
			self.set("_curNode", curNode);
		},
		// 渲染模板并将其添加到parentNode下
		render: function(data) {
			var self = this;
			var parentNode = self.get("parentNode") || $(document.body);
			// 如果传入data则渲染摸板
			if(data){
				// 把渲染的data储存起来，方便后面setChunkdata调用
				self.set("_renderdata", data);
				if (!self.template) return;
				// 使用_parseTemplate解析渲染摸板生成html
				var curNode = $(self._parseTemplate(self.template, data));
				// 储存起来方便后面setChunkdata调用
				self.set("_curNode", curNode);
				parentNode.append(curNode);
			//  如果没有参数，则直接把模板添加到parentNode下面
			}else{
				curNode = $(self.template);
				parentNode.append(curNode);
			}
		},
		// 定义销毁的函数
		destroy: function() {
			var self = this;
			// 删除渲染好的dom节点
			self.get("_curNode").remove();
			// 解绑事件代理
			var events = self.events || {};
			var eventObj, fn, selector, type;
			var parentNode = self.get("parentNode") || $(document.body);
			for (selector in events) {
				eventObj = events[selector];
				for (type in eventObj) {
					fn = eventObj[type];
					parentNode.undelegate(selector, type, fn);
				}
			}

		}
	});
	module.exports = Base;
})