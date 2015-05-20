/**
 * 日期选择器
 * @author rgb
 * @todo 时间选择器
 */
var DateTimePicker = (function() {

	// 基础类模块 开始

	// Class模块用于模仿类式继承，借鉴aralejs的Class
	// https://github.com/aralejs/class/blob/master/class.js
	/**
	 * Class构造函数
	 */

	function Class(o) {
		// 如果this不是Class实例对象，改造成Class对象
		if (!(this instanceof Class) && isFunction(o)) {
			return classify(o);
		}
	}

	/**
	 * 用于创建一个类，
	 * 第一个参数可选，可以直接创建时就指定继承的父类。
	 * 第二个参数也可选，用来表明需要混入的类属性。有三个特殊的属性为Extends,Implements,Statics.分别代表要继承的父类，需要混入原型的东西，还有静态属性。
	 */
	Class.create = function(parent, properties) {

		// 创建一个类时可以不指定要继承的父类。直接传入属性对象
		if (!isFunction(parent)) {
			properties = parent;
			parent = null;
		}

		properties || (properties = {});

		// 没有指定父类的话 就查看有没有Extends特殊属性，都没有的话就用Class作为父类
		parent || (parent = properties.Extends || Class);
		properties.Extends = parent;

		// 子类构造函数的定义

		function SubClass() {

			// 自动调用父类的构造函数
			parent.apply(this, arguments);

			// 真正的构造函数放在init里面
			if (this.constructor === SubClass && this.init) {
				this.init.apply(this, arguments);
			}
		}

		if (parent !== Class) {

			// 将父类里面的属性都混入到子类里面这边主要是静态属性
			mix(SubClass, parent, parent.StaticsWhiteList);
		}

		// 调用implement将自定义的属性混入到子类原型里面。遇到特殊值会单独处理，真正的继承也是发生在这里面
		implement.call(SubClass, properties);

		// 给生成的子类增加extend和implement方法，可以在类定义完后，再去继承，去混入其他属性
		return classify(SubClass);
	}

	// 用于在类定义之后，往类里面添加方法。提供了之后修改类的可能

	function implement(properties) {
		var key, value;

		for (key in properties) {
			value = properties[key];

			// 发现属性是特殊的值时，调用对应的处理函数处理
			if (Class.Mutators.hasOwnProperty(key)) {
				Class.Mutators[key].call(this, value);
			} else {
				this.prototype[key] = value;
			}
		}
	}


	// 基于Class创建一个sub Class
	Class.extend = function(properties) {
		properties || (properties = {});
		properties.Extends = this;

		// 调用Class.create实现继承的流程
		return Class.create(properties);
	}

	// 给一个普通的函数 增加extend和implement方法。

	function classify(cls) {
		cls.extend = Class.extend;
		cls.implement = implement;
		return cls;
	}

	// 特殊属性处理方法
	Class.Mutators = {

		// 这个定义了继承的真正操作代码。
		'Extends': function(parent) {
			var existed = this.prototype;

			// 生成一个中介原型
			var proto = createProto(parent.prototype)

			// 将子类原型有的方法混入到新的中介原型上
			mix(proto, existed);
			proto.constructor = this;
			this.prototype = proto;

			//为子类增加superclass属性，这样可以调用父类原型的方法。
			this.superclass = parent.prototype;
		},
		// 将其他类的属性混入到子类原型上
		'Implements': function(items) {
			isArray(items) || (items = [items])
			var proto = this.prototype,
				item;

			while (item = items.shift()) {
				mix(proto, item.prototype || item);
			}
		},
		// 传入静态属性
		'Statics': function(staticProperties) {
			mix(this, staticProperties);
		}
	}

	function Ctor() {}

	// 使用一个中介者来处理原型的问题，当浏览器支持`__proto__`时可以直接使用。否则新建一个空函数再将父类的原型赋值给这个空函数，返回这个空函数的实例
	var createProto = Object.__proto__ ?
			function(proto) {
				return {
					__proto__: proto
				};
		} :
			function(proto) {
				Ctor.prototype = proto;
				return new Ctor();
		}

		// 下面是些辅助方法

		// 混合属性

		function mix(r, s, wl) {
			for (var p in s) {

				//过滤掉原型链上面的属性
				if (s.hasOwnProperty(p)) {
					if (wl && indexOf(wl, p) === -1) continue;

					// 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
					if (p !== 'prototype') {
						r[p] = s[p];
					}
				}
			}
		}


	var toString = Object.prototype.toString

	var isArray = Array.isArray || function(val) {
			return toString.call(val) === '[object Array]'
		}

	var isFunction = function(val) {
		return toString.call(val) === '[object Function]'
	}

	var indexOf = Array.prototype.indexOf ?
			function(arr, item) {
				return arr.indexOf(item)
		} :
			function(arr, item) {
				for (var i = 0, len = arr.length; i < len; i++) {
					if (arr[i] === item) {
						return i
					}
				}
				return -1
		}
		//基础类模块 结束

		// 自定义事件模块 开始
	var Event = {
		/**
		 * 用于存储所有处理函数
		 */
		_handlers: {},
		/**
		 * 添加监听
		 */
		on: function(type, handler) {
			this._handlers[type] = this._handlers[type] || [];
			this._handlers[type].push(handler); // 允许出现同名处理函数
			return this;
		},
		/**
		 * 触发事件，形参为事件对象，event.type必须为事件类型，其他属性随意
		 */
		fire: function(event) {
			event.target = event.target || this;
			if (isArray(this._handlers[event.type])) {
				var handlers = this._handlers[event.type];
				for (var i = 0, len = handlers.length; i < len; i++) {
					handlers[i].call(this, event);
				}
			}
			return this;
		},
		/**
		 * 取消监听
		 */
		off: function(type, handler) {
			// 若只传一个参数，则删除该类型下的所有处理函数
			if (type && !handler) {
				delete this._handlers[type];
			}
			if (isArray(this._handlers[type])) {
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
	};
	// 自定义事件模块 结束

	// 组件base模块 开始

	// 继承自定义事件模块
	var Base = Class.extend(Event);

	Base = Base.extend({
		/**
		 * 存放自动注册事件
		 */
		events: {},
		/**
		 * 模板内容
		 */
		template: "",
		/**
		 * init用于初始化属性
		 */
		init: function(options) {
			this._options = options ||{};
			// 将events中的事件代理到parentNode
			this._delegateEvent();

			// 真正的初始化
			this.setUp();
		},
		/**
		 * 获取配置项
		 */
		get: function(key) {
			return this._options[key];
		},
		/**
		 * 设置配置项
		 */
		set: function(key, value) {
			this._options[key] = value;
		},
		/**
		 * 遍历events属性，使用jquery的delegate代理到parentNode
		 */
		_delegateEvent: function() {
			var self = this;

			var events = this.events || {},
				parentNode = this.get("parentNode") || $(document.body),
				eventObj, selector, fn, type;

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
		/**
		 * 支持underscore的极简模板语法
		 */
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
				"');}return p.join('');");

			return data ? fn(data) : fn;
		},
		/**
		 * 提供给子类覆盖实现
		 */
		setUp: function() {
			this.render();
		},
		/**
		 * 自动刷新模板
		 */
		setChunkData: function(chunkData) {
			var self = this;

			var data = self.get("_renderdata");

			// 更新data
			for (var key in chunkData) {
				if (chunkData.hasOwnProperty(key)) {
					data[key] = chunkData[key];
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
		/**
		 * 渲染模板并将其添加到parentNode下
		 */
		render: function(data) {
			var self = this;

			var parentNode = self.get("parentNode") || $(document.body);

			// 如果传入data则渲染摸板
			if (data) {

				// 把渲染的data储存起来，方便后面setChunkdata调用
				self.set("_renderdata", data);

				if (!self.template) return;

				// 使用_parseTemplate解析渲染摸板生成html
				var curNode = $(self._parseTemplate(self.template, data));

				// 储存起来方便后面setChunkdata调用
				self.set("_curNode", curNode);
				parentNode.append(curNode);

				//  如果没有参数，则直接把模板添加到parentNode下面
			} else {
				curNode = $(self.template);
				parentNode.append(curNode);
			}
		},
		/**
		 * 定义销毁的函数
		 */
		destroy: function() {
			var self = this;

			// 删除渲染好的dom节点
			self.get("_curNode").remove();

			// 解绑事件代理
			var events = self.events || {},
				eventObj, fn, selector, type,
				parentNode = self.get("parentNode") || $(document.body);

			for (selector in events) {
				eventObj = events[selector];
				for (type in eventObj) {
					fn = eventObj[type];
					parentNode.undelegate(selector, type, fn);
				}
			}
		}
	});
	// 组件base模块 结束

	// 时间处理模块 开始
	var Moment = {
		/**
		 * 变更日期，dateType表示变更类型，0表示变换天数，1表示月份，2表示年份，默认为0
		 * num表示变更数目，负数表示在date基础上向前变更
		 */
		changeDate: function(date, num, dateType) {
			if (!date) {
				return;
			}

			num = num || 0;
			dateType = dateType || 0;
			switch (dateType) {
				case 0:
					return new Date(date.getFullYear(), date.getMonth(), date.getDate() + num);
					break;
				case 1:
					return new Date(date.getFullYear(), date.getMonth() + num, date.getDate());
					break;
				case 2:
					return new Date(date.getFullYear() + num, date.getMonth(), date.getDate());
					break;
			}
		},
		/**
		 * 按月变更时间
		 */
		changeDateByMonth: function(date, num) {
			return this.changeDate(date, num, 1);
		},
		/**
		 * 按天变更时间
		 */
		changeDateByDay: function(date, num) {
			return this.changeDate(date, num, 0);
		},
		/**
		 * 获取一个月有多少天
		 */
		getMonthAllDays: function(date) {
			var self = this;

			var month = date.getMonth(),
				year = date.getFullYear();

			switch (month) {
				case 0:
				case 2:
				case 4:
				case 6:
				case 7:
				case 9:
				case 11:
					return 31;
					break;
				case 3:
				case 5:
				case 8:
				case 10:
					return 30;
					break;
				case 1:
					return self.isLeapYear(year) ? 29 : 28;
			}
		},
		/**
		 * 判断是否为润年
		 */
		isLeapYear: function(year) {
			return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
		},
		/**
		 * 格式化日期
		 */
		formatDate: function(date, fmt) {
			fmt = fmt || "YYYY-MM-DD";

			var o = {
				"M+": date.getMonth() + 1,
				"D+": date.getDate()
			};

			if (/(Y+)/i.test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").slice(-RegExp.$1.length));
			}

			for (var k in o) {
				if (new RegExp("(" + k + ")", "i").test(fmt)) {
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
				}
			}

			return fmt;
		},
		/**
		 * 将已经格式化的时间字符串转化为时间格式
		 */
		unformatDate: function(str, fmt) {
			if (!str) {
				return;
			}
			fmt = fmt || "YYYY-MM-DD";
			var year = str.substr(/(Y+)/i.exec(fmt).index, RegExp.$1.length) || new Date().getFullYear(),
				month = str.substr(/(M+)/i.exec(fmt).index, RegExp.$1.length) || new Date().getMonth(),
				date = str.substr(/(D+)/i.exec(fmt).index, RegExp.$1.length) || new Date().getDate();
			return new Date(year, month - 1, date);
		}
	};
	// 时间处理模块 结束

	//日期组件模块 开始

	// 继承Moment模块
	var DateTimePicker = Base.extend(Moment);

	DateTimePicker = DateTimePicker.extend({
		_options: {
				value: new Date(),
				start: null,
				formatDate: 'YYYY-MM-DD',
				yearStart: 1919,
				yearEnd: 2049
		},
		init:function (options) {
			for(var key in options){
				if(options.hasOwnProperty(key)){
					this._options[key] = options[key];
				}
			}
			this.setUp();
		},
		// events:{
		// 	".icon-h":{
		// 		click: function (self,e) {
		// 			self.updatePanel(new Date());
		// 		}
		// 	},
		// 	".icon-l":{
		// 		click: function (self,e) {
		// 			var curShowDate = self.curShowDate;
		// 			var changedDate = self.changeDate(curShowDate,1,-1,1);
		// 			self.updatePanel(changedDate);
		// 		}
		// 	},
		// 	".icon-r":{
		// 		click: function (self,e) {
		// 			var curShowDate = self.curShowDate;
		// 			var changedDate = self.changeDate(curShowDate,1,1,1);
		// 			self.updatePanel(changedDate);
		// 		}
		// 	}
		// },
		/**
		 * 组件模板
		 */
		template: '<div class="rgb-dtp " style="display:none;"><div class="dtp-date"><div class="date-header"><a title="上个月" class="icon icon-l">l</a><a class="icon icon-h" title="今天">h</a><select class="header-year"></select><select class="header-month"></select><a class="icon icon-r">r</a></div><div class="data-calendar"><table><thead><tr><th>周日</th><th>周一</th><th>周二</th><th>周三</th><th>周四</th><th>周五</th><th>周六</th></tr></thead><tbody></tbody></table></div></div></div>',
		/**
		 * 真正的初始化操作
		 */
		setUp: function() {
			var self = this;

		 	// 配置项
			
			// 设置已选中日期，默认为当天日期
			self.selectedDate = self.unformatDate(self.get("start").val(), self.get("formatDate")) || self.get("value");
			self.curShowDate = self.selectedDate;

			// 渲染摸板
			self.render();

			// 储存相关节点，以便其他函数调用
			self.set("rgbDTP", $(".rgb-dtp"));
			self.set("iconH", $(".icon-h"));
			self.set("iconL", $(".icon-l"));
			self.set("iconR", $(".icon-r"));
			self.set("headerYear", $(".header-year"));
			self.set("headerMonth", $(".header-month"));
			self.set("dataCalendar", $(".data-calendar"));

			// 绑定事件
			self.bind();
		},
		/**
		 * 绑定相关事件
		 */
		bind: function() {
			var self = this;

			// 组件的事件代理到该节点下面
			var parentNode = self.get("rgbDTP");

			// 显示组件事件
			self.get("start").on("click", function() {

				//显示组件
				self.get("rgbDTP").attr("class", "rgb-dtp dtp-" + new Date().getTime()).show();

				// 标记组件已显示
				self.isShowed = true;

				// 更新组件面板
				self.updatePanel(self.selectedDate);

				// 定位到start元素下面
				self.setPosition();
			});

			// 关闭组件事件
			$(document).on("click", function(e) {
				var target = e.target,
					// 查找事件目标的父节点时候有rgbDTP节点，并使用$()[0]方法获取相应DOM元素
					targetParent = $(target).parents(".rgb-dtp")[0];

				// 如果组件已经显示并且事件目标不为start节点，同时事件目标的父节点不包含rgbDTP节点，则关闭组件
				if (self.isShowed === true && target != self.get("start")[0] && targetParent != self.get("rgbDTP")[0]) {
					self.get("rgbDTP").hide();
					self.isShowed === false;
				}
			});

			// 组件面板内事件全部代理到parentNode
			// 月份下拉框事件
			parentNode.on("change", ".header-month", function(e) {

				// 截取已选中的option的class属性以获取选中月份
				var selectedCls = $(this).find("option:selected").attr("class"),
					selected = selectedCls.substring(9);

				// 改变月份后的时间
				var changedDate = new Date(self.curShowDate.getFullYear(), selected);

				var fillDate = self.fillDate(changedDate);
				self.get("dataCalendar").find("tbody").html(fillDate);

				//更新当前显示时间
				self.curShowDate = changedDate;
			});

			// 年份下拉框事件
			parentNode.on("change", ".header-year", function(e) {
				var selected = $(this).val();

				var changedDate = new Date(selected, self.curShowDate.getMonth());

				var fillDate = self.fillDate(changedDate);
				self.get("dataCalendar").find("tbody").html(fillDate);

				self.curShowDate = changedDate;
			});

			// 上一个月按钮事件
			parentNode.on("click", ".icon-l", function(e) {
				var curShowDate = self.curShowDate;

				var changedDate = self.changeDateByMonth(curShowDate, -1);

				self.updatePanel(changedDate);
			});

			// 下一个月按钮事件
			parentNode.on("click", ".icon-r", function(e) {
				var curShowDate = self.curShowDate;

				var changedDate = self.changeDateByMonth(curShowDate, 1);

				self.updatePanel(changedDate);
			});

			// 主页按钮事件，显示今天日期
			parentNode.on("click", ".icon-h", function(e) {
				self.updatePanel(new Date());
			});

			// 表格日期事件
			self.get("dataCalendar").on("click", "td", function(e) {
				var target = $(e.target);

				// 将上次选中td的Class置空
				self.get("dataCalendar").find("td.selected-date").attr("class", "");

				target.attr("class", "selected-date");

				self.get("rgbDTP").hide();

				self.isShowed === false;

				var fullDate = target.attr("data-full-date");

				// 更新start元素的值 
				self.get("start").val(fullDate);

				self.curShowDate = self.selectedDate = new Date(target.attr("data-year"), target.attr("data-month"), target.attr("data-date"));
			});
		},
		/**
		 * 更新整个面板
		 */
		updatePanel: function(initDate) {
			var self = this;

			// 渲染年份
			var fillYear = self.fillSelect(0, "year-op-" + initDate.getFullYear());
			self.get("headerYear").html(fillYear);

			// 渲染月份
			var fillMonth = self.fillSelect(1, "month-op-" + initDate.getMonth());
			self.get("headerMonth").html(fillMonth);

			// 渲染日期
			var fillDate = self.fillDate(initDate);
			self.get("dataCalendar").find("tbody").html(fillDate);

			self.curShowDate = initDate;
		},
		/**
		 * 获取待渲染的select标签内容，type参数表示下拉框类型，0表示年份，1表示月份
		 */
		fillSelect: function(type, selectedClass) {
			var self = this;
			var options = [];
			type = type || 0;
			if (type == 0) {
				var yearStart = self.get("yearStart"),
					yearEnd = self.get("yearEnd");
				for (var i = yearStart; i < yearEnd; i++) {
					if ('year-op-' + i != selectedClass) {
						options[i] = options[i] = "<option value='" + i + "' class='year-op-" + i + "'>" + i + "</option>";
					} else {
						options[i] = options[i] = "<option value='" + i + "' class='year-op-" + i + " year-op-selected' selected='selected'>" + i + "</option>";
					}
				}
			} else if (type == 1) {
				var monthSelectArr = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
				for (i = 0; i < 12; i++) {
					if ('month-op-' + i != selectedClass) {
						options[i] = "<option value='" + monthSelectArr[i] + "' class='month-op-" + i + "'>" + monthSelectArr[i] + "</option>";
					} else {
						options[i] = "<option value='" + monthSelectArr[i] + "' class='month-op-" + i + "' selected='selected'>" + monthSelectArr[i] + "</option>";
					}
				}
			}
			return options.join("");
		},
		/**
		 * 获取待渲染的日期内容
		 */
		fillDate: function(initDate) {
			var self = this;

			var year = initDate.getFullYear(),
				month = initDate.getMonth(),
				date = initDate.getDate(),
				days = self.getMonthAllDays(initDate),
				FirstDay = new Date(year, month, 1), // 一个月第一天
				LastDay = new Date(year, month, days), // 一个月最后一天
				WeekOfFirstDay = FirstDay.getDay(), // 本月第一天的星期数
				weekOfLastDay = LastDay.getDay(), // 本月最后一天是的星期数
				lines = Math.floor((days + WeekOfFirstDay) / 7), // 时间表格的总行数少1
				selectedDate = self.selectedDate;

			var selectedDateCls = "";

			var count = 0;

			// 填充第一行数据
			var tbody = "<tr>";
			for (var i = WeekOfFirstDay; i > 0; i--, count++) {
				var preMonthDate = self.changeDateByDay(FirstDay, -i);
				tbody += '<td data-date="' + preMonthDate.getDate() + '" data-month="' + preMonthDate.getMonth() +
					'" data-year="' + preMonthDate.getFullYear() + '" class="other-month-day" data-full-date="' + self.formatDate(preMonthDate, self.get("formatDate")) + '" data-index="' + count + '">' + preMonthDate.getDate() + '</td>';
			}

			for (var j = 1; j < 7 - WeekOfFirstDay + 1; j++, count++) {
				var curMonthDate = self.changeDateByDay(FirstDay, j-1);
				var fullDate = self.formatDate(curMonthDate, self.get("formatDate"));

				if (fullDate == self.formatDate(selectedDate, self.get("formatDate"))) {
					selectedDateCls = "selected-date";
				}
				tbody += '<td data-date="' + j + '" data-month="' + month +
					'" data-year="' + year + '" class="' + selectedDateCls + '" data-full-date="' + fullDate + '" data-index="' + count + '">' + j + '</td>';
				
				if (selectedDateCls) {
					selectedDateCls = "";
				}
			}

			// 填充中间行数据
			for (var k = 0; k < lines; k++) {
				tbody += "</tr><tr>";
				for (var i = 0; i < 7 && j <= days; i++, j++) {
					var curMonthDate = self.changeDateByDay(FirstDay, j - 1);
					var fullDate = self.formatDate(curMonthDate, self.get("formatDate"));
					if (fullDate == self.formatDate(selectedDate, self.get("formatDate"))) {
						selectedDateCls = "selected-date";
					}
					tbody += '<td data-date="' + j + '" data-month="' + month +
						'" data-year="' + year + '" class="' + selectedDateCls + '" data-full-date="' + fullDate + '" data-index="' + count + '">' + j + '</td>';
					if (selectedDateCls) {
						selectedDateCls = "";
					}
					count++;
				}
			}

			// 填充最后一行数据
			for (var i = 0; i < 6 - weekOfLastDay; i++, count++) {
				var nextMonthDate = self.changeDateByDay(LastDay, i + 1);
				tbody += '<td data-date="' + nextMonthDate.getDate() + '" data-month="' + nextMonthDate.getMonth() +
					'" data-year="' + nextMonthDate.getFullYear() + '" class="other-month-day" data-full-date="' + self.formatDate(nextMonthDate, self.get("formatDate")) + '" data-index="' + count + '">' + nextMonthDate.getDate() + '</td>';
			}
			tbody += "</tr>";

			return tbody;
		},
		/**
		 * 定位组件模块
		 */
		setPosition: function() {
			var self = this;

			var startElem = self.get("start");
			if (!startElem) {
				throw "start 参数不能为空";
				return;
			}

			// start元素position属性不能为static
			if (startElem.css("position") == "static") {
				startElem.css("position", "relative");
			}

			var startOffset = startElem.offset();

			//  根据start元素定位及其高度对组件定位
			self.get("rgbDTP").css({
				'position': 'absolute',
				'top': parseFloat(startOffset.top) + parseFloat(startElem.height()) + 5 + 'px',
				'left': parseFloat(startOffset.left) + 'px',
				'display': '',
				'z-index': '99999'
			});
		}
	});
	//日期组件模块 结束

	return DateTimePicker;
}());