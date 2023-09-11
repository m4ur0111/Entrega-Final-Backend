document.addEventListener('DOMContentLoaded', () => {
    const vaciarCarritoBtn = document.getElementById('vaciar-carrito-btn');

    if (vaciarCarritoBtn) {
        vaciarCarritoBtn.addEventListener('click', () => {
            // Realiza una solicitud DELETE al servidor para limpiar el carrito
            fetch('/limpiar-carrito', {
                method: 'DELETE',
            })
            .then(response => {
                if (response.status === 204) {
                    // La solicitud fue exitosa, redirige a la página principal
                    window.location.href = '/';
                } else {
                    // Handle any errors or show a message to the user
                    console.error('Error al vaciar el carrito.');
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
            });
        });
    }
});

