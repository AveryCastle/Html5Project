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
		// 출력할 속성 목록
		var resultArray = [];
		
		if(this.params.resultAttr){
			resultArray = this.params.reusltAttr;
		}else{
			resultArray = ["couponName", "primeCost", "price", "quantity", "buyQuantity", "saleDate", "useDate", "image", "desc"];
		}
		var resultAttr = {};
		
		for( var item in resultArray ){
			resultAttr[resultArray[item]] = 1;
		}
		
		// 검색 조건
		var query = {};
		
		db.coupon.find(query, resultAttr).toArray(function(err, result){
			DaoUtil.objectIdToString(result);
			dao.callback(err, result);			
		});		
	},
	
	// 쿠폰 상세 조회
	couponDetail: function(){
		var dao = this;
		//쿠폰 아이디로 쿠폰을 조회한다.
		db.coupon.findOne({_id: new ObjectId(dao.params._id)}, function(err, coupon){
			// 쿠폰 업체를 조회한다.
			db.shop.findOne({_id : coupon.shopId}, function(err, shop){
				coupon.shop = shop;
				// 에필로그를 조회한다.
				db.epilogue.find({couponId: coupon._id}).toArray( function(err, epilogues){
					coupon.epilogues = epilogues;
					// view count를 ++1 씩 증가시킨다.
					db.coupon.update({_id : coupon._id}, {"$inc" : {viewCount : 1}}, function(err){
						// web soket으로 수정된 조회수 top5를 전송한다.
						dao.topCoupon("viewCount", function(err, result){
							// web socket으로 접속되어 있는 모든 클라이언트에게 메세지를 전송한다.
							dao.res.io.sockets.emit("websocketAnswer", result);
						});
						
						DaoUtil.objectIdToString(coupon);
						dao.callback(err, coupon);
					});
				});
			});	
		});
	},
	
	// 쿠폰 구매
	buyCoupon: function(){	
		console.log(this.params);
		
		this.params.regDate = new Date();
		this.params.couponId = new ObjectId(this.params.couponId);
		this.params.paymentInfo = {
			cardType 		: this.params.cardType,
			cardNumber 		: this.params.cardNumber,
			cardExpiredDate : this.params.cardExpireYear + this.params.cardExpireMonth,
			csv 			: this.params.csv,
			price 			: parseInt(this.params.unitPrice) * parseInt(this.params.quantity)
		};		
		
		delete this.params.cardType;
		delete this.params.cardNumber;
		delete this.params.cardExpireYear;
		delete this.params.cardExpireMonth;
		delete this.params.csv;
		delete this.params.unitPrice;
		
		var dao = this;

		//구매정보를 등록한다.
		db.purchase.insert(this.params, function(err, result){
			// 구매 건수만큼 증가시킨다.
			db.coupon.update({_id : dao.params.couponId}, {"$inc" : {buyQuantity : parseInt(dao.params.quantity)}}, function(err, updateCount){
				dao.callback(err, updateCount);
			});
		});
	},
	
	// 추천 쿠폰 조회
	topCoupon: function(condition, callback){
		var dao = this;
		
		// 검색조건
		if(!condition){ // dao에서 직접 호출할 경우 condition 파라미터를 넘긴다.
			condition = dao.params.condition;
		}
		
		// 정렬방식
		// viewCount로 오름차순, buyQuantity로 내림차순 정렬
		// var orderBy = { viewCount: 1, buyQuantity: -1 };
		var orderBy = {};
		orderBy[condition] = -1;
		
		// 출력할 속성
		var resultAttr = {couponName : 1};
		resultAttr[condition] = 1;
		clog(resultAttr);
		
		// MongoDB가 알아서 정렬시킨 후 최상위 5개를 꺼내옴
		db.coupon.find({}, resultAttr).limit(5).sort(orderBy).toArray(function(err, result){
			DaoUtil.objectIdToString(result);
			clog.log(result);
			if(callback){ // dao에서 직접 호출했을 경우
				callback(err, result);
			}else{
				dao.callback(err, result);
			}
		});
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



















