/* 장바구니 기능 */

$(function(){
	showCart();
	requestQuantity();
});

// 관심쿠폰을 보여준다.
function showCart(){
	var cart = window.localStorage.getItem("cart");
	if(cart != null){//관심쿠폰이 등록되어 있을 경우
		cart = JSON.parse(cart);
		
//		<li><a href="#"><img src="image/photo/coupon_01.jpg" width="48" height="28" alt="백운냉면"></a></li>
		$("#cart > ul").empty();
		$.each(cart, function(){
			var cartElement = '<li data-couponid="'+this.couponId+'"><a href="#"><img src="'+this.couponImg+'" width="48" height="28" alt="'+this.couponName+'"></a><button class="cart_close">관심쿠폰 삭제</button></li>';
			$("#cart > ul").append(cartElement);
		});
		
		// 관심쿠폰 갯수 표시
		$("#cart > .interest_cnt").text(cart.length);
		setRemoveCartEvent();
		
	}
}

// 관심쿠폰 등록 이벤트
function setAddCartEvent(){
	$(".btn_add_cart").unbind().click(function(e){
		var coupon = $(this).parent("article");
		addCart(coupon);
	});
}

// 관심 쿠폰 등록(로컬 스토리지에 저장)
function addCart(coupon){
	var couponId = coupon.attr("data-couponid");
	var couponName = coupon.children("h1").text();
	var couponImg = coupon.children(".list_img").attr("src");
	
	// 알림메세지 승인 요청
	if(window.webkitNotifications){
		window.webkitNotifications.requestPermission();
	}
	
	
	// 배열임
	var cart = window.localStorage.getItem("cart");	
	if( cart == null ){		
		cart = [];
	}else{
		cart = JSON.parse(cart);
	}	
	
	if(cart.length == 5){
		alert("관심 상품은 최대 5개 까지만 등록 가능합니다.");
		return;
	}
	
	// 중복 여부 체크
	var duplicate = false;
	for(var i=0; i<cart.length; i++){
		if(couponId == cart[i].couponId){	// 중복
			duplicate = true;
			break;
		}
	}
		
	if(duplicate){
		alert(couponName + "은(는) 이미 등록되어 있습니다.");
	}else{
		cart.push({
			couponId	: couponId,
			couponName	: couponName,
			couponImg	: couponImg,
			noti		: true // 알림서비서를 위해서 초기값  true로 설정
		});
		
		window.localStorage.setItem("cart", JSON.stringify(cart));
		showCart();
		requestQuantity();
		alert(couponName + " 이(가) 등록되었습니다.");
		
	}
}

// 관심쿠폰 삭제 이벤트(서버에게 POLILING 요청ㅇ르 함다)
function setRemoveCartEvent(){
	$(".cart_close").unbind().click(function(){		
		var couponId = $(this).parents("li").attr("data-couponId");
		var cart = window.localStorage.getItem("cart");
		if(cart == null){	// 최초로 등록할때
			cart = [];
		}else{
			cart = JSON.parse(cart);
		}
		
		for(var i=0; i<cart.length; i++){
			if(couponId == cart[i].couponId){
				cart.splice(i, 1);
				window.localStorage.setItem("cart", JSON.stringify(cart));
				showCart();
				break;
			}
		}
		requestQuantity();
	});	
}


var es = null;
// 관심쿠폰의 남은 수량을 받아서 10개 미만일 경우 알림 메세지를 보여준다.
function requestQuantity(){
	var cart = JSON.parse(window.localStorage.getItem("cart"));
	if( cart != null && cart.length > 0 ){
		var couponIdList = [];
		$.each(cart, function(){
			couponIdList.push(this.couponId);
		});
		
		// SSE 요청 시작
		if( es != null ){
			es.close();
		}
		es = new EventSource("request?cmd=couponQuantity&couponIdList=" + couponIdList);
		es.onmessage = function(me){
			//console.log(me.data);
			// 서버의 응답 처리
			$.each(JSON.parse(me.data), function(i){
				var resultCoupon = this;
				// 남은 갯수
				var count = resultCoupon.quantity - resultCoupon.buyQuantity;
				if(count < 10){
					$.each(cart, function(i){
						cartCoupon = this;
						if(resultCoupon._id == cartCoupon.couponId && cartCoupon.noti == true){
							var msg = cartCoupon.couponName + " 수량이 " + count + "개 밖에 남지 않았습니다.";
							showNoti({
								img: cartCoupon.couponImg,
								msg: msg
							});
							cartCoupon.noti = false;
							window.localStorage.setItem("cart", JSON.stringify(cart));
						}
					});
				}
			});
		};
	}	
}

// 바탕화면 알림 서비스를 보여준다.
function showNoti(notiMsg){	
	// 알림메세지 출력
	if(window.webkitNotifications 
		&& window.webkitNotifications.checkPermission() == 0){
		window.webkitNotifications.createNotification(notiMsg.img, "마감임박!!!", notiMsg.msg).show();
	}	
}


















