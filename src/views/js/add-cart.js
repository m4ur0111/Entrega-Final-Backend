// document.addEventListener('DOMContentLoaded', function () {
//     // Selecciona todos los botones "Agregar al carrito"
//     const agregarCarritoButtons = document.querySelectorAll('.agregar-carrito');

//     agregarCarritoButtons.forEach((button) => {
//         // Agrega un evento clic a cada botón
//         button.addEventListener('click', async (event) => {
//             const productoId = button.getAttribute('data-producto-id');

//             try {
//                 // Construye la URL completa para verificar el stock
//                 const stockUrl = `/verificar-stock/${productoId}`;

//                 // Realiza una solicitud GET al servidor para verificar el stock del producto
//                 const stockResponse = await fetch(stockUrl);
//                 const stockData = await stockResponse.json();

//                 // Verifica si hay suficiente stock antes de enviar la solicitud POST para agregar el producto al carrito
//                 if (stockData && stockData.stock && stockData.stock >= 1) {
//                     // Construye la URL completa para agregar al carrito
//                     const addToCartUrl = `/agregar-al-carrito/${productoId}`;

//                     // Realiza una solicitud POST para agregar el producto al carrito
//                     const addToCartResponse = await fetch(addToCartUrl, {
//                         method: 'POST',
//                     });

//                     if (addToCartResponse.ok) {
//                         // El producto se agregó correctamente al carrito
//                         alert('Producto agregado al carrito');
//                     } else {
//                         // Maneja el caso en que la solicitud no sea exitosa al agregar al carrito
//                         alert('No se pudo agregar el producto al carrito');
//                     }
//                 } else {
//                     // Maneja el caso en que no hay suficiente stock
//                     alert('Producto sin stock disponible');
//                 }
//             } catch (error) {
//                 console.error('Error:', error);
//                 alert('Error en el servidor');
//             }
//         });
//     });
// });
