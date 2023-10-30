$(document).ready(function () {
    // Manejador de eventos para el clic en el botón "Finalizar Compra"
    $('#finalizar-compra-btn').on('click', function () {
        $.ajax({
            type: 'POST',
            url: '/finalizar-compra', //Ruta en el servidor para finalizar la compra
            success: function (response) {
                //Actualiza la información en la página de compra completada
                $('#orderId').text(response.orderId);

                if (response.success) {
                    $('#message').text('Compra completada con éxito');
                    $('#notPurchasedList').hide(); //Oculta la lista de productos no comprados
                } else {
                    $('#message').text('Algunos productos no pudieron procesarse:');
                    var notPurchasedList = response.productsNotPurchased;
                    var listItems = '';
                    notPurchasedList.forEach(function (product) {
                        listItems += '<li>' + product.nombre + ' (Cantidad: ' + product.cantidad + ')</li>';
                    });
                    $('#notPurchasedList').html(listItems);
                }

                //Muestra la página de compra completada
                window.location.href = '/completado?id=' + response.OrderId + '&message=' + response.message + '&success=' + response.success + '&productsNotPurchased=' + JSON.stringify(response.productsNotPurchased);
            },
            error: function (error) {
                //Manejo de errores si la solicitud falla
                console.error(error);
            }
        });
    });
});
