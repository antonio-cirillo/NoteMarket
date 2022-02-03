function submit() {

    $("#postItem").submit((event) => {

        event.preventDefault();
        
        let flag = true;

        const title = $(".form-control:eq(1)");        
        const price = $(".form-control:eq(2)");        
        const description = $(".form-control:eq(3)");        
        const image = $(".form-control:eq(4)"); 
        const file = $(".form-control:eq(5)"); 

        if (!TITLE_REGEX.test(title.val())) {
            flag = false;
            title.css("border-bottom-color", "red");
        } else {
            title.css("border-bottom-color", "");
        } if (price.val().match(PRICE_REGEX) &&
                price.val().match(PRICE_REGEX)[0] == price.val()) {
            price.css("border-bottom-color", "");
        } else {
            flag = false;
            price.css("border-bottom-color", "red");
        } if (!DESCRIPTION_REGEX.test(description.val())) {
            flag = false;
            description.css("border-bottom-color", "red");
        } else {
            description.css("border-bottom-color", "");
        } if (image.val() == '') {
            flag = false;
            image.css("border-bottom-color", "red");
        } else {
            image.css("border-bottom-color", "");
        } if (file.val() == '') {
            flag = false;
            file.css("border-bottom-color", "red");
        } else {
            file.css("border-bottom-color", "");
        }

        if (flag) {
            $("#postItem").unbind('submit').submit();
        } else {
            toastr.error("Errore nella compilazione di uno/o più campi.");
        }

    });

    $("#updateTelegramToken").submit((event) => {

        event.preventDefault();
        
        let flag = true;

        const token = $(".form-control:eq(0)");

        if (!TOKEN_REGEX.test(token.val())) {
            flag = false;
            token.css("border-bottom-color", "red");
        } else {
            token.css("border-bottom-color", "");
        }

        if (flag) {
            $("#updateTelegramToken").unbind('submit').submit();
        } else {
            toastr.error("Token inserito non valido!.");
        }

    });

}