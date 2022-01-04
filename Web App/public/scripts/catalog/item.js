function addToCart(isLogged, _id) {

    if (!isLogged) {
        toastr.error("Devi prima effettuare l'accesso!");
    }

    else {

        const text = $("#cart").text();
        if (text == "Aggiungi al carrello") {
            $.ajax({
                type: "POST",
                url: "./aggiungi-al-carrello",
                data: { _id: _id },
                success: function(data) {
                    $("#cart").text("Rimuovi dal carrello");
                    toastr.success("Prodotto aggiunto al carrello.");
                },
                error: function() {
                    toastr.error("Ops! Qualcosa è andato storto.");
                }
            });
        } else {
            $.ajax({
                type: "POST",
                url: "./rimuovi-dal-carrello",
                data: { _id: _id },
                success: function(data) {
                    $("#cart").text("Aggiungi al carrello");
                    toastr.success("Prodotto rimosso dal carrello.");
                },
                error: function() {
                    toastr.error("Ops! Qualcosa è andato storto.");
                }
            });
        }
        
    }

}

function addComment(isOwned) {

    if (!isOwned) {
        toastr.error("Per effettuare un commento devi prima acquistare il prodotto!");
    } else {

        $("#publish").prop("disabled", true);

        let flag = true;

        const comment = $("#comment").val();
        if (!COMMENT_REGEX.test(comment)) {
            $("#comment").css("border-bottom-color", "red");
            flag = false;
            toastr.error("Commento non valido! Riprovare.");
            $("#publish").prop("disabled", false);
        } else {
            $("#comment").css("border-bottom-color", "");
        }

        if (flag) {
            $.ajax({
                type: "POST",
                url: `${window.location.href}/scrivi-commento`,
                data: {
                    comment: comment 
                },
                success: function(data) {

                    // Update negative
                    const negative = $("#negative");
                    negative.attr('aria-valuenow', data.analysis.negative.percent).
                        css('width', `${data.analysis.negative.percent}%`);
                    const negativeValue = $("#negativeValue");
                    negativeValue.text(`${data.analysis.negative.percent}%`);
                    
                    // Update neutral
                    const neutral = $("#neutral");
                    neutral.attr('aria-valuenow', data.analysis.neutral.percent).
                        css('width', `${data.analysis.neutral.percent}%`);
                    const neutralValue = $("#neutralValue");
                    neutralValue.text(`${data.analysis.neutral.percent}%`);
                    
                    // Update positive
                    const positive = $("#positive");
                    positive.attr('aria-valuenow', data.analysis.positive.percent).
                        css('width', `${data.analysis.positive.percent}%`);
                    const positiveValue = $("#positiveValue");
                    positiveValue.text(`${data.analysis.positive.percent}%`);

                    // Append new comment
                    const email = data.email;
                    const newComment = `<tr><td class="d-none d-print-table-cell d-md-table-cell d-lg-table-cell d-xl-table-cell d-xxl-table-cell">${email}</td><td><em>${comment}</em><br></td></tr>`
                    $('#listComment').append(newComment);

                    // Clear comment
                    $("#comment").val('');
                    $("#publish").prop("disabled", false);
                    toastr.success("Commento inserito correttamente!");
                },
                error: function() {
                    $("#publish").prop("disabled", false);
                    toastr.error("Ops! Qualcosa è andato storto.");
                }
            });
        }

    }

}