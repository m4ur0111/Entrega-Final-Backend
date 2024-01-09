$(document).ready(function () {
    $('.actualizar-cantidad-btn').on('click', function () {
        const productId = $(this).data('product-id');
        const cantidadInput = $(this).siblings('.cantidad-input');
        const newQuantity = cantidadInput.val();

        if (newQuantity <= 0) {
            alert('La cantidad debe ser mayor que 0');
            return; 
        }

        //Realizo una solicitud al servidor para actualizar la cantidad
        $.ajax({
            type: 'PUT',
            url: '/cart/update-quantity/' + productId, 
            data: { newQuantity }, 
            success: function (data) {
                if (data.success) {
                    location.reload();
                } else {
                    alert('Error al actualizar la cantidad.');
                }
            },
            error: function () {
                alert('Error de conexión al servidor.');
            }
        });
    });
});
