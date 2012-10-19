var targetPos = 0;
var currentPos = 0;

$(document).ready(function(){
	targetPos = $("#scrollLock").offset().top;
	
});

$(window).scroll(function(){
	
	currentPos = $(window).scrollTop();
	if (currentPos > targetPos) {
		$('#scrollLock').addClass('fixed');
	}
	if (currentPos < targetPos) {
		$('#scrollLock').removeClass('fixed');
	}
	
});