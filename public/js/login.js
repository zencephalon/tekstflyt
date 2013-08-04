$(document).ready(function() {

    $("form").on("submit", function(event) {
    	var username = $('#username').val();
    	var password = $('#password').val();

		if (username.length <= 0 || password.length <= 0)  {
			event.preventDefault();
			$('.error-login-empty').css('display', 'block');
		} 
	});

	$('.clear').on('click', function() {
		$('.error-login-empty').css('display', 'none');
		$('.error-login').css('display', 'none');
	});

	$.ajax({
		type: "POST",
		url: '/login',
		success: function() {
			$('.error-login').css('display', 'block');
		},
	});
});