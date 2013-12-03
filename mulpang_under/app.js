/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes/router.js');
var http = require('http');
var path = require('path');
//var cons = require('consolidate');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
//app.set('view engine', 'jade'); // 1st modified
app.set('view engine', 'html');

app.engine('.html', require('jqtpl/lib/express').render); // express 3.4.4 version or later
//app.engine('.html', require('jqtpl').__express);	// express 3.3.1 version or less
//app.engine('.html', cons.underscore);
//app.locals.layout = true;	//layout.html을 템플릿으로 사용함.
app.set('layout', true);

app.use(express.favicon());
//app.use(express.logger('dev'));

// request의 body를 parsing하는 역할
//app.use(express.bodyParser());
//post 방식의 요청을 처리할 때 body에 전달되는 쿼리스트링을 파싱한다.
//기본은 req.body 속성에 쿼리스트링을 저장한다.
app.use(express.bodyParser({
	uploadDir: __dirname + "/public/tmp",	// 파일 업로드일 경우 임시로 저장할 경로
	keepExtensions: true
}));

app.use(express.cookieParser());	// 쿠키 사용(세션을 사용하기 위해서 필수로 사용)
app.use(express.session({secret: "keyboard cat", cookie: {maxAge: 1000*60*30}}));	// 세션 사용(30분)



app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/index.html', routes.index);

//app.get('/coupon_best.html', routes.best);
//app.get('/coupon_location.html', routes.location);
app.get('/coupon_all.html', routes.all);

// 프로필 이미지 임시 업로드용(post 방식)
app.post('/upload', routes.upload);
// 로그인 요청시 사용
app.post('/login', routes.login);
//로그아웃 요청시 사용
app.get('/logout.html', routes.logout);

app.get('/*.html', routes.forward);

//app.get('/request', routes.request);
app.get('/request', function(req,res){
	// soket.io 객체를 response에 지정한다.
	res.io = io;
	routes.request(req,res);
});
// post방식 전달
app.post('/request', routes.request);

//http.createServer(app).listen(app.get('port'), function() {
//	console.log('Express server listening on port ' + app.get('port'));
//});
var httpServer = http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

// socket.io 서버 구동
var io = require("socket.io").listen(httpServer);
