var DateTimePicker = (function() {

  //基础类模块 开始
  // The base Class implementation.
  function Class(o) {
    //这个判断用来支持 将一个已有普通类转换成 阿拉蕾的类
    if (!(this instanceof Class) && isFunction(o)) {
      //原理是给这个函数增加extend，implement方法
      return classify(o)
    }
  }
  //用于创建一个类，
  //第一个参数可选，可以直接创建时就指定继承的父类。
  //第二个参数也可选，用来表明需要混入的类属性。有三个特殊的属性为Extends,Implements,Statics.分别代表要继承的父类，需要混入原型的东西，还有静态属性。
  Class.create = function(parent, properties) {
    //创建一个类时可以不指定要继承的父类。直接传入属性对象。
    if (!isFunction(parent)) {
      properties = parent
      parent = null
    }

    properties || (properties = {})
    //没有指定父类的话 就查看有没有Extends特殊属性，都没有的话就用Class作为父类
    parent || (parent = properties.Extends || Class)
    properties.Extends = parent

    // 子类构造函数的定义

    function SubClass() {
      // 自动帮忙调用父类的构造函数
      parent.apply(this, arguments)

      // Only call init in self constructor.
      //真正的构造函数放在init里面
      if (this.constructor === SubClass && this.init) {
        this.init.apply(this, arguments)
      }
    }

    // Inherit class (static) properties from parent.
    //parent为Class就没必要混入
    if (parent !== Class) {
      //将父类里面的属性都混入到子类里面这边主要是静态属性
      mix(SubClass, parent, parent.StaticsWhiteList)
    }

    // Add instance properties to the subclass.
    //调用implement将自定义的属性混入到子类原型里面。遇到特殊值会单独处理，真正的继承也是发生在这里面
    //这边把属性也都弄到了原型上，因为这边每次create或者extend都会生成一个新的SubClass。所以倒也不会发生属性公用的问题。但是总感觉不大好
    implement.call(SubClass, properties)

    // Make subclass extendable.
    //给生成的子类增加extend和implement方法，可以在类定义完后，再去继承，去混入其他属性。
    return classify(SubClass)
  }

  //用于在类定义之后，往类里面添加方法。提供了之后修改类的可能。类似上面defjs实现的open函数。

  function implement(properties) {
    var key, value

    for (key in properties) {
      value = properties[key]
      //发现属性是特殊的值时，调用对应的处理函数处理
      if (Class.Mutators.hasOwnProperty(key)) {
        Class.Mutators[key].call(this, value)
      } else {
        this.prototype[key] = value
      }
    }
  }


  // Create a sub Class based on `Class`.
  Class.extend = function(properties) {
    properties || (properties = {})
    //定义继承的对象是自己
    properties.Extends = this
    //调用Class.create实现继承的流程
    return Class.create(properties)
  }

  //给一个普通的函数 增加extend和implement方法。

  function classify(cls) {
    cls.extend = Class.extend
    cls.implement = implement
    return cls
  }


  // 这里定义了一些特殊的属性，阿拉蕾遍历时发现key是这里面的一个时，会调用这里面的方法处理。
  Class.Mutators = {
    //这个定义了继承的真正操作代码。
    'Extends': function(parent) {
      //这边的this指向子类
      var existed = this.prototype
      //生成一个中介原型，就是之前我们实现的objectCreat
      var proto = createProto(parent.prototype)

      //将子类原型有的方法混入到新的中介原型上
      mix(proto, existed)

      // 改变构造函数指向子类
      proto.constructor = this

      // 改变原型 完成继承
      this.prototype = proto

      //为子类增加superclass属性，这样可以调用父类原型的方法。
      this.superclass = parent.prototype
    },
    //这个有点类似组合的概念，支持数组。将其他类的属性混入到子类原型上
    'Implements': function(items) {
      isArray(items) || (items = [items])
      var proto = this.prototype,
        item

      while (item = items.shift()) {
        mix(proto, item.prototype || item)
      }
    },
    //传入静态属性
    'Statics': function(staticProperties) {
      mix(this, staticProperties)
    }
  }

  // Shared empty constructor function to aid in prototype-chain creation.

  function Ctor() {}

  // 这个方法就是我们之前实现的objectCreat，用来使用一个中介者来处理原型的问题，当浏览器支持`__proto__`时可以直接使用。否则新建一个空函数再将父类的原型赋值给这个空函数，返回这个空函数的实例
  var createProto = Object.__proto__ ?
      function(proto) {
        return {
          __proto__: proto
        }
    } :
      function(proto) {
        Ctor.prototype = proto
        return new Ctor()
    }

    // 下面是些辅助方法

    function mix(r, s, wl) {
      // Copy "all" properties including inherited ones.
      for (var p in s) {
        //过滤掉原型链上面的属性
        if (s.hasOwnProperty(p)) {
          if (wl && indexOf(wl, p) === -1) continue

          // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
          if (p !== 'prototype') {
            r[p] = s[p]
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
			if (isArray(this._handlers[event.type])) {
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
	});
    // 自定义事件模块 结束
    
    // 组件base模块 开始
	// 混入自定义事件模块
	var Base = Class.extend(Event);
	Base = Base.extend({
		// 用于存放注册事件
		events: "",
		// 模板内容
		template: "",
		// init用于初始化属性
		init: function(options) {
			this._options = options || {};
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
	// 组件base模块 结束
	
	//日期组件模块 开始
	var DateTimePicker = Base.extend({
		_options: {
			// 组件的初始化数据，如果不传递，默认使用当前时间
			value: new Date(), 
			start: null,
            // 点选日期+时间返回值的格式，且为日期+时间初始化的传递值的格式
            format: 'YYYY-MM-DD HH:mm',
            // 日期的返回值和初始化的格式
            formatDate:'YYYY-MM-DD',
            // 是否每周以周1为第一天
            startWithMonday: false,
            // 点击日历就关闭组件
            closeOnDateSelect: false,
            datepicker: true,
            // 显示今日日期按钮
            todayButton: true,
            // 年下拉框起始年份
            yearStart: 1919,
            // 年下拉框起始年份
            yearEnd: 2049,
            timeHeightInTimePicker: 26,
            // 为组件添加额外id
            id: '',
            // 为组件添加额外class
            className: ''
		},
		template:   '<div class="rgb-dtp" style="<%= dtpStyle %>">'    
						+ '<div class="dtp-date">'
							+ '<div class="date-header">'
								+ '<a title="上个月" class="icon icon-l">l</a>'
								+ '<a class="icon icon-h" title="今天"class="icon">h</a>'
								+ '<select class="header-year"><%= yearSelect %></select>'
								+ '<select class="header-month"><%= monthSelect %></select>'
								+ '<a class="icon icon-r" class="下个月">r</a>'
								+ '</div>'
							+ '<div class="data-calendar"><%= calendar %></div>'
						+ '</div>'
					+ '</div>',
		setUp: function () {
			var self = this;
			// 渲染摸板
			self.render({
				dtpStyle: "display:none",
				yearSelect: "",
				monthSelect: "",
				calendar: ""
			});

			var value = self.get("value");
		}
	});
	//日期组件模块 结束
	
	return DateTimePicker;
}());