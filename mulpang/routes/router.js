/*
 * GET home page.
 */

var Dao = require("../dao.js");
var util = require("util");
var clog = require("clog");

exports.index = function(req, res) {
	res.render('index', {
		pageId : 'today',
		js : 'index.js'
	});
};

exports.location = function(req, res) {
	res.render('coupon_location', {
		pageId : 'location',
		js		: 'location.js'
	});
};

exports.best = function(req, res) {
	res.render('coupon_best', {
		pageId : 'best',
		js		: 'best.js'
	});
};

exports.all = function(req, res) {
	res.render('coupon_all', {
		pageId : 'all',
		layout : false
	});
};

exports.forward = function(req, res) {
	var url = req.path.substring(1);
	res.render(url, {
		layout : false
	});
};

// 모든  Ajax 통신 요청시 호출할 라우터
exports.request = function(req, res){
	var params = {};
	if(req.method == "GET"){	// GET 방식 요청일 경우 쿼리스트링은 req.query에 저장된다.
		params = req.query;
	}else if(req.method == "POST"){	// POST 방식 요청일 경우 쿼리스트링은 req.body에 저장된다.
		params = req.body;
	}
	
	var cmd = params.cmd;
	delete params.cmd;
	
	new Dao({
		cmd: cmd,
		params: params,
		req: req,
		res: res,
		callback: function(err, result){
			if(err){
				clog.error("[router]", util.inspect(err));
			}else{
				res.json(result);
			}
		}
	});
}