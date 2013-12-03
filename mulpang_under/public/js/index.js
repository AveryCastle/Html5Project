// 페이지 로딩 후 호출되는 함수 지정
$(function(){
	if($("body").attr("id") == "all"){
		$("#coupon").attr("class","list");
	}
	
	// 오늘 날짜 세팅
	$("#time > time").attr("datetime", Util.dateToString("-")).text(Util.dateToString("-"));
	
	getCouponList();	
	setSearchEvent();
	setOrderEvent();
	setSlideEvent();
});

// 쿠폰 상세보기 이벤트와 상세보기 닫기 이벤트를 추가한다.
function setDetailEvent(){
	$('.preview > .list_img, .preview > .detail_img').click(function(e){
		var coupon = $(e.target).parents('article');
		couponDetail( coupon );
	});
	$(".preview").keyup(function(e){
		if(e.target.tagName.toLowerCase() == "article" && e.keyCode == 13){
			var coupon = $(e.target);
			couponDetail( coupon );
		}
	});
	
	
	$('.btn_close_coupon_detail').click(function(e){
		var coupon = $(e.target).parents('article');
		couponPreview(coupon);
	});
}

// 쿠폰 상세 정보를 보여준다.
function couponDetail( coupon, forBuy ){
	// 상세 정보가 비어있을 경우 서버에서 가져온다.
	if(coupon.children(".coupon_tab").size() == 0){
		var params = {
				cmd: "couponDetail",
				_id: coupon.attr("data-couponid")
			};
			
			$.ajax({
				url : "request",
				data : params,
				type : "get",
				dataType : "json",
				success : function(data){
					//coupon.children(".content").after($("#tmpl_coupon_detail").tmpl(data));

					coupon.children(".content").after( _.template($("#tmpl_coupon_detail").html(), {data : data}) );	
					
					// 상세보기 호출 시 탭 이벤트를 추가한다.
					setTabEvent(coupon);
					// 쿠폰 구매이벤트를 추가한다.
					setBuyEvent(coupon);
					
					if(forBuy){	// 구매하기 용도
						showBuyForm(coupon);
					}else{ // 상세보기 용도
						hideBuyForm(coupon);
					}

					// 로그인시 구매자 email을 미노출한다.
					if (userInfo.userId != "") {
						$("input[name='email']").val(userInfo.userId);
						$("input[name='email']").attr("readonly", true);
					}else{
						$("input[name='email']").removeAttr("readonly");
					};
				}
			});		
	}
	
//	// 상세보기 상태일 경우 구매화면을 숨긴다.
	hideBuyForm(coupon);
	detailSlide(coupon);
}

// 쿠폰 상세보기 스타일로 전환한다.
function detailSlide(coupon){
	coupon.removeClass('preview').addClass('detail');
	// 상세보기 애니메이션이 끝난 후(0.5초 후) 쿠폰 목록을 숨김 처리한다.
	setTimeout("$('.coupon_list > article.preview.act').addClass('coupon_off')", 500);

}


// 쿠폰 상세정보를 닫는다.
function couponPreview(coupon){
	$('.coupon_list > article.preview.act').removeClass('coupon_off');
	coupon.removeClass('detail').addClass('preview');
	
	// 갤러리 탭을 보여준다.
	$(coupon.find(".gallery").removeClass("tab_off").siblings().addClass("tab_off"));
	
	// 상세보기나 구매페이지를 닫을 경우 상세보기와 구매페이지를 숨긴다.
	coupon.find(".coupon_tab, .buy_section").hide();
}


// 이전/다음버튼 이벤트를 등록한다.
function setSlideEvent(){
	$('#coupon_control > .btn_pre').click(function(e){
		var lastPage = Math.floor(($('div.coupon_list > article').size() + 4 )/5);
		if( page > 1 ){
			page--;
			couponSlide();
		}		
	});
	
	$('#coupon_control > .btn_next').click(function(e){
		var lastPage = Math.floor(($('div.coupon_list > article').size() + 4 )/5);
		if( page < lastPage ){
			page++;
			couponSlide();
		}		
	});
}


// 이전/다음 페이지의 쿠폰을 보여준다.
function couponSlide(){
	// act 이외의 쿠폰은 coupon_off에 의해 화면에 보이지 않게 되므로
	// 슬라이딩 효과 이전에 쿠폰을 화면에 나타나게 한다.
	$('.coupon_list > article').removeClass('coupon_off');
	
	// 화면에 나타난 후에 곧바로 애니메이션이 발생하지 않으므로 호출을 딜레이 시킨다.
	setTimeout(sliding, 0);
}

// 쿠폰을 슬라이딩 시킨다.
function sliding(){
	var firstAct = (page-1) * 5;	// 활성화쿠폰 시작 번호
	var lastAct = (page*5) - 1;		// 활성화쿠폰 마지막 번호

	// 반복문
	$('.coupon_list > article').each(function(i){
		var coupon = $(this);
		
		if( i < firstAct ){	// 이전 쿠폰
			coupon.removeClass('act next').addClass('pre coupon_off');
		}else if( i > lastAct ){	// 다음 쿠폰
			coupon.removeClass('act pre').addClass('next coupon_off');
		}else{	// 현재 보여줄 쿠폰
			coupon.removeClass('pre next').addClass('act');
		}
		
		// 쿠폰 배치 위치를 추가한다.
		coupon.addClass('p' + (i%5 + 1));
	});
}

