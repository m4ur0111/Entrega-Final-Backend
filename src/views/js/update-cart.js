$(document).ready(function () {
    $('.actualizar-cantidad-btn').on('click', function () {
        const productId = $(this).data('product-id'); // Obtiene el ID del producto
        const cantidadInput = $(this).siblings('.cantidad-input'); // Obtiene el campo de entrada de cantidad
        const newQuantity = cantidadInput.val(); // Obtiene la nueva cantidad

        // Validación: verifica si la nueva cantidad es menor o igual a 0
        if (newQuantity <= 0) {
            alert('La cantidad debe ser mayor que 0');
            return; // Detiene la ejecución si la cantidad es inválida
        }

        // Realiza una solicitud al servidor para actualizar la cantidad
        $.ajax({
            type: 'PUT',
            url: '/cart/update-quantity/' + productId, // Ajusta la ruta de la solicitud según tu configuración
            data: { newQuantity }, // Envía la nueva cantidad en el cuerpo de la solicitud
            success: function (data) {
                // Maneja la respuesta del servidor si es necesario
                if (data.success) {
                    // Actualiza la vista o realiza cualquier otra acción necesaria
                    location.reload(); // Recarga la página para reflejar los cambios en el carrito
                } else {
                    // Maneja cualquier error o muestra un mensaje al usuario
                    alert('Error al actualizar la cantidad.');
                }
            },
            error: function () {
                // Maneja cualquier error de la solicitud
                alert('Error de conexión al servidor.');
            }
        });
    });
});
