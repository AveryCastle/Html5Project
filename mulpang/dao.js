var clog = require("clog");
var util = require("util");
var fs = require("fs");

clog.configure({"log level": 5});
//{'log': true, 'info': true, 'warn': true, 'error': true, 'debug': true}

// mongolian 모듈 import
var Mongolian = require("mongolian");
var server = new Mongolian;	// local server
// var server = new Mongolian("mongo://localhost:27017");	// remote server

var db = server.db("mulpang");
clog.info("mulpang DB 접속.");

var ObjectId = Mongolian.ObjectId;
db.member = db.collection("member");
db.shop = db.collection("shop");
db.coupon = db.collection("coupon");
db.purchase = db.collection("purchase");
db.epilogue = db.collection("epilogue");

// DB Access 하는 기능의 확장 모듈
var Dao = module.exports = function(options){
	if(!options){
		options = {};
	}
	this.cmd = options.cmd;		// 요청할 작업 함수명(cf. couponList)
	this.callback = options.callback;	// 작업 완료 후 호출할 콜백함수
	this.params = options.params;	// 작업에 필요한 파라미터
	this.req = options.req;		// request
	this.res = options.res;		// response
	
	if(this.cmd){
		this[this.cmd].call(this);
	}
};

Dao.prototype = {
	// 쿠폰 목록조회(오늘)
	couponList: function(){
		var dao = this;
		console.log(this.params);
		
		db.coupon.find().toArray(function(err, result){
			dao.callback(err, result);			
		});		
	},
	
	// 쿠폰 상세 조회
	couponDetail: function(){
		
	},
	
	// 쿠폰 구매
	buyCoupon: function(){		
		
	},
	
	// 추천 쿠폰 조회
	topCoupon: function(condition, callback){
		
	},
	
	// 지정한 쿠폰 아이디 목록을 받아서 남은 수량을 넘겨준다.
	couponQuantity: function(){
		
	},
	
	// 회원 가입
	registMember: function(){
		
	},
	
	// 로그인 처리
	login: function(){
		
	},
	
	// 회원 정보 조회
	getMember: function(){		
		
	},
	
	// 회원 정보 수정
	updateMember: function(){		
		
	},
	
	// 쿠폰 후기 등록
	insertEpilogue: function(){
		
	}
};

// dao에서 사용하는 유틸리티 클래스
var DaoUtil = {};
// 지정한 객체나 객체 배열의 아이디(_id) 값을 문자열로 변환한다.
DaoUtil.objectIdToString = function(obj){
	if(obj instanceof Array){	// 배열일 경우
		for(var i=0; i<obj.length; i++){
			if(obj[i]._id != undefined){
				obj[i]._id = obj[i]._id.toString();
			}
		}
	}else if(obj instanceof Object){	// object일 경우
		if(obj._id != undefined){
			obj._id = obj._id.toString();
		}
	}
};



















