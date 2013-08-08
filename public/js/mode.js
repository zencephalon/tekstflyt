$( document ).ready(function() {

    $(".form-wordcount").on("submit", function(event) {
    	var wordcount = $('#wordcount').val();
		if (!(isInt(wordcount))) {
			event.preventDefault();
			$('.error-wordcount').css('display', 'block');
		} 
	});

	$(".form-timer").on("submit", function(event) {
		var timer = $('#timer').val();
		if (!(isInt(timer))) {
			event.preventDefault();
			$('.error-timer').css('display', 'block');
		}
	});
});

function isInt(n) {
   return n % 1 === 0 && n >= 0;
}
