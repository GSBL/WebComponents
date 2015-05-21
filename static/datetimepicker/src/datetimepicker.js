/**
 * 日期选择器
 * @author rgb
 * @todo 时间选择器
 */
var DateTimePicker = (function() {

	// 组件模板	
	var template = '<div class="dtp-date"><div class="date-header"><a title="上个月" class="icon icon-l">l</a><a class="icon icon-h" title="今天">h</a><select class="header-year"></select><select class="header-month"></select><a class="icon icon-r">r</a></div><div class="data-calendar"><table><thead><tr><th>周日</th><th>周一</th><th>周二</th><th>周三</th><th>周四</th><th>周五</th><th>周六</th></tr></thead><tbody></tbody></table></div></div>';

	var DateTimePicker = function(opts) {
		if (!(this instanceof DateTimePicker)) {
			return new this(opts);
		}

		this._options = {
			value: new Date(),
			start: null,
			formatDate: 'YYYY-MM-DD',
			yearStart: 1919,
			yearEnd: 2049
		};

		// 组件被选中的时间
		this.selectedDate = "";

		// 用于存放组件节点
		this.dtpNode = null;

		this.init(opts);
	}
	DateTimePicker.prototype.init = function(opts) {
		var self = this;

		// 合并配置项
		mix(self._options, opts);
		var selfOpts = self._options;

		// 设置被选中日期
		self.selectedDate = unformatDate(selfOpts.start.val(), selfOpts.formatDate) || selfOpts.value;

		// 生成展示元素
		self.dtpNode = this.createElem();

		// 绑定相关事件
		self.bind();

		// 定位组件
		self.setPosition();
	}
	/**
	 * 绑定相关事件
	 */
	DateTimePicker.prototype.bind = function() {
		var self = this;
		var selfOpts = self._options;
		var dtpNode = self.dtpNode;

		// 显示组件事件
		selfOpts.start.on("click", function() {
			self.render(self.selectedDate);

			dtpNode.show();
			self.isShowed = true;
		});

		// 关闭组件事件
		$(document).on("click", function(e) {
			var target = e.target;

			// 查找事件目标的父节点时候有dtpNode节点，并使用$()[0]方法获取相应DOM元素
			var targetParent = $(target).parents("." + dtpNode.attr("class").substring(8))[0];

			// 如果组件已经显示并且事件目标不为start节点，同时事件目标的父节点不包含dtpNode节点，则关闭组件
			if (self.isShowed === true && target != selfOpts.start[0] && targetParent != dtpNode[0]) {
				dtpNode.hide();
				self.isShowed = false;
			}
		});

		// 组件面板内事件全部代理到dtpNode
		// 月份下拉框事件
		dtpNode.on("change", ".header-month", function(e) {
			// 截取已选中的option的class属性以获取选中月份
			var selectedCls = $(this).find("option:selected").attr("class");
			var selected = selectedCls.substring(9);

			// 改变月份后的时间
			var changedDate = new Date(self.selectedDate.getFullYear(), selected);

			self.render(changedDate);
			self.selectedDate = changedDate;
		});

		// 年份下拉框事件
		dtpNode.on("change", ".header-year", function(e) {
			var selected = $(this).val();
			var changedDate = new Date(selected, self.selectedDate.getMonth());

			self.render(changedDate);
			self.selectedDate = changedDate;
		});

		// 上一个月按钮事件
		dtpNode.on("click", ".icon-l", function(e) {
			var changedDate = changeDateByMonth(selectedDate, -1);

			self.render(changedDate);
			self.selectedDate = changedDate;
		});

		// 下一个月按钮事件
		dtpNode.on("click", ".icon-r", function(e) {
			var changedDate = changeDateByMonth(selectedDate, 1);

			self.render(changedDate);
			self.selectedDate = changedDate;
		});

		// 主页按钮事件，显示今天日期
		dtpNode.on("click", ".icon-h", function(e) {
			self.render(new Date());
			self.selectedDate = changedDate;
		});

		// 表格日期事件
		dtpNode.on("click", "td", function(e) {
			var target = $(e.target);

			// 将上次选中td的Class置空
			dtpNode.find("td.selected-date").attr("class", "");
			target.attr("class", "selected-date");

			dtpNode.hide();
			self.isShowed = false;

			var fullDate = target.attr("data-full-date");

			// 更新start元素的值 
			selfOpts.start.val(fullDate);
			self.selectedDate = new Date(target.attr("data-year"), target.attr("data-month"), target.attr("data-date"));
		});
	}
	/**
	 * 渲染组件
	 */
	DateTimePicker.prototype.render = function(initDate) {
		var self = this;
		var selfOpts = self._options;
		var tbody = "<tr>";
		var dtpNode = self.dtpNode;

		var curYear = initDate.getFullYear();
		var curMonth = initDate.getMonth();
		var curDate = initDate.getDate();
		var FirstDay = new Date(curYear, curMonth, 1); // 一个月第一天
		var WeekOfFirstDay = FirstDay.getDay(); // 一个月第一天的星期数
		var preMonth = curMonth == 0 ? 11 : (curMonth - 1);
		var nextMonth = curMonth == 11 ? 0 : (curMonth + 1);

		// 获取第一个td显示日期
		var tmpInitDate = changeDateByDay(FirstDay, -WeekOfFirstDay);
		var tmpMonth = tmpInitDate.getMonth();
		var tmpYear = tmpInitDate.getFullYear();
		var tmpDay = tmpInitDate.getDate();

		var dateCls = "other-month-day";
		var count = 0;

		// 渲染日期
		while (tmpMonth === preMonth || tmpMonth === curMonth || tmpMonth === nextMonth) {
			tmpMonth = tmpInitDate.getMonth();
			tmpYear = tmpInitDate.getFullYear();
			tmpDate = tmpInitDate.getDate();

			if (tmpMonth === curMonth) {
				dateCls = curDate === tmpDate ? "selected-date" : "";
			} else {
				dateCls = "other-month-day";
			}
			tbody += '<td data-date="' + tmpDate + '" data-month="' + tmpMonth +
				'" data-year="' + tmpYear + '" class="' + dateCls + '" data-full-date="' + formatDate(tmpInitDate, selfOpts.formatDate) +
				'" data-index="' + count + '">' + tmpDate + '</td>';
			if (tmpInitDate.getDay() === 6) {
				tbody += "</tr>";
			}

			// 日期往后加一天
			tmpInitDate = changeDateByDay(tmpInitDate, 1);
			tmpMonth = tmpInitDate.getMonth();

			// 如果到了下个月，且星期为0，且超过了3行，就结束循环
			if (tmpMonth === nextMonth && count > 27 && tmpInitDate.getDay() === 0) {
				break;
			}
			count++;
		}

		dtpNode.find(".data-calendar tbody").html(tbody);

		// 渲染年份
		var yearSelect = dtpNode.find(".header-year");
		var created = yearSelect.find("option");
		if (!created[0]) {
			var tmpStr = '';
			var end = selfOpts.yearEnd;
			for (var i = selfOpts.yearStart; i <= end; i++) {
				tmpStr += '<option value="' + i + '" class="year-op-' + i + '">' + i + '</option>';
			}
			yearSelect.html(tmpStr);
		}

		var lastSelected = yearSelect.find("option:selected");
		var curSelected = yearSelect.find(".year-op-" + curYear);
		if (lastSelected !== curSelected) {
			lastSelected.removeAttr("selected");
			curSelected.attr("selected", "selected");
		}

		// 渲染月份
		var monthSelect = dtpNode.find(".header-month");
		var created = monthSelect.find("option");
		if (!created[0]) {
			var tmpStr = '';
			var monthSelectArr = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
			for (var i = 0, len = monthSelectArr.length; i < len; i++) {
				tmpStr += '<option value="' + monthSelectArr[i] + '" class="month-op-' + i + '">' + monthSelectArr[i] + '</option>';
			}
			monthSelect.html(tmpStr);
		}

		lastSelected = monthSelect.find("option:selected");
		curSelected = monthSelect.find(".month-op-" + curMonth);
		if (lastSelected !== curSelected) {
			lastSelected.removeAttr("selected");
			curSelected.attr("selected", "selected");
		}

	}
	/**
	 * 生成展示元素
	 */
	DateTimePicker.prototype.createElem = function() {
		var self = this;

		var tempNode = '<div class="rgb-dtp dtp-' + new Date().getTime() + '" style="display:none;">';
		tempNode += template + "</div>";
		tempNode = $(tempNode);
		$(document.body).append(tempNode);

		return tempNode;
	};
	/**
	 * 定位组件
	 */
	DateTimePicker.prototype.setPosition = function() {
		var self = this;
		var selfOpts = self._options;
		var startElem = selfOpts.start;
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
		self.dtpNode.css({
			'position': 'absolute',
			'top': parseFloat(startOffset.top) + parseFloat(startElem.height()) + 5 + 'px',
			'left': parseFloat(startOffset.left) + 'px',
			'z-index': '99999'
		});
	}
	/**
	 * 按天变更时间，num表示天数，负数表示向前
	 */

	function changeDateByDay(date, num) {
		if (!date) {
			return;
		}

		num = num || 0;

		return new Date(date.getFullYear(), date.getMonth(), date.getDate() + num);

	}
	/**
	 * 按月变更时间，num表示月数，负数表示向前
	 */

	function changeDateByMonth(date, num) {
		if (!date) {
			return;
		}

		num = num || 0;

		return new Date(date.getFullYear(), date.getMonth() + num, date.getDate());

	}
	/**
	 * 格式化日期
	 */

	function formatDate(date, fmt) {
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
	}
	/**
	 * 将已经格式化的时间字符串转化为时间格式
	 */

	function unformatDate(str, fmt) {
		if (!str) {
			return;
		}
		fmt = fmt || "YYYY-MM-DD";
		var year = str.substr(/(Y+)/i.exec(fmt).index, RegExp.$1.length) || new Date().getFullYear(),
			month = str.substr(/(M+)/i.exec(fmt).index, RegExp.$1.length) || new Date().getMonth(),
			date = str.substr(/(D+)/i.exec(fmt).index, RegExp.$1.length) || new Date().getDate();
		return new Date(year, month - 1, date);
	}
	/**
	 * 将对象s上的属性合并到对象r上
	 */

	function mix(s, r) {
		for (var k in r) {
			if (r.hasOwnProperty(k)) {
				s[k] = r[k];
			}
		}

		return s;
	}

	return DateTimePicker;
}());