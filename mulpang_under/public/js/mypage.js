/* 마이페이지 화면 */

$(function(){
	showMember();
	
	// 프로필 이미지 선택 시(common_member.js의 uploadProfileImage 함수를 호출한다.)
	$("#profile").change(uploadProfileImage);
	
	// 정보 수정 버튼 클릭 시
	$("#join_section form").submit(updateMember);
});

// 회원 정보를 보여준다.
function showMember(){
	var params = {
		cmd: "getMember"
	};
	
	$.ajax({
		url: "request",
		dataType: "json",
		data: params,
		type: "get",
		success: function(result){
			if(result.err){
				alert(result.msg);
				window.location.href = "/";
			}else{
				// 회원 정보 출력
				//var coupon = $("#tmpl_mycoupon").tmpl(result.coupon);
				_.each(result.coupon, function(coupon){
					$("#my_coupon_section").append( _.template($("#tmpl_mycoupon").html(), coupon) );
				});

				// 상품 후기 등록 이벤트
				$("#epilogue_form").submit(registEpilogue);
			}
		}
	});
}

// 회원 정보를 수정한다.
function updateMember(){
	var form = $(this);
	if($("#password").val() != $("#password2").val()){
		alert("새 비밀번호와 새 비밀번호 확인이 맞지 않습니다.");
	}else{
		var params = form.serialize();
		console.log(params);
		$.ajax({
			url: "request",
			data: params,
			type: "post",
			success: function(result){
				if(result.err){
					alert(result.msg);
				}else{
					alert("회원 정보 수정이 완료되었습니다.");
					window.location.reload();
				}
			}
		});
	}
	return false;
}

// 상품후기 입력
function registEpilogue(){
	var form = $(this);
	var params = form.serialize();
	$.ajax({
		url: "request",
		data: params,
		type: "post",
		success: function(result){
			if(result.err){
				alert(result.msg);
			}else{
				alert("쿠폰 후기 등록이 완료되었습니다.");
				window.location.reload();
			}
		}
	});
	
	return false;
}