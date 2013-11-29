/*
 * GET home page.
 */

var Dao = require("../dao.js");
var util = require("util");
var clog = require("clog");

exports.index = function(req, res) {
	res.render('index', {
		pageId : 'today',
		js : 'index.js',
		userId : req.session.userId,
		profileImage : req.session.profileImage
	});
};

//exports.location = function(req, res) {
//	res.render('coupon_location', {
//		pageId : 'location',
//		js		: 'location.js'
//	});
//};
//
//exports.best = function(req, res) {
//	res.render('coupon_best', {
//		pageId : 'best',
//		js		: 'best.js'
//	});
//};

exports.all = function(req, res) {
	res.render('index', {
		pageId : 'all',
		js		: 'index.js',
		userId : req.session.userId,
		profileImage : req.session.profileImage
	});
};

exports.forward = function(req, res) {
	var url = req.path.substring(1);
	
//	res.render(url, {
//		layout : false
//	});	
	// coupon_location.html -> location.html
	var pageId = url.substring(url.indexOf("_")+1);
	// location.html -> location
	pageId = pageId.substring(0, pageId.lastIndexOf("."));
	res.render(url, {pageId: pageId
					, js: pageId+".js"
					, userId : req.session.userId
					, profileImage : req.session.profileImage});
};

// 모든  Ajax 통신 요청시 호출할 라우터
exports.request = function(req, res){
	var params = {};
	if(req.method == "GET"){	// GET 방식 요청일 경우 쿼리스트링은 req.query에 저장된다.
		params = req.query;
	}else if(req.method == "POST"){	// POST 방식 요청일 경우 쿼리스트링은 req.body에 저장된다.
		params = req.body;
	}
	
	clog.info("[router]", util.inspect(params));
	
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

// 프로필 이미지 임시 업로드
exports.upload = function(req,res){
	// app.js의 bodyParser 설정에서 지정한 임시 파일 경로에서 파일명을 찾아서 응답메세지로 전달한다.
	// 이후에 실제 회원가입이나 수정 시 임시로 만들어서 응답한 파일명이 tmpFileName 파라미터로 전달된다.
	var tmpName = req.files.profile.path.split("\/tmp\/");
	clog.info(tmpName);
	tmpName = tmpName[tmpName.length-1];	// 배열의 마지막에 있는 파일명
	clog.info('tmpName' + tmpName);
	res.send(tmpName);
};


// 로그인시 사용 라우터(세션 처리를 추가적으로 지정한다.)
exports.login = function(req,res){
	new Dao({
		cmd: "login",
		params: req.body,
		callback: function(err, result){
			if(err){
				clog.error("[router login]", util.inspect(err));
				res.json(err.result);
			}else{
				req.session.userId = result._id;
				req.session.profileImage = result.profileImage;
				res.json(result);
			}
		}
	});
};

//로그인시 사용 라우터(세션 처리를 추가적으로 지정한다.)
exports.logout = function(req,res){
	// 세션을 삭제한다.
	req.session.destroy();
	// 홈으로 리다이렉트 시킨다
	res.redirect("/");
};