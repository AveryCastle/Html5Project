// RGraph(http://www.rgraph.net) 라이브러리를 import 한다.
Util.require("lib/rgraph/RGraph.common.core.js");
Util.require("lib/rgraph/RGraph.common.dynamic.js");
Util.require("lib/rgraph/RGraph.hbar.js");

// Chart.js(http://www.chartjs.org) 라이브러리를 imoprt 한다.
Util.require("lib/Chart.js");

// Flotr2(http://humblesoftware.com/flotr2) 라이브러리를 imoprt 한다.
Util.require("lib/flotr2.js");

// socket.io 라이브러리
Util.require("lib/socket.io.js");

$(function(){
//	var sampleData = [{couponName: "와플세트", buyQuantity: 345}
//					, {couponName: "베스킨라빈스", buyQuantity: 245}
//					, {couponName: "일말에", buyQuantity: 128}
//					, {couponName: "자연산 활어회", buyQuantity: 99}
//					, {couponName: "치맥", buyQuantity: 50}];
//	
//	drawSaleGraph(sampleData);
//	drawPointGraph(sampleData);
//	drawViewGraph(sampleData);
//	drawReplyGraph(sampleData);
	
	// 판매량
	$.ajax({
		url	: "request",
		dataType	: "json",
		type		: "get",
		data		: { cmd : "topCoupon", condition : "buyQuantity"},
		success		: function(data){
			drawSaleGraph(data);
		},
		error		: function(jqXHR, error, errorThrown){
            if(jqXHR.status && jqXHR.status == 400){
                alert(jqXHR.responseText); 
           }else{
               alert("Something went wrong");
           }			
		}
	});
	
	// 평가순
	$.ajax({
		url			: "request",
		dataType	: "json",
		type		: "get",
		data		: { cmd : "topCoupon", condition : "satisfactionAvg"},
		success		: function(data){
			drawPointGraph(data);
		},
		error		: function(jqXHR, error, errorThrown){
            if(jqXHR.status && jqXHR.status == 400){
                alert(jqXHR.responseText); 
           }else{
               alert("Something went wrong");
           }			
		}
	});
	
	// 조회순
	$.ajax({
		url	: "request",
		dataType	: "json",
		type		: "get",
		data		: { cmd : "topCoupon", condition : "viewCount"},
		success		: function(data){
			drawViewGraph(data);
		},
		error		: function(jqXHR, error, errorThrown){
            if(jqXHR.status && jqXHR.status == 400){
                alert(jqXHR.responseText); 
           }else{
               alert("Something went wrong");
           }			
		}
	});
	
	// 에필로그순
	$.ajax({
		url	: "request",
		dataType	: "json",
		type		: "get",
		data		: { cmd : "topCoupon", condition : "epilogueCount"},
		success		: function(data){
			drawReplyGraph(data);
		},
		error		: function(jqXHR, error, errorThrown){
            if(jqXHR.status && jqXHR.status == 400){
                alert(jqXHR.responseText); 
           }else{
               alert("Something went wrong");
           }			
		}
	});
	
	// web socket server 연결
	socket = io.connect("/");	// 로컬 서버일 경우
	//socket = io.connect("http://localhost:3000"); // 외부서버일 경우
	socket.on("websocketAnswer", function(data){
		drawViewGraph(data);
	});
	
});

// 판매순 그래프를 그린다.(Canvas)
function drawSaleGraph(data){
	var context = $("#graph_by_sale")[0].getContext("2d");
	
	//x, y축 그리기
	context.beginPath();
	context.moveTo(70,10);
	context.lineTo(70,230);
	context.lineTo(470,230);
	context.stroke();
	
	// 막대 그래프 그리기
	var r = 210 / data[0].buyQuantity;	// 높이 비율
	var barW = 50;	// 막대기 가로크기
	var gap = 25;	// 막대기 간격
	
	$.each(data, function(i){
		var x = (barW + gap) * i + gap + 60;
		var barH = this.buyQuantity * r;
		var y = 230 - barH;
		
		context.fillStyle = "rgba(186, 68, 10, 0."+(7-i)+")";
		context.fillRect(x, y, barW, barH);
		
		// 텍스트
		context.font = "12px '돋움, dotum, 굴림, gulim, sans-serif'";
		context.fillStyle = "black";
		context.textAlign = "center";
		context.fillText(this.couponName, x + barW/2, 246);
		context.fillText(this.buyQuantity, x + barW/2, y-3);		
	});

}


