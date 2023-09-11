$(document).ready(function () {
    $('.eliminar-producto-btn').on('click', function () {
        const productId = $(this).data('product-id'); 
        
        $.ajax({
            type: 'DELETE',
            url: '/cart/deleteId/' + productId,
            data: { productId },
            success: function (data) {
                if (data.success) {
                    location.reload(); 
                } else {
                    alert('Error al eliminar el producto del carrito.');
                }
            },
            error: function () {
                alert('Error de conexión al servidor.');
            }
        });
    });
});
