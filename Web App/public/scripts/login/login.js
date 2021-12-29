let time;

function submitLogin() {
	
	$("#login").submit((event) => {
		
		event.preventDefault();
	
		const email = $(".form-control:eq(0)");		
		const password = $(".form-control:eq(1)");
		
		flag = true;
		
		if(!EMAIL_REGEX.test(email.val())) {
			flag = false;
			email.css("border-bottom-color", "red");	
		} else {
			email.css("border-bottom-color", "");
		} if (!PASSWORD_REGEX.test(password.val())) {
			flag = false;
			password.css("border-bottom-color", "red");
		} else { 
			password.css("border-bottom-color", "");
		} 	
		
		if(flag) {
			$("#login").unbind('submit').submit();
		} else {
			if($("#alert").length) {
				$("#alert").remove();
				clearTimeout(time);
			}
			const headingForm = $("#headingForm");
			headingForm.append('<div class="alert alert-danger" id="alert" role="alert" style="font-size: 16px;margin-bottom: 0px;"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><span class="text-center" style="font-size: 13px;"><strong>Errore durante l\'inserimento dei dati</strong>.</span></div>');
			time = setTimeout(() => { $("#alert").fadeOut(); }, 4000);	
		}
			
	});
	
}