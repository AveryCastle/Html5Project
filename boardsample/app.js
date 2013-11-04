/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3001);	// 1st modified
app.set('views', __dirname + '/views');
// app.set('view engine', 'jade'); // 1st modified
app.set('view engine', 'html');
app.set('layout', true);
app.engine('.html', require('jqtpl/lib/express').render);
//app.engine('.html', require('jqtpl').__express);	// 1st inserted
//app.locals.layout = true;	//layout.html을 템플릿으로 사용함.

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/detail.html', routes.detail);	// 1st modified
app.get('/list.html', routes.list);	// 1st modified

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
