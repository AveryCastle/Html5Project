/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes/router.js'), http = require('http'), path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
//app.set('view engine', 'jade'); // 1st modified
app.set('view engine', 'html');
app.set('layout', true);
app.engine('.html', require('jqtpl/lib/express').render); // express 3.4.4 version or later
//app.engine('.html', require('jqtpl').__express);	// express 3.3.1 version or less
//app.locals.layout = true;	//layout.html을 템플릿으로 사용함.


app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/index.html', routes.index);
app.get('/coupon_best.html', routes.best);
app.get('/coupon_location.html', routes.location);
app.get('/coupon_all.html', routes.all);
app.get('/*.html', routes.forward);
//app.get('/request', routes.request);
app.get('/request', function(req,res){
	// soket.io 객체를 response에 지정한다.
	res.io = io;
	routes.request(req,res);
});

//http.createServer(app).listen(app.get('port'), function() {
//	console.log('Express server listening on port ' + app.get('port'));
//});
var httpServer = http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

// socket.io 서버 구동
var io = require("socket.io").listen(httpServer);
