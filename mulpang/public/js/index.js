// 페이지 로딩 후 호출되는 함수 지정
$(function(){
	setDetailEvent();
});

// 쿠폰 상세보기 이벤트와 상세보기 닫기 이벤트를 추가한다.
function setDetailEvent(){
	$('.preview > .list_img, .preview > .detail_img').click(function(e){
		console.log('click~~');
		var coupon = $(e.target).parents('article');
		couponDetail( coupon );
	});
}

// 쿠폰 상세 정보를 보여준다.
function couponDetail( coupon ){
	detailSlide(coupon);
}

// 쿠폰 상세보기 스타일로 전환한다.
function detailSlide(coupon){
	if( coupon.hasClass('preview') ){
		coupon.removeClass('preview').addClass('detail');
	}else if( coupon.hasClass('detail') ){
		coupon.removeClass('detail').addClass('preview');
	}
}