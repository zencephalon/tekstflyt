$(document).ready(function() {

    $("form").on("submit", function(event) {
    	var username = $('#username').val();
    	var password = $('#password').val();

		if (username.length <= 0 || password.length <= 0)  {
			event.preventDefault();
			$('.error-login').css('display', 'block');
		} 
	});

	$('.clear').on('click', function() {
		$('.error-login').css('display', 'none');
	});
});