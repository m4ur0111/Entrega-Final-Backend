

async function verificarStockAntesDePagar(userId) {
    try {
        const carrito = await cartDao.getCartByUserId(userId);

        if (!carrito || carrito.productos.length === 0) {
            return { success: false, message: 'El carrito está vacío' };
        }

        const productosNoComprados = [];

        for (const productoEnCarrito of carrito.productos) {
            const producto = await Producto.findById(productoEnCarrito.producto);

            if (producto && producto.stock >= productoEnCarrito.cantidad) {
                // Restar stock del producto y continuar
                producto.stock -= productoEnCarrito.cantidad;
                await producto.save();
            } else {
                // No restar el stock pero agregar el producto al carrito de productos no comprados
                productosNoComprados.push(productoEnCarrito);
            }
        }

        // Actualizar el carrito con los productos no comprados
        carrito.productos = productosNoComprados;
        carrito.total = carrito.productos.reduce((total, productoEnCarrito) => total + productoEnCarrito.precioUnitario * productoEnCarrito.cantidad, 0);
        await cartDao.updateCart(carrito._id, carrito);

        if (productosNoComprados.length === 0) {
            return { success: true, message: 'Verificación de stock exitosa' };
        } else {
            return { success: false, message: 'Algunos productos no tienen stock suficiente', productosNoComprados };
        }
    } catch (error) {
        console.error('Error al verificar stock antes del pago:', error);
        return { success: false, message: 'Error al verificar stock antes del pago' };
    }
}


async function generarOrdenYLimpiarCarrito(userId, purchaserEmail, carrito) {
    try {
        const argentinaTimezone = 'America/Argentina/Buenos_Aires';
        const argentinaDateTime = moment.tz(new Date(), argentinaTimezone);
        const uniqueTicketCode = await generateCode.generateUniqueTicketCode();

        const nuevaOrden = new Order({
            usuario: userId,
            productos: carrito.productos,
            total: carrito.total,
            estado: 'aprobado',
            ticket: {
                code: uniqueTicketCode,
                purchase_datetime: argentinaDateTime.toDate(),
                purchaser: purchaserEmail,
            },
        });

        await nuevaOrden.save();

        // Limpiar el carrito
        carrito.productos = [];
        carrito.total = 0;
        await cartDao.updateCart(carrito._id, carrito);

        return { success: true, message: 'Orden generada y carrito limpiado con éxito', orderId: nuevaOrden._id };
    } catch (error) {
        console.error('Error al generar orden y limpiar carrito:', error);
        return { success: false, message: 'Error al generar orden y limpiar carrito' };
    }
}

module.exports = { verificarStockAntesDePagar, generarOrdenYLimpiarCarrito };