// 평가순 그래프를 그린다.(RGraph)
function drawPointGraph(data){
	var labels = [], counts = [];
	
	$.each(data, function(){
		labels.push(this.couponName);
		counts.push(this.satisfactionAvg);
	});
	
	var hbar = new RGraph.HBar("graph_by_point", counts);
	hbar.Set("chart.labels", labels);
	hbar.Set("strokestyle", "white");
	hbar.Set("shadow", true);
	hbar.Set("shadow.blur", 10);
	hbar.Set("linewidth", 1);
	hbar.Set("chart.vmargin", 7);
	hbar.Set("chart.gutter.left", 100);
	hbar.Set("chart.background.barcolor1", "white");
	hbar.Set("chart.background.barcolor2", "white");
	hbar.Set("chart.background.grid", true);
	hbar.Set("colors", ["Gradient(white:rgba(153, 208, 249, 0.5))"]);	
	hbar.Draw();
}


// 조회순 그래프를 그린다.(Chart.js)
var beforeCoupons = [];
var beforeCounts = [];
var animation = true;
function drawViewGraph(data){
	var labels = [], counts = [];
	
	if(beforeCoupons.length > 0){
		var couponChanged = false;
		$.each(data, function(i, coupon){
			console.log(i + ": " + beforeCoupons[i] + ", " + coupon._id);
			if(beforeCoupons[i] != coupon._id){
				couponChanged = true;
				beforeCoupons = [];
				beforeCounts = [];
				animation = true;
				return false;	// each 문을 벗어난다.
			}
		});
	}	
	
	$.each(data, function(i){
		labels.push(this.couponName);
		counts.push(this.viewCount);
		if(beforeCounts.length < data.length){
			beforeCoupons.push(this._id);
			beforeCounts.push(this.viewCount);			
		}
	});
	
	var chartData = {
		labels		: labels,
		datasets 	: [		         	   
			{	fillColor : "rgba(220,220,220,0.5)",
				strokeColor : "rgba(220,220,220,1)",
				data : beforeCounts
			},
			{
				fillColor : "rgba(151,187,205,0.5)",
				strokeColor : "rgba(151,187,205,1)",
				data : counts
			}
		]
	};
	
	var context = $("#graph_by_view")[0].getContext("2d");
	var barChart = new Chart(context).Bar(chartData,{
		barStrokeWidth: 1,
		scaleOverride: true,
		scaleSteps: 13,
		scaleStepWidth: Math.round(counts[0]*1.1/13),
		scaleStartValue: 0,
		animation: animation
	});	
	//animation = false;
}


// 댓글순 그래프를 그린다.(Flotr2)
function drawReplyGraph(data){	
	var labels = [];
	var counts = [];
	$.each(data, function(i){
		labels.push(this.couponName);
		counts.push(this.epilogueCount);
	});
	
	var graph = Flotr.draw($("#graph_by_reply")[0], [
	    {data: [[0, counts[0]]], label: labels[0], pie: {explode: 20}},
	    {data: [[0, counts[1]]], label: labels[1]}, 
	    {data: [[0, counts[2]]], label: labels[2]}, 
	    {data: [[0, counts[3]]], label: labels[3]}, 
	    {data: [[0, counts[4]]], label: labels[4]}
	], {
		HtmlText : false,
		grid : {
			verticalLines : false,
			horizontalLines : false,
			outlineWidth: 0
		},
		xaxis : { showLabels : false },
		yaxis : { showLabels : false },
		pie : {
			show : true, 
			explode : 6
		},
		mouse : { track : false },
		legend : {
			position : 'se',
			backgroundColor : '#D2E8FF'
		}
	});
}


