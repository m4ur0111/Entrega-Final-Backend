document.addEventListener('DOMContentLoaded', () => {
    const eliminarProductoBtns = document.querySelectorAll('.eliminar-producto-btn');
    
    eliminarProductoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-product-id');
            
            fetch('/limpiar/' + productId, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Error al eliminar el producto del carrito.');
                }
            })
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert('Error al eliminar el producto del carrito.');
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
            });
        });
    });
});
