var express = require('express');
var router = express.Router();
var dataList = require('./dataList.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get("/search", function (req, res) {
	var url = require("url");
	var params = url.parse(req.url, true).query;
	var result = [];
	for (var i = 0 ,len =dataList.length;i<len;i++ ){
		if(dataList[i].title.indexOf(params.keyword)>-1){
			result.push(dataList[i]);
		}
	}
	res.json(result)
})
module.exports = router;
