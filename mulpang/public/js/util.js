/* 유틸리티 */

var Util = {
	// 지정한 URL의 스크립트를 읽어온다.
	require: function(url){
		if(url.indexOf("http://") != 0){	// 내부 URL
			url = "/js/" + url;
		}
		document.write('<script src="' + url + '"></script>');
	},
	// 두 날짜간의 시간차를 구한다.
	// date2가 지정되지 않을 경우 현재 시간을 기준으로 한다.
	getTimeDifference: function(date1, date2){
		if(typeof date1 == "string"){
			date1 = new Date(date1);
		}
		if(date2){
			if(typeof date2 == "string"){
				date2 = new Date(date2);
			}
		}else{
			date2 = new Date();
		}
		var term = date1 - date2;
		var hours = Math.floor(term/(1000*60*60));
		var mins = Math.floor((term-hours*(1000*60*60))/(1000*60));
		var secs = Math.floor((term-hours*(1000*60*60)-mins*(1000*60))/(1000));

		//var result = hours + ":" + mins + ":" + secs + "초";
		var result = hours + "시간 " + mins + "분";
		console.log(result);
		return result;
	},
	
	// 지정한 날짜(Date)를 yyyy년 MM월 dd일 포맷으로 반환한다.
	// 날짜를 지정하지 않으면 현재의 날짜를 기준으로 반환한다.
	dateToYYYYMMDD: function(date){
		if(date){
			if(typeof date == "string"){
				date = new Date(date);
			}
		}else{
			date = new Date();
		}
		var result = date.getFullYear() + "년 " + (date.getMonth()+1) + "월 " + date.getDate() + "일";
		return result;
	},
	dateToString: function(delimiter, date){
		if(date){
			if(typeof date == "string"){
				date = new Date(date);
			}
		}else{
			date = new Date();
		}
		var result = date.getFullYear() + delimiter + (date.getMonth()+1) + delimiter + date.getDate();
		return result;
	},
	
	// 점수를 별로 환산한다.
	toStar: function(satisfaction){
		var star = "";
		for(var i=0; i<satisfaction; i++){
			star += "★";
		}
		for(var i=satisfaction; i<5; i++){
			star += "☆";
		}
		return star;
	}
};

// Map을 구현
Util.Map = function(){
	this.couponList = {};
	this.put = function(key, value){
		couponList[key] = value;
	};
	this.get = function(key){
		return couponList[key];
	}
};



// jQuery 확장
jQuery.fn.serializeObject = function(){
	var obj = new Object();
	var arr = this.serializeArray();
	for(var i in arr){
		var paramObj = arr[i];
		obj[paramObj.name] = paramObj.value;
	}
	return obj;
};

// 지정한 요소를 포함한 html 코드를 반환한다.
jQuery.fn.outerHtml = function(){
	var result = "";
	this.each(function(){
		result += this.outerHTML;
	});
	return result;
};