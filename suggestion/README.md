## demo综述
    这是一个基于`nodejs`的suggestion组件的demo

## 网站目录结构如下
```
 Suggestion/
   |-- bin      
   |-- node_modules        存放所有的项目依赖库            
   |-- public              存放js、css、img静态文件
   |    |-- images
   |    |-- javascripts
   |    `-- stylesheets
   |-- routes               路由文件(MVC中的C,controller)
   |      |-- index.js
   |      `-- users.js
   |-- views                页面文件
   |      |-- index.html
   |      `-- error.ejs
   |--  package.json        项目依赖配置及开发者信息
   |   
   `-- app.js               启动程序文件
```
## 组件综述
suggestion是一个搜索框提示组件

* 版本：1.0.0
* 作者：rgb

## 依赖说明
* 本组件基于jquery开发，引入组件时请确保已经引入jquery

## 引入组件
css部分 需要引入public/stylesheets下面的`suggestion.css`

js部分 需要引入public/javascripts下面的`suggestion.js`

## 初始化组件

    new Suggestion({参数列表})

## 兼容性
* Windows下Chrome、firefox测试通过

## API说明
* 配置项为object，内部参数如下
    * parentNode 
        * `默认值 $(document.body)`
        * 组件的父节点
    * url
        * `默认值''`
        * 进行数据交互传输地址
    * type 
        * `默认值'GET'`
        * 向后台发送请求的类型
    * onSearch 
        * `默认值function (self,event) {}`
        * 点击搜索按钮或enter键触发的事件,self参数指代组件实例对象
* 内置方法
    * init(opts)
        * 功能：初始化组件
        * 参数：opts设置项
    * bind()
        * 功能：绑定输入框的focus、blur、enter、input事件，绑定搜索按钮事件
    * render(keyword)
        * 功能：通过ajax发送异步请求，成功响应后渲染结果列表
    * createElem()
        * 功能：生成组件节点
        * 返回值：组件节点

* 基本样式
    * 组件最外层className `content-sidebar`
    * 输入框的className `content-search-input`
    * 按钮的className `content-search-btn` 
    * 查询结果列表的className `content-sidebar-result` 