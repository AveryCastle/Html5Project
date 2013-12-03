// $(function(){
// 	getCouponList();
// });

$(document).ready(function(){
	getCouponList();
});

// 쿠폰 목록을 조회한다.
function getCouponList(){	
	var params = {
		cmd : "couponList"
	};
	
	$.ajax({
		url : "request",
		data : params,
		type : "get",
		dataType : "json",
		success : function(data){
			 for( var i=0; i<2; i++){
			 	var couponList = _.template( $("#tmpl_under").html(), data[i] );	
			 	$("div.coupon_list").append(couponList);
				console.log(couponList);
			 }
			// //alert(couponList);

			
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