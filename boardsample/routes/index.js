/*
 * GET home page.
 */
// 1st modified
// exports.index =function(req, res){
// 	res.render('index', {
// 		name : 'sjh'
// 	});
// }

exports.list = function(req, res) {
	res.render('list', {
		title : '게시물 LIST',
		title2 : '게시물 LIST2'
	});
};

exports.detail = function(req, res) {
	res.render('detail', {
		title : '게시물 DETAIL',
		title2 : '게시물 DETAIL2'
	});
};