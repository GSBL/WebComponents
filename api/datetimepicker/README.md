## 综述

Datetimepicker是一个日期选择组件

* 版本：1.0.0
* 作者：rgb

## 依赖说明
* 本组件基于jquery开发，引入组件时请确保已经引入jquery

## 引入组件

```html
css部分
<head><link rel="stylesheet" type="text/css" href="../static/datetimepicker/src/datetimepicker.css"></head>

js部分
<script src="http://libs.baidu.com/jquery/2.1.1/jquery.min.js"></script>
    <script type="text/javascript" src="../static/datetimepicker/src/datetimepicker.js"></script>
```

## 初始化组件

    new DateTimePicker({参数列表});

## 兼容性
* Windows下Chrome、firefox测试通过

## API说明

### 初始化配置项

* 配置项为object，内部参数如下
    * value 
        * `默认值''`
        * 组件的初始化数据，如果不传递，默认使用当前时间。
    * start
        * `默认值null`
        * 组件的创建元素（开始），组件会在该元素点击时，位于元素的下方。(必须)
        * 如果start内有值，又传递了`value`这个配置项，优先以start的内的值作为初始化的值
    * formatDate 
        * `默认值'YYYY-MM-DD'`,
        * 日期的返回值和初始化的格式
    * yearStart 
        * `默认值1919`
        * 年下拉框的最小值
    * yearEnd 
        * `默认值2049`
        * 年下拉框的最大值

* 内置方法
    * init(opts)
        * 功能：初始化组件
        * 参数：opts设置项
    * bind()
        * 功能：绑定相应事件
    * render(initDate)
        * 功能：渲染整个组件面板
        * 参数：相关日期，Date类型
    * createElem()
        * 功能：生成组件节点
        * 返回值：组件节点
    * setPosition()
        * 功能：将组件模块定位到start元素下面
* 辅助方法 
    * changeDateByMonth(date,num)
        * 功能：按月份更改时间
        * 参数：date指被参照时间，num指更改的幅度，负数表示向前
        * 返回值：更改后的时间，date类型
    * changeDateByDate(date,num)
        * 功能：按天数更改时间
        * 参数：date指被参照时间，num指更改的幅度，负数表示向前
        * 返回值：更改后的时间，date类型
    * formatDate(date,fmt)
        * 功能：将时间date按照格式fmt进行格式化
        * 参数：date指待格式化的时间，Date类型
        * 参数：fmt指格式化后的样式，String类型
        * 返回值：被格式化后的时间，String类型
    * unformatDate(str,fmt)
        * 功能：执行格式化的逆操作
        * 参数：str指已格式化的字符串，String类型
        * 参数：fmt指格式化的样式，String类型
        * 返回值：还原后的时间，Date类型
    * mix(s,r)
        * 将对象s上的属性合并到对象r上
        *返回值：合并后的S对象

* 基本样式
    * 组件最外层className `ks-dtp`
    * 日历组件最外层className `dtp-date`
    * 按钮的className `.ks-dtp .icon`    