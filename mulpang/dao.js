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
	
	// 지정한 쿠폰 아이디 목록을 받아서 남은 수량을 넘겨준다.(Polling방식 : Client가 주기적으로 Server에 요청하고 응답 받는 방식)
	couponQuantity: function(){
		// 쿠폰 목록이 ","를 구분자로 하나의 문자열로 전달되므로 ","를 기준으로 자른다.
		var idArray = this.params.couponIdList.split(",");
		var idObjArray = [];
		for(var i=0; i<idArray.length; i++){
			idObjArray.push(new ObjectId(idArray[i]));
		}
		
		var dao = this;
		// 쿠폰아이디 배열에 포함된 쿠폰을 조회한다. 
		db.coupon.find({_id: {"$in": idObjArray}}, {quantity: 1, buyQuantity: 1, couponName: 1}).toArray(function(err, list){
			DaoUtil.objectIdToString(list);
			
			// Server-Sent Events 형식의 응답 헤더 설정
			dao.res.contentType("text/event-stream");
			dao.res.write('data: ' + JSON.stringify(list));
			dao.res.write("\n\n");
			dao.res.write("retry: " + 1000*10);
			dao.res.write("\n");
			dao.res.end();
		});
	},

	// 회원 가입
	registMember: function(){
		// 임시로 저장한 프로필 이미지를 실제 이미지로 변경한다.
		var tmpDir = __dirname + "/public/tmp/";
		var tmpFileName = this.params.tmpFileName;
		var profileDir = __dirname + "/public/image/member/";		
		var profileFileName = this.params._id + "." + tmpFileName.split(".")[1];	// 이메일.이미지확장자
		this.params.profileImage = "member/" + profileFileName;	// DB에 등록할 프로필이미지를 지정한다.
		
		delete this.params.tmpFileName;
		
		this.params.regDate = new Date();
		var dao = this;
		db.member.insert(this.params, function(err, member){
			if(err){
				console.log(err.result.code);
			}
			
			if(err && err.result.code == 11000){	// 아이디 중복일 경우 발생하는 에러
				var errMsg = {
					err: err.result.code,
					msg: dao.params._id + "는 이미 등록된 이메일 입니다."
				};
				dao.callback(null, errMsg);	// router에서 에러가 있으면 응답하지 않으므로 null로 세팅
			}else{
				// 임시 이미지를 실제 경로에 이미지로 변경
				fs.rename(tmpDir + tmpFileName, profileDir + profileFileName, function(err){
					dao.callback(err, member);
				});
			}
		});
	},
	
	// 로그인 처리
	login: function(){
		var dao = this;
		// 지정한 아이디와 비밀번호로 회원을 조회한다.
		db.member.findOne(this.params, {_id: 1, profileImage: 1}, function(err, member){
			if(member){
				dao.callback(err, member);
			}else{
				var errMsg = {
					err: "아이디 비번 오류",
					msg: "아이디와 비밀번호를 확인하시기 바랍니다."
				};
				dao.callback(null, errMsg);
			}
		});
	},
	
	// 회원 정보 조회
	getMember: function(){		
		this.params._id = this.req.session.userId;
		var dao = this;
		if(this.params._id == undefined){	// 세션에 아이디가 없을 경우
			var err = {result: {err: "에러", msg: "로그인이 필요한 서비스입니다."}};
			dao.callback(err);
		}else{			
			// 회원 정보를 가져온다.
			db.member.findOne(this.params, {_id: 1, profileImage: 1}, function(err, member){
				var query = {email: dao.params._id};
				var resultAttr = {_id: 0, couponId: 1};
				var orderBy = {regDate: -1};
				
				// 회원의 구매 정보를 가져온다.
				db.purchase.find(query, resultAttr).sort(orderBy).toArray(function(err, couponList){					
					var couponIdArray = [];
					for(var i=0; i<couponList.length; i++){
						couponIdArray.push(couponList[i].couponId);
					}

					// 구매한 쿠폰 정보를 가져온다.
					db.coupon.find({_id: {"$in": couponIdArray}}, {couponName: 1, image: 1, regDate: 1}).toArray(function(err, couponList){
						
						// 해당 회원이 구매한 쿠폰의 후기 정보를 가져온다.
						db.epilogue.find({couponId: {"$in": couponIdArray}, writer: member._id}, {couponId: 1, content: 1, satisfaction: 1, regDate: 1}).toArray(function(err, epilogueList){
							DaoUtil.objectIdToString(couponList);
							
							// 쿠폰 정보에 후기 정보를 추가한다.
							while(epilogue = epilogueList.shift()){
								for(var i=0; i<couponList.length; i++){
									if(couponList[i]._id == epilogue.couponId.toString()){										
										couponList[i].epilogue = epilogue;
										break;
									}
								}
							}							
							member.coupon = couponList;
							
							dao.callback(err, member);
						});
					});
				});
			});
		}
	},
	
	// 회원 정보 수정
	updateMember: function(){		
		var oldPassword = this.params.oldPassword;	// 이전 비밀번호	
		delete this.params.oldPassword;
		
		var dao = this;
		
		if(this.params._id == undefined){	// 세션에 아이디가 없을 경우
			var err = {result: {err: "에러", msg: "로그인이 필요한 서비스입니다."}};
			dao.callback(err);
		}else{	
			// 이전 비밀번호로 회원 정보를 조회한다.
			db.member.findOne({_id: this.params._id, password: oldPassword}, function(err, member){
				if(!member){	// 회원 정보가 조회되지 않을 경우
					var err = {err: "에러", msg: "비밀번호가 맞지 않습니다."};
					dao.callback(null, err);
				}else{
					if(dao.params.password.trim() != ""){	// 패스워드를 변경할 경우
						member.password = dao.params.password;
					}
					
					if(dao.params.tmpFileName){	// 프로필 이미지를 변경할 경우
						// 임시로 저장한 프로필 이미지를 실제 이미지로 변경한다.
						var tmpDir = __dirname + "/public/tmp/";
						var tmpFileName = dao.params.tmpFileName;
						var profileDir = __dirname + "/public/image/member/";						
						var profileFileName = dao.params._id + "." + tmpFileName.split(".")[1];	// 이메일.이미지확장자	
							
						// 임시 이미지를 실제 경로에 이미지로 변경
						fs.rename(tmpDir + tmpFileName, profileDir + profileFileName);
						member.profileImage = "member/" + profileFileName;
					}
					
					// 회원 정보를 수정한다.
					db.member.update({_id: member._id}, member, function(err, result){
						// 세션에 프로필 이미지 경로를 저장한다.
						dao.req.session.profileImage = member.profileImage;
						dao.callback(err, result);
					});
				}
			});
		}
	},
	
	// 쿠폰 후기 등록
	insertEpilogue: function(){
		this.params.regDate = new Date();	// 등록일
		this.params.couponId = new ObjectId(this.params.couponId);
		var dao = this;
		db.epilogue.insert(this.params, function(err, epilogueObj){
			// 후기 등록에 성공했을 경우
			// 쿠폰 컬렉션의 후기 수와 만족도 합계를 업데이트 한다.
			db.coupon.update({_id: dao.params.couponId}, {"$inc": {epilogueCount: 1}, "$inc": {satisfactionSum: parseInt(dao.params.satisfaction)}}, function(err, result){
				DaoUtil.objectIdToString(epilogueObj);
				dao.callback(err, epilogueObj);
			});
		});
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



















