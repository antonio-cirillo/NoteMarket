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
                url: "./aggiungi-al-carrello",
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