## 综述

Datetimepicker是一个日期和时间选择组件

* 版本：1.0.1
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

### 全局事件响应
| 控制台点击事件 | 描述 |    
| ------------ | ------------- |
| clickLastMonth | 日期导航，上个月按钮被点击 |
| clickNextMonth | 日期导航，下个月按钮被点击 |
| clickToday | 日期导航，今天按钮 |
| changeYear | 日期导航，年的下拉选框值改变 |
| changeMonth | 日期导航，月的下拉选框值改变 |

| 组件点击时间 | 描述 |
| ------------ | ------------- |
| clickDate | 点选日期|
| clickDateChange | 点选日期，并导致日期改变 |


| 全局事件 | 描述 |
| ------------ | ------------- |
| hidePanel | 隐藏整个控件|
| showPanel | 显示整个控件|


* 内置方法
    * setUp()
        * 功能：初始化组件
    * bind()
        * 功能：绑定相应事件
    * updatePanel(initDate)
        * 功能：更新并渲染整个组件面板
        * 参数：相关日期 `Date`
    * fillSelect(type,selectedClass)
        * 功能：获取待渲染的select标签内容
        * 参数：type表示
        * 返回值： 下拉框中option内容  `String`
    * fillDate(initDate)
        * 功能：获取待渲染的日期内容(table 中的内容)
        * 参数：相关日期 `Date`
    * setPosition()
        * 功能：将组件模块定位到start元素下面

* 基本样式
    * 组件最外层className `ks-dtp`
    * 日历组件最外层className `dtp-date`
    * 按钮的className `.ks-dtp .icon`    