let c;
let d;
let e;
let f;

function submitRegistration() {
	
	$("#registration").submit( (event) => {
		event.preventDefault();	
				
		const name = $(".form-control:eq(0)");
		const surname = $(".form-control:eq(1)");
		const email = $(".form-control:eq(2)");
		const dob = $(".form-control:eq(3)");
		const password = $(".form-control:eq(4)");
		const confirmPassword = $(".form-control:eq(5)");
		
		flag = true;
		const headingForm = $("#headingForm");
		
		if(!NAME_SURNAME_REGEX.test(name.val())) {
			flag = false;
			name.css("border-bottom-color", "red");	
		} else {
			name.css("border-bottom-color", "");
		} if(!NAME_SURNAME_REGEX.test(surname.val())) {
			flag = false;
			surname.css("border-bottom-color", "red");	
		} else {
			surname.css("border-bottom-color", "");
		} if(!EMAIL_REGEX.test(email.val())) {
			flag = false;
			email.css("border-bottom-color", "red");	
		} else {
			email.css("border-bottom-color", "");
		} if(dob.val() == "") {
			flag = false;
			dob.css("border-bottom-color", "red");
		} else {
			const date = toDate(dob.val());
			const d = new Date();
    		const year = d.getFullYear();
    		const month = d.getMonth();
    		const day = d.getDate();
   			const max = new Date(year - 16, month, day);
			const min = new Date(year - 100, month, day);
			if(date <= min) {
				flag = false;
				dob.css("border-bottom-color", "red");
			} else if(max < date) {
				flag = false;
				dob.css("border-bottom-color", "red");
				if($("#dateAlert").length) {
					$("#dateAlert").remove();
					clearTimeout(c);
				}
				headingForm.append('<div class="alert alert-danger text-center" role="alert" id="dateAlert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><span><strong>Devi avere almeno 16 anni per effettuare la registrazione</strong>.</span></div>');
				c = setTimeout( () => { $("#dateAlert").fadeOut(); }, 4000);
			} else {
				dob.css("border-bottom-color", "");
			}
		} if(!PASSWORD_REGEX.test(password.val())) {
			flag = false;
			password.css("border-bottom-color", "red");
		} else { 
			password.css("border-bottom-color", "");
		} if(!PASSWORD_REGEX.test(confirmPassword.val())) {
			flag = false;
			confirmPassword.css("border-bottom-color", "red");
		} else { 
			confirmPassword.css("border-bottom-color", "");
		} 
		
		if(flag) {
			const atLeastOneIsChecked = $('input[name="policy"]:checked').length > 0;
			if(!(password.val() == confirmPassword.val())) {
				if($("#passwordAlert").length) {
					$("#passwordAlert").remove();
					clearTimeout(d);
				}
				headingForm.append('<div class="alert alert-danger text-center" role="alert" id="passwordAlert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><span><strong>Le password non corrispondono</strong></span></div>');
				d = setTimeout( () => { $("#passwordAlert").fadeOut(); }, 4000);
				password.css("border-bottom-color", "red");
				confirmPassword.css("border-bottom-color", "red");
			} else if (!atLeastOneIsChecked) {
				if($("#policyAlert").length) {
					$("#policyAlert").remove();
					clearTimeout(e);
				}
				headingForm.append('<div class="alert alert-danger text-center" role="alert" id="policyAlert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><span><strong>Devi prima accettare le condizioni d\'uso</strong>.</span></div>');
				e = setTimeout( () => { $("#policyAlert").fadeOut(); }, 4000);
			} else {
				$("#registration").unbind('submit').submit();
			}
		} else {
			if($("#alert").length) {
				$("#alert").remove();
				clearTimeout(f);
			}
			headingForm.append('<div class="alert alert-danger text-center" role="alert" id="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><span><strong>Errore nella compilazione di uno/o più campi</strong>.</span></div>');
			f = setTimeout( () => { $("#alert").fadeOut(); }, 4000);
		}	
		
	});
	
}

function toDate(dateStr) {
	let parts = dateStr.split("-");
	parts[0] = parseInt(parts[0]);
  	return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
}