define(function(require, exports, module) {
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
    module.exports = Class;
})