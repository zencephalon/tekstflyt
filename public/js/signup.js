$( document ).ready(function() {

    $("form").on("submit", function(event) {
    	var username = $('#username').val();
    	var password = $('#password').val();
    	var pw_confirm = $('#password-confirm').val();

		if (username.length <= 0 || password.length <= 0 || pw_confirm.length <= 0)  {
			event.preventDefault();
			$('.error-pw-match').css('display', 'none');
			$('.error-signup').css('display', 'block');	
		} 

		if(password !== pw_confirm) {
			event.preventDefault();
			$('.error-pw-match').css('display', 'block');

			if (username.length > 0) {
				$('.error-signup').css('display', 'none');
			}
		}
	});

	$('.clear').on('click', function() {
		$('.error-signup').css('display', 'none');
		$('.error-pw-match').css('display', 'none');
	});
});