/* 로그인 기능 */

$(function(){
	if( userInfo.userId == "" ){	// 로그인 하지 않은 사용자
		$("#member_info").append(_.template($("#tmpl_login_form").html(), ''));
		//_.template($("#tmpl_login_form").html(), '').appendTo($("#member_info"));
		//$("#tmpl_login_form").tmpl().appendTo($("#member_info"));
		$("#login").submit(login);
	}else{	// 로그인한 사용자
		$("#member_info").append(_.template($("#tmpl_user_info").html(), userInfo));
		//$("#tmpl_user_info").tmpl(userInfo).appendTo($("#member_info"));
	}
});

// 로그인
function login(){
	var params = $(this).serialize();
	$.ajax({
		url			: "login",
		data		: params,
		type		: "post",
		dataType	: "json",
		success		: function(data){
						if(data.err){
							alert(data.msg);
						}else{
							alert("로그인이 완료되었습니다.");
							window.location.href = "/";
							//userInfo.profileImage = data.profileImage;
							//userInfo.userId = data._id;
						}
		},
		error		: function(jqXHR, error, errorThrown) {  
				        if(jqXHR.status && jqXHR.status == 400){
				             alert(jqXHR.responseText); 
				        }else{
				            alert("Something went wrong");
				        }			
		}
	});
	
	return false;
}