define(function(require, exports, module) {
	// 导入数字模块
	var digit = require("./digit");
	var $ = require("jquery");
	var Base = require("Base");
	var TimeMeter = Base.extend({
		// 设置默认配置
		options: {

		},
		// 注册相关事件
		events: {
			// 开始按钮事件
			"#time-start": {
				"click": function(self, e) {
					var timeStartBtn = self.get("timeStartBtn");
						timePauseBtn = self.get("timePauseBtn");
						timeCancelBtn = self.get("timeCancelBtn");
						timeContinueBtn = self.get("timeContinueBtn");

					// 更新按钮状态
					timeStartBtn.hide();
					timePauseBtn.show();
					timeCancelBtn.show();
					timeContinueBtn.hide();

					// 这里需要重新获取canvas,原因待查
					var canvas = document.getElementById('time-meter-canvas');
					var context = canvas.getContext("2d");

					self.set("startTime",new Date());

					// 每隔50毫秒刷新一次canvas
					var timer=setInterval(function () {

						// 获取当前要显示的秒数
						var curShowTimeSeconds = self.get("curShowTimeSeconds") || 0;
						self.renderCanvas(context,curShowTimeSeconds);
						self.update();
					},50);

					self.set("timer",timer);
				}
			},
			//暂停按钮事件
			"#time-pause": {
				"click": function(self, e) {

				}
			},
			// 取消按钮事件
			"#time-cancel": {
				"click": function(self, e) {}
			},
			// 继续按钮事件
			"#time-continue": {
				"click": function(self, e) {}
			}
		},
		// 指定当前组件的模板
		template: '<div class="horizontal-center" id="time-meter">'
		 			+ '<canvas class="time-meter-canvas" id="time-meter-canvas"></canvas>'
		  			+ '<div class="time-btn-holder">'
		   				+ '<a id="time-start" class="timer-btn-blue">开始</a>'	
		    			+ '<a id="time-cancel" class="timer-btn-pink">取消</a>'
		    			+ '<a id="time-pause" class="timer-btn-gray">暂停</a>'
		      			+ '<a id="time-continue" class="timer-btn-blue">继续</a>'
		       		+ '</div>'
		        + '</div>',
		// 覆盖实现setUp方法，所有逻辑写在这里
		// 模板渲染后会添加到parentNode面，若未指定，则添加到body下面
		setUp: function() {
			var self = this;

			// 渲染模板
			self.render();

			// 获取相应按钮
			var timeStartBtn = $("#time-start"),
				timePauseBtn = $("#time-pause"),
				timeCancelBtn = $("#time-cancel"),
				timeContinueBtn = $("#time-continue");

			// 储存按钮节点以便其他函数调用
			self.set("timeStartBtn", timeStartBtn);
			self.set("timePauseBtn", timePauseBtn);
			self.set("timeCancelBtn", timeCancelBtn);
			self.set("timeContinueBtn", timeContinueBtn);
			
			// 初始化按钮状态
			timeStartBtn.show();
			timePauseBtn.show();
			timeCancelBtn.hide();
			timeContinueBtn.hide();

			var canvas = document.getElementById('time-meter-canvas');

			// 创建canvas 
			var context = canvas.getContext("2d");

			// 获取canvas画布大小
			var canvasWidth = canvas.offsetWidth,
				canvasHeight = canvas.offsetHeight,

				// 设置每个数字的左外边距
				marginLeft = 50,

				// 设置每个圆形半径
				radius = 1,

				// 设置每个数字的上外边距
				marginTop = 55;

			self.set("context",context);
			self.set("canvasWidth", canvasWidth);
			self.set("canvasHeight", canvasHeight);
			self.set("marginLeft", marginLeft);
			self.set("radius", radius);
			self.set("marginTop", marginTop);

			self.renderCanvas(context,0);
		},
		// 获取下一秒显示时间
		getNextShowTimeSeconds:function () {
			var self = this;

			var startTime = self.get("startTime");
				curTime= new Date();

			// 通过当前时间减去开始时间除以1000获得要显示的秒数
			return Math.round( (curTime.getTime() - startTime.getTime())/1000 );
		},
		// 绘制canvas界面
		renderCanvas: function(cxt,seconds) {
			var self = this;

			var canvasWidth = self.get("canvasWidth"),
				canvasHeight = self.get("canvasHeight"),
				radius = self.get("radius"),
				marginLeft = self.get("marginLeft", marginLeft),
				marginTop = self.get("marginTop", marginTop);

			// 清空上一秒canvas界面像素
			cxt.clearRect(0,0,canvasWidth, canvasHeight);

			var	hours = parseInt( seconds / 3600),
				minutes = parseInt( (seconds - hours * 3600)/60 ),
				seconds = seconds % 60;

			// 绘制对应位置上的数字
			self.renderDigit(marginLeft, marginTop, parseInt(hours / 10), cxt);
			self.renderDigit(marginLeft + 15 * (radius + 1), marginTop, parseInt(hours % 10), cxt);
			self.renderDigit(marginLeft + 30 * (radius + 1), marginTop, 10, cxt);
			self.renderDigit(marginLeft + 39 * (radius + 1), marginTop, parseInt(minutes / 10), cxt);
			self.renderDigit(marginLeft + 54 * (radius + 1), marginTop, parseInt(minutes % 10), cxt);
			self.renderDigit(marginLeft + 69 * (radius + 1), marginTop, 10, cxt);
			self.renderDigit(marginLeft + 78 * (radius + 1), marginTop, parseInt(seconds / 10), cxt);
			self.renderDigit(marginLeft + 93 * (radius + 1), marginTop, parseInt(seconds % 10), cxt);
		},
		//绘制数字
		renderDigit: function(x, y, num, context) {
			var self = this;

			var radius = self.get("radius");
				digitColor = self.get("digitColor");
				
			// 设置圆形颜色，支持css3的颜色属性
			context.fillstyle = digitColor;

			// 
			for (var i = 0, len1 = digit[num].length; i < len1; i++) {
				for (var j = 0, len2 = digit[num][i].length; j < len2; j++) {
					if (digit[num][i][j] === 1) {
						context.beginPath();
						context.arc(x + 2 * j * (radius + 1) + (radius + 1), y + 2 * i * (radius + 1) + (radius + 1), radius, 0, 2 * Math.PI);
						context.closePath();
						context.fill();
					}
				}
			}
		},
		// 更新下次显示秒数
		update: function () {
			var self = this;

			var nextShowTimeSeconds = self.getNextShowTimeSeconds();
				curShowTimeSeconds = self.get(curShowTimeSeconds) || 0;

		    if( nextShowTimeSeconds != curShowTimeSeconds ){
		        self.set("curShowTimeSeconds",nextShowTimeSeconds);
		    }
		}
	});
	module.exports = TimeMeter;
})