// 상세보기의 탭 이벤트 추가
function setTabEvent(coupon){
	coupon.find("div.coupon_tab > section > h1").unbind().click(function(e){
		$(e.target).parent().removeClass("tab_off").siblings().addClass("tab_off");
	}).keyup(function(e){
		if(e.keyCode == 13){
			$(e.target).parent().removeClass("tab_off").siblings().addClass("tab_off");
		}		
	});
	
	var bigPhoto = coupon.find(".photo_list + .big_photo > img");
	
	// 갤러리 이미지 클릭시
	coupon.find("ul.photo_list img").unbind().click(function(e){
		// 브라우저의 기본동작(이미지에 링크된 동작)을 취소한다.
		e.preventDefault();
		bigPhoto.attr("src", $(e.target).parent().attr("href"));
	});	
}


// 쿠폰 목록을 조회한다.
function getCouponList(param, sorting){
	var params;

	if( typeof param != 'undefined'){
		params = param;
		params += "&cmd=couponList";
	}else{
		params = {
			cmd : "couponList"
		};
	}

	if( typeof sorting != "undefined" ){
		params += "&orderBy=" + sorting;
	}

	//console.log(params);
	
	$.ajax({
		url : "request",
		data : params,
		type : "get",
		dataType : "json",
		success : function(data){
			// var couponList = $("#tmpl_coupon_list").tmpl(data);
			// $("div.coupon_list").empty().append(couponList);
			var couponList = [];
			for( var i=0; i<data.length; i++ ){
				couponList.push(_.template($("#tmpl_coupon_list").html(), data[i]));
			}
			$("div.coupon_list").empty().append(couponList);
			//alert(couponList.length);
			var couponSizeOfLastPage = couponList.length % 5;
			if(couponList.length == 0 || couponSizeOfLastPage > 0){
				for(var i=couponSizeOfLastPage; i<5; i++){
					$('<article class="preview no_content">')
						.append("<h1>등록된 상품이 없습니다.</h1>")
						.appendTo(".coupon_list");
				}
			}
			
			page = 1;
			setDetailEvent();
			// 구매하기 버튼 클릭 이벤트를 추가한다.
			setBuyFormEvent();
			// 관심쿠폰 등록 이벤트를 추가한다.
			setAddCartEvent();
			
			sliding();			
		},
		error : function(jqXHR, error, errorThrown) {  
		            if(jqXHR.status && jqXHR.status == 400){
		                 alert(jqXHR.responseText); 
		            }else{
		                alert("Something went wrong");
		            }
		}
	});
}

// 구매버튼 클릭 이벤트를 등록한다.
function setBuyFormEvent(){
	$(".buy").unbind().click(function(e){
		// 기본동작(하이퍼 링크)하지 못 하도록 한다.
		e.preventDefault();
		
		var coupon = $(e.target).parents("article");
		if( coupon.children(".coupon_tab").size() == 0){ 
			// 상세보기 클릭 이전에 목록에서 바로 구매버튼 클릭할 경우
			couponDetail(coupon, true);
		}else{ 
			// 상세 정보를 출력한 후 다시 목록으로 왔을 때 구매 버튼을 누르면 상세화면으로 바꾼 후 구매화면을 보여준다.
			detailSlide(coupon);
			if( coupon.children(".buy_section").css("display") == "none" ){
				showBuyForm(coupon);
			}
		}
	});
}


// 구매화면을 보여준다.(구매하기 화면일 경우)
function showBuyForm(coupon){
	coupon.children(".coupon_tab").hide().next().show();
}


// 구매화면을 숨긴다. (상세화면일 경우)
function hideBuyForm(coupon){
	coupon.children(".coupon_tab").show().next().hide();
}

// 구매수량을 수정했을 때 결제가격을 다시 계산한다.
function setPrice(element, price){
	$(element).parents(".buy_section").find("output").text(Util.toCommaPrice( $(element).val() * price) );
}

// 구매하기
function setBuyEvent(coupon){
	coupon.find("form").submit(function(e){
		var params = $(this).serialize();
		console.log(params);
		$.ajax({
			url : "request",
			data : params,
			//type : "get",
			type : "post",
			dataType : "json",
			success : function(data){
				if( data == 1 ){
					alert("쿠폰 구매가 완료되었습니다.");
					window.location.href = "/";
				}else{
					alert("쿠폰 구매에 실패하였습니다.");
					window.location.reload();
				}
			},
			error : function(jqXHR, error, errorThrown) {  
	            if(jqXHR.status && jqXHR.status == 400){
	                 alert(jqXHR.responseText); 
	            }else{
	                alert("Something went wrong");
	            }
	            window.location.reload();
			}
		});
		
		// form 의 기본동작  submit을 막는다.
		return false;
	});
}

// 검색 이벤트
function setSearchEvent(){
	$("#coupon_search").submit(function(e){
		e.preventDefault();
		getCouponList($(this).serialize());
	});
}

// 정렬 이벤트 
function setOrderEvent(){
	$("#order").submit(function(event){
		event.preventDefault();
		getCouponList($("#coupon_search").serialize(), $("#list_order").val());
	});
}