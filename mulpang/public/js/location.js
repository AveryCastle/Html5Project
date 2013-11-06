Util.require("http://maps.google.com/maps/api/js?sensor=false&libraries=geometry");
// google maps api 참조 -> https://developers.google.com/maps/documentation/javascript/reference?hl=ko

/*
	1. 지도를 보여준다.
	2. 현재 위치를 찾는다.
		2.1. 지도를 현재 위치로 이동한다.
		2.2. 현재 위치의 오차를 표시한다.
		2.3. 현재 위치에 마커를 표시한다.
	3. 서버로부터 쿠폰 목록을 받아온다.
		3.1. 지도에 쿠폰 정보를 추가한다.(마커 클릭시 인포윈도우 이벤트)	
		3.2. 지도안에 쿠폰이 들어오면 슬라이더를 갱신하도록 "bounds_changed" 이벤트를 추가한다.
	4. 슬라이더를 초기화 한다.
*/

var couponCollection = [];

// 1. 지도를 보여준다.
$(function(){
	map = new google.maps.Map($("#location_map")[0], {
		mapTypeId	: google.maps.MapTypeId.ROADMAP,
		center		: new google.maps.LatLng(37.521572, 127.024084),
		zoom		: 17
	});
});

// 2. 현재 위치를 찾는다.
function showCurrentPosition(){
	// 지도에 현재 위치의 오차를 원형으로 표시하기 위한 Circle 객체
	
	
	// 2. 현재 위치를 찾는다.
	
		
	// 2.1. 지도를 현재 위치로 이동한다.
		
		
	// 2.2. 현재 위치의 오차를 표시한다.
		
		
	// 2.3. 현재 위치에 마커를 표시한다.
		
		
	// 3. 모든 쿠폰을 받아온다.
		
}

// 3. 서버로부터 쿠폰 목록을 받아온다.
function getCouponList(){
	
			
	// 쿠폰 목록을 저장한다.
	
	
	// 화면에 쿠폰을 출력한다.
	
				
	// 3.1. 지도에 쿠폰 정보를 추가한다.
		
					
	// 3.2. 지도안에 쿠폰이 들어오면 슬라이더를 갱신하도록 이벤트를 추가한다.
	
	
	// 4. 슬라이더를 초기화한다.
	
	
	// 최초로 "bounds_changed" 이벤트를 발생시켜서 슬라이더를 초기화한다.
			
}

// 3.1. 지도에 쿠폰 정보를 추가한다.(마커 클릭시 인포윈도우 이벤트)
function addCouponToMap(){
	// 쿠폰 목록만큼 반복한다.
	
		// 쿠폰의 위치정보
		
		
		// 쿠폰 마커 생성
		
		
		// 지도 클릭 시 보여줄 정보창 생성
		
	
		// 쿠폰 정보에 position을 설정
	
		
		// 쿠폰 정보에 marker를 설정
		
		
		// 쿠폰 정보에 infowindow를 설정
		
		
		// 마커 클릭 이벤트를 추가한다.
	
}

// 3.2. 지도안에 쿠폰이 들어오면 슬라이드를 갱신한다.
function addBoundsEvent(){
	// 지도 영역이 변경될 경우에 발생하는 "bounds_changed" 이벤트 처리
	
	// 모든 쿠폰을 숨긴다.			
			
	// 지도 안에 포함된 쿠폰이면 화면에 보여준다.
			
}

// 지정한 순번의 쿠폰으로 슬라이더 이동
function slide(actNo){
	
}

// 4. 슬라이더 초기화
function initSlider(){
	
	
	// 슬라이더 값이 변경될 경우의 이벤트 추가
	
	
	// 이전/이후 버튼의 클릭 이벤트 추가
	
}








