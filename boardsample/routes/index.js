/*
 * GET home page.
 */
// 1st modified
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