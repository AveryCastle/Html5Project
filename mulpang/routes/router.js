/*
 * GET home page.
 */

exports.index = function(req, res) {
	res.render('index', {
		pageId : 'today',
		js : 'index.js'
	});
};

exports.location = function(req, res) {
	res.render('coupon_location', {
		pageId : 'location',
		js		: 'location.js'
	});
};

exports.best = function(req, res) {
	res.render('coupon_best', {
		pageId : 'best',
		js		: 'best.js'
	});
};

exports.all = function(req, res) {
	res.render('coupon_all', {
		pageId : 'all',
		layout : false
	});
};

exports.forward = function(req, res) {
	var url = req.path.substring(1);
	res.render(url, {
		layout : false
	});
};