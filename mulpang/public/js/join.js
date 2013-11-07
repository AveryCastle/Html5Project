/* 회원가입 화면 */

$(function(){	
	// 프로필 이미지 선택 시(common_member.js의 uploadProfile 함수를 호출한다.)
	
	
	// 회원 가입 버튼 클릭 이벤트
	
});

// 회원 가입
function registMember(){
	var form = $(this);
	if($("#password").val() != $("#password2").val()){
		alert("비밀번호와 비밀번호 확인이 맞지 않습니다.");
	}else{
		// 회원 가입을 요청한다.
		
	}
	return false;
}