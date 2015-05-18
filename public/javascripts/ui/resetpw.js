$('#resetpw').on('click', function(){
	console.log('click')
	
	var email = $('#email').val();

	$.post( "/resetpw", { email: email } , function( data ) {
	  	if(data.success == false){
	  		alertify.error(data.message)
	  	}
	  	if(data.success == true){
	  		$('#resetpwform').fadeOut(function(){
	  			$('#emailLink').attr('href', 'http://'+email.split('@')[1])
	  			$('#resetpwformcompleted').fadeIn()
	  		})
	  		
	  		alertify.success(data.message, 0)
	  	}
	});
})

$('#submitnewpass').on('click', function(){
		
		var object = {
			email: $('#email').val(),
			hash: $('#hash').val(),
			newPassword: $('#newPassword').val(),
			newPasswordConfirm: $('#newPasswordConfirm').val(),
			google2fa: $('#google2fa').val()
		}

		$.post( "/resetpw/update", object , function( data ) {
		  	if(data.success == false){
		  		alertify.error(data.message)
		  	}
		  	if(data.success == true){
		  		window.location.href = "/login";
		  	}
		});
	})
