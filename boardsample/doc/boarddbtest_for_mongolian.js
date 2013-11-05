var Mongolian = require("mongolian");
var clog = require("clog");
var util = require("util");

clog.configure({"log level": 5});
//{'log': true, 'info': true, 'warn': true, 'error': true, 'debug': true}

var server = new Mongolian;	// localhost
// var server = new Mongolian("mongo://localhost:27017");	// remote server

var db = server.db("boardsample");
clog.log("boardsample DB 접속.");

// 현재 DB 삭제
db.runCommand({dropDatabase: 1});

// board collection 지정
db.board = db.collection("board");

// 등록할 게시물
var b1 = {no: 1, writer: "관리자", title: "[공지]게시판 사용규칙 안내입니다.", content: "잘 쓰세요."};
var b2 = {no: 2, writer: "김철수", title: "아싸 1빠 ㅋㅋ", content: "그냥 1빠로 작성했다고.."};
var b3 = {no: 3, writer: "이영희", title: "2등이라도...", content: "2등이 어디냐 ㅋㅋ"};

// TODO 1. board 컬렉션에 데이터 등록
// insert({등록할 문서})
db.board.insert(b1);
db.board.insert(b2);
db.board.insert(b3);

// TODO 2. 모든 board 데이터의 모든 속성 조회
// find()
db.board.find().toArray(function(err, result){
	console.log('----------------------------------------------');
	console.log('2. 모든 board 데이터의 모든 속성 조회 ');		
	console.log(result);
});

// TODO 3. 데이터 조회(김철수가 작성한 게시물 조회)
// find({검색조건})
db.board.find({writer:"김철수"}).toArray(function(err, result){
	console.log('----------------------------------------------');
	console.log('3. 데이터 조회(김철수가 작성한 게시물 조회) ');		
	console.log(result);
});

// TODO 4. 모든 board 데이터의 작성자(_id 포함) 속성만 조회
// find({검색조건}, {출력컬럼})
db.board.find({}, {writer: 1}).toArray(function(err, result){
	console.log('----------------------------------------------');
	console.log('4. 모든 board 데이터의 작성자(_id 포함) 속성만 조회 ');	
	console.log(result);
});

// TODO 5. 김철수가 작성한 게시물의 제목(_id 미포함) 조회
// find({검색조건}, {출력컬럼})
db.board.find({}, {writer: 1, _id: 0}).toArray(function(err, result){
	console.log('----------------------------------------------');
	console.log('5. 김철수가 작성한 게시물의 제목(_id 미포함) 조회 ');
	console.log(result);
});

// TODO 6. 게시물 조회(1건)
// findOne()
db.board.findOne(function(err, result){
	console.log('----------------------------------------------');
	console.log('6. findOne 작성 글 : ');
	console.log( result );
});

// TODO 7. 게시물 조회(이영희가 작성한 데이터 1건 조회)
// findOne({검색조건})
db.board.findOne({writer : "이영희"}, function(err, result){
	console.log('----------------------------------------------');
	console.log('7. 이영희 작성 글 : ');
	console.log( result );
});

// TODO 8. 게시물 수정(3번 게시물의 내용 수정)
// update({검색조건}, {수정할 문서})
db.board.findOne( {no:3}, function(err, result){
	result.content = "수정된 내용";
	
	// 비동기 함수이기때문에 update 한 후, find할 수 있도록 하기 위해 callback함수 안에서 처리되도록 함.
	db.board.update({no:3}, result, function(err, result){
		db.board.findOne({writer : "이영희"}, function(err, result){
			console.log('----------------------------------------------');
			console.log('8. 시물 수정(3번 게시물의 내용 수정) ');			
			console.log( result );
		});		
	});
});

// TODO 9. 1번 게시물 조회 후 comment 추가
db.board.findOne({no:1}, function(err, result){
	result.comment = "comment inserted";
	db.board.update({no:1}, result, function(err, result){
		db.board.find().toArray(function(err, result){
			console.log('----------------------------------------------');
			console.log('9. 1번 게시물 조회 후 comment 추가');				
			console.log(result);
		});
	});
});

// TODO 10. 2번 게시물 삭제
// remove({검색 조건})
db.board.remove({no:2}, function(err, result){
	db.board.find().toArray(function(err, result){
		console.log('----------------------------------------------');
		console.log('10. 2번 게시물 삭제');		
		console.log(result);
	});	
});



















































