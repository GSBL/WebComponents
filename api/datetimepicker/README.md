## 综述

Datetimepicker是一个日期选择组件

* 版本：1.0.0
* 作者：rgb

## 依赖说明
* 本组件基于jquery开发，引入组件时请确保已经引入jquery

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
        * `默认值null`,
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
    * setUp()
        * 功能：初始化组件
    * bind()
        * 功能：绑定相应事件
    * updatePanel(initDate)
        * 功能：更新并渲染整个组件面板
        * 参数：相关日期，`Date`类型
    * fillSelect(type,selectedClass)
        * 功能：获取待渲染的select标签内容
        * 参数：type表示下拉框类型，Number类型，1表示月份，0表示年份
        * 参数：selectedClass表示被选中元素的class，`String`类型
        * 返回值：下拉框中option内容，`String`类型
    * fillDate(initDate)
        * 功能：获取待渲染的日期内容(table 中的内容)
        * 参数：相关日期，`Date`类型
    * setPosition()
        * 功能：将组件模块定位到start元素下面
* 日期处理方法          
    * changeDate(date, num, dateType)
        * 功能：按要求更改时间
        * 参数：date指被参照的时间，Date类型
        * 参数：num指更改的幅度，Number类型，负数表示更改到date时间以前
        * 参数：dateType指更改的类型，0表示按天更改，1表示按月，2表示按年
    *changeDateByMonth(date,num)
        * 功能：按月份更改时间
        * 参数：同changeDate的对应参数
    *changeDateByDate(date,num)
        * 功能：按天数更改时间
        * 参数：同changeDate的对应参数
    *getMonthAllDays(date)
        * 功能：获取date时间所在月份的总天数
        * 返回值：月份天数，Number类型
    *isLeapYear(year)
        * 功能：是否为润年
    *formatDate(date,fmt)
        * 功能：将时间date按照格式fmt进行格式化
        * 参数：date指待格式化的时间，Date类型
        * 参数：fmt指格式化后的样式，String类型
        * 返回值：被格式化后的时间，String类型
    *unformatDate(str,fmt)
        * 功能：执行格式化的逆操作
        * 参数：str指已格式化的字符串，String类型
        * 参数：fmt指格式化的样式，String类型
        * 返回值：还原后的时间，date类型

* 基本样式
    * 组件最外层className `ks-dtp`
    * 日历组件最外层className `dtp-date`
    * 按钮的className `.ks-dtp .icon`    
