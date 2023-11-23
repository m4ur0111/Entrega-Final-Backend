document.addEventListener('DOMContentLoaded', () => {
    const eliminarProductoBtn = document.querySelectorAll('.eliminar-producto-btn');

    eliminarProductoBtn.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log("Boton apretado")
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
                }else {
                    throw new Error('Error al eliminar el producto de la base de datos.');
                }
            })
            .then(data => {
                if (data.success) {
                    window.location.reload();
                }else {
                    alert('Error al eliminar el producto.');
                }
            })
            .catch(error => {
                console.log("Error en la solicitud:", error);
            })
        });
    });
});