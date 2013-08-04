$( document ).ready(function() {

    $("form").on("submit", function(event) {
    	var username = $('#username').val();
    	var password = $('#password').val();
    	var pw_confirm = $('#password-confirm').val();

		if (username.length <= 0 || password.length <= 0 || pw_confirm.length <= 0)  {
			event.preventDefault();
			$('.error-signup').css('display', 'block');
		} 
	});

	$('.clear').on('click', function() {
		$('.error-signup').css('display', 'none');
	});
});