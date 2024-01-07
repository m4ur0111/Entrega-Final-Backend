document.addEventListener('DOMContentLoaded', function () {
    $('#ir-a-checkout-btn').on('click', function () {
        // Obtén el monto total de la compra desde el objeto carrito en la página
        var montoTotal = {{carrito.total}};

        // Obtén la información del carrito
        var productosCarrito = {{JSON.stringify carrito.productos}};

        // Envía los datos al servidor mediante una solicitud AJAX
        $.ajax({
            url: '/completar-compra', // La ruta de tu controlador de Stripe
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                montoTotal: montoTotal,
                productosCarrito: productosCarrito
            }),
            success: function (response) {
                // Redirige a la página de completar datos con el monto total y la información del carrito
                window.location.href = response.redirectUrl;
            },
            error: function (error) {
                console.error('Error al enviar datos al servidor:', error);
            }
        });
    });
});