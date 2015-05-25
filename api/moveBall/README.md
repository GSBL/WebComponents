## moveBall
	这个不能算组件，所以直接写的内置函数

* 内置方法
    * init()
        * 功能：初始化canvas
    * render(context, x, y)
        * 功能：绘制canvas图形
        * 参数：canvas的2d上下文`context`，带绘制图形坐标`x`，`y`
    * bind()
        * 功能：绑定canvas的mousedown、mousemove、mouseout、mouseup事件
    
* 辅助函数
	* posInCanvas(canvas, x, y)
		* 功能： 将一个相对于文档的坐标转化相对于canvas坐标
		* 参数： canvas元素`canvas`，待转换的坐标`x`，`y`
		* 返回值：坐标对象{x:"*",y:"*"}
	* addHandler(elem, type, handler)
		* 功能： 给elem元素添加一个type类型的事件处理函数handler
	* removeHandler(elem, type, handler)
		* 功能： 给elem元素去掉一个type类型，函数名叫handler的事件处理函数

