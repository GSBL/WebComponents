var MoveBall = function() {
	// 一时想不到该叫啥名字...
	function MoveBall(id) {
		this.node = document.getElementById(id)
		this.init()
	}
	// 初始化
	MoveBall.prototype.init = function() {
		var self = this
		// 设置小球半径
		self.radius = 12 
		// 获取2d上下文
		self.context = self.node.getContext("2d")
		if(!self.context){
			alert("您的浏览器不支持canvas")
			return 
		} 
		// 初始化小球位置
		self.render(self.context, 200, 200)
		self.bind()
	}
	// 绘制小球
	MoveBall.prototype.render = function(context, x, y) {
		context.beginPath()
		context.arc(x, y, this.radius, 0, 2 * Math.PI, false)
		context.fill()
	}
	// 绑定事件
	MoveBall.prototype.bind = function() {
		var self = this,
			canvas = self.node,
			context = self.context,
			timer = null,
			radius = self.radius,
			trail = [], // 记录小球路径
			moveTime = 50 // 小球平移时间间隔，单位毫秒 

		addHandler(canvas, "mousedown", function(event) {
			event = event || window.event

			// 计算小球运动初始位置
			var pos = posInCanvas(canvas, event.clientX, event.clientY)
			trail.push(pos)

			addHandler(canvas, "mousemove", _mousemove)
			addHandler(canvas, "mouseup", _mouseup)
			addHandler(canvas, "mouseout", _mouseup)
		})

		// mousemove事件
		function _mousemove(event) {
			var pos = {}
			event = event || window.event
			// 记录鼠标运动轨迹
			timer = setInterval((function(e) {
				pos = posInCanvas(canvas, e.clientX, e.clientY)
				trail.push(pos)
			})(event), 50)
		}

		// mouseout和mouseup事件
		function _mouseup(event) {
			var cxt = context,
				i = 0,
				len = trail.length,
				canvasWidth = canvas.width,
				canvasHeigth = canvas.height

			// 清除mouseout的定时器
			clearInterval(timer)

			removeHandler(canvas, "mousemove", _mousemove)
			removeHandler(canvas, "mouseup", _mouseup)
			removeHandler(canvas, "mouseout", _mouseup)

			// 小球动画效果
			timer = setInterval(function() {
				// 确保小球在canvas内部移动
				if(i<len && trail && trail[i].x >radius && trail[i].x <canvasWidth-radius && trail[i].y >radius && trail[i].y <canvasHeigth-radius){
					cxt.clearRect(0, 0, canvasWidth, canvasHeigth)
					self.render(cxt, trail[i].x, trail[i++].y)
				}else{
					// 停止移动 
					clearInterval(timer)
					// 清空路径
					trail = []
					i = 0
				}
			}, moveTime)
		}

	}

	// 将一个相对于文档的坐标转化相对于canvas坐标
	function posInCanvas(canvas, x, y) {
		var rectMoveBall = canvas.getBoundingClientRect()

		return {
			x: x - rectMoveBall.left - (rectMoveBall.width - canvas.width) / 2,
			y: y - rectMoveBall.top - (rectMoveBall.height - canvas.height) / 2
		}
	}

	// 添加事件处理函数
	function addHandler(elem, type, handler) {
		if (elem.addEventListener) {
			elem.addEventListener(type, handler, false)
		} else if (elem.attachEvent) {
			elem.attachEvent("on" + type, function() {
				handler.apply(this, arguments)
			})
		} else {
			elem["on" + type] = handler
		}
	}
	// 去除事件处理函数
	function removeHandler(elem, type, handler) {
		if (elem.removeEventListener) {
			elem.removeEventListener(type, handler, false)
		} else if (elem.detachEvent) {
			elem.detachEvent("on" + type, handler)
		} else {
			elem["on" + type] = null
		}
	}

	return MoveBall
}()