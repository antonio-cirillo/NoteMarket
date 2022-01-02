let flag = false;
let counter = 0;

function removeFromCart(length, _id, price) {

    if (!flag) {
        flag = true;
        counter = length;
    }

    $.ajax({
        type: "POST",
        url: "./catalogo/rimuovi-dal-carrello",
        data: { _id: _id },
        success: function(data) {
            $(`#${_id}`).remove();
            const val = $('#total').text();
            let total = val.substring(0, val.length - 2);
            $('#total').text(`${parseFloat(total - price).toFixed(2)} €`);
            toastr.success("Prodotto rimosso dal carrello.");
            if (counter == 1) {
                document.getElementById("list").innerHTML = 
                    `<div class="row" style="height: auto;margin: 0px;">
                        <div class="col" style="text-align: center;"><strong style="font-family: Heebo, sans-serif;">Non sono presenti elementi nel carrello!</strong></div>
                    </div>`
            }
            counter -= 1;
        },
        error: function() {
            toastr.error("Ops! Qualcosa è andato storto.");
        }
    });

}