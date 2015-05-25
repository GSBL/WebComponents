var Suggestion = function () {
	var template = '<div class="content-sidebar-search"><ul class="content-sidebar-result"></ul><input class="content-search-input" placeholder=""><a href="javascript:" class="content-search-btn">搜索</a></div>'

    var Suggestion = function (opts) {

        if (!(this instanceof Suggestion)) {
            return new this(opts);
        }
        this._options = {
            parentNode: $(document.body), // 组件添加到该节点下面
            placeholder: "", // 输入框默认值
            url: "", // 数据交互传输地址
            type: "GET",// http请求类型，默认为GET
            onSearch: function () {} // 点击搜索按钮或enter键触发的事件
        }

        // 用于存放整个suggestion
        this.componentNode = null

        this.init(opts)
    }
     /**
     * 初始化组件
     */
    Suggestion.prototype.init = function (opts) {
        var self = this

        // 更新配置项 
        mix(self._options,opts)

        // 设置suggestion节点
        self.componentNode = self.createElem()

        self.bind()
    }
    /**
     * 创建整个组件，并添加到parentNode下面
     */
    Suggestion.prototype.createElem = function () {
        var self = this 
        var selfOpts = self._options
        var tmpNode = '<div class="content-sidebar" id="content-sidebar-'+ new Date().getTime()+'">'
        tmpNode += template +'</div>'
        tmpNode = $(tmpNode)

        // 添加到parentNode下面
        var parentNode = selfOpts.parentNode
        parentNode.append(tmpNode)

        // 如果placeholder不为空，设置input默认值
        selfOpts.placeholder && tmpNode.find(".content-search-input").attr("placeholder",selfOpts.placeholder)
        
        return tmpNode
    }
    /**
     * 绑定事件
     */
    Suggestion.prototype.bind = function () {
        var self = this,
        selfOpts = self._options,
        componentNode = self.componentNode,
        resultNode = componentNode.find(".content-sidebar-result"),
        inputNode = componentNode.find(".content-search-input"),
        sidebarSearchNode = componentNode.find(".content-sidebar-search")

        // 添加input的focus、blur、enter键、input事件
        componentNode.on("focus",".content-search-input",function (e) {
            sidebarSearchNode.attr("class","content-sidebar-search focus")
            
            // 如果input不为空显示结果列表
            inputNode.val()!="" && resultNode.show()
        }).on("blur",".content-search-input",function (e) {
            if(inputNode.val() == "") {
                sidebarSearchNode.attr("class","content-sidebar-search")
                resultNode.hide()
            }
        }).on("keypress",".content-search-input",function (e) {

            // 如果按下enter键，触发onSearch
           e.keyCode === 13 && selfOpts.onSearch.call(this,self,e)
        }).on("input propertychange",".content-search-input",function () {

            // 如果input的值不为空，渲染result列表
            if(inputNode.val()!=""){
                self.render(inputNode.val())
                resultNode.show()
            }else {
                resultNode.hide() 
            } 
        })

        // 自定义点击搜索按钮之后的事件
        componentNode.on("click",".content-search-btn",function (e) {
            selfOpts.onSearch.call(this,self,e)
        })

    }
    /**
     * 渲染result列表
     */
    Suggestion.prototype.render = function (keyword) {
        var self = this,
        selfOpts = self._options,
        componentNode = self.componentNode 
        $.ajax({
            url: selfOpts.url,
            type: selfOpts.type,
            dataType: "json",
            data: {"keyword":keyword},
            // cache: false,
            success: function (dataList) {
                    var resultList = ""
                    $.each(dataList,function(i,item){
                        resultList +='<li><a href="'+item.url+'">'+item.title+'</a></li>'
                    })
                    componentNode.find(".content-sidebar-result").html(resultList)
            
            },
            error: function(xhr,textStatus, errorThrown){
                console.log(textStatus + " " + errorThrown)  
            }
        })
    }
    /**
     * 将对象s上的属性合并到对象r上
     */
    function mix(s, r) {
        for (var k in r) {
            if (r.hasOwnProperty(k)) {
                s[k] = r[k]
            }
        }

        return s
    }

    return Suggestion
}();
