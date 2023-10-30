const Carrito = require('../models/cart.model');
const Order = require('../models/order.model');
const Producto = require('../models/products.models');
const cartDao = require('../dao/cart.dao');
const generateCode = require('../utils/function');
const moment = require('moment-timezone')

//Ruta POST para agregar un producto al carrito
async function addToCart(req, res) {
    try {
        const productoId = req.params.productoId;
        const userId = req.session.userId;

        let carrito = await cartDao.getCartByUserId(userId);

        if (!carrito) {
            carrito = await cartDao.createCart(userId);
        }

        const productoEnCarrito = carrito.productos.find((item) => item.producto.equals(productoId));

        // Obtén la cantidad enviada desde el cliente
        const cantidadDesdeCliente = parseInt(req.body.quantity);

        if (productoEnCarrito) {
            // Si el producto ya está en el carrito, actualiza su cantidad
            productoEnCarrito.cantidad += cantidadDesdeCliente;
        } else {
            const producto = await Producto.findById(productoId);

            if (producto) {
                carrito.productos.push({
                    producto: productoId,
                    cantidad: cantidadDesdeCliente, 
                    precioUnitario: producto.precio,
                    nombre: producto.nombre,
                    imagen: producto.imagen
                });
            }
        }

        // Actualiza el total del carrito
        carrito.total = carrito.productos.reduce((total, item) => {
            return total + (item.cantidad * item.precioUnitario);
        }, 0);

        await carrito.save();

        res.redirect('/');
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
}

//Ruta GET para la página de carrito
async function viewCartPage(req, res) {
    try {
        const userId = req.session.userId;
        const carrito = await cartDao.getCartByUserId(userId);

        if (!carrito || carrito.productos.length === 0) {
            return res.render('cart', { carrito: null, detallesDelCarrito: [] });
        }

        const productoIds = carrito.productos.map(item => item.producto);

        const detallesDelCarrito = await Producto.find({ _id: { $in: productoIds } });

        res.render('cart', { carrito, detallesDelCarrito });

    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
}

//Ruta GET para la página de compra completada
function viewBuyCompletePage(req, res) {
    res.render('buy-complete');
}

//Ruta POST para finalizar la compra
async function completePurchase(req, res) {
    try {
        const userId = req.session.userId;
        const purchaserEmail = req.session.email;

        const carrito = await cartDao.getCartByUserId(userId);

        if (!carrito || carrito.productos.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }

        // Definir el uso horario de Argentina
        const argentinaTimezone = 'America/Argentina/Buenos_Aires';
        // Obtener la fecha y hora actual en Argentina
        const argentinaDateTime = moment.tz(new Date(), argentinaTimezone);
        // Generar un código de ticket único
        const uniqueTicketCode = await generateCode.generateUniqueTicketCode();

        // Crear un nuevo ticket
        const nuevoTicket = {
            code: uniqueTicketCode, // Usar el código generado
            purchase_datetime: argentinaDateTime.toDate(),
            purchaser: purchaserEmail, // Asegúrate de que req.user esté definido y tenga el campo 'email'
        };

        // Crear un arreglo para los IDs de productos no comprados
        const productosNoComprados = [];

        let nuevaOrden; // Declarar nuevaOrden aquí
        let idOrden;

        // Recorrer los productos en el carrito
        for (const productoEnCarrito of carrito.productos) {
            const producto = await Producto.findById(productoEnCarrito.producto);

            if (producto && producto.stock >= productoEnCarrito.cantidad) {
                // Si hay suficiente stock, restar del stock del producto y continuar
                producto.stock -= productoEnCarrito.cantidad;
                await producto.save();

                // Crear una nueva orden con el producto
                nuevaOrden = new Order({
                    usuario: userId,
                    productos: [productoEnCarrito],
                    total: productoEnCarrito.precioUnitario * productoEnCarrito.cantidad,
                    estado: 'aprobado',
                    ticket: nuevoTicket,
                });

                await nuevaOrden.save();
            } else {
                // Si no hay suficiente stock, no restar el stock pero agregar el producto al carrito de productos no comprados
                productosNoComprados.push(productoEnCarrito);
            }
        }

        // Actualizar el carrito con los productos no comprados
        carrito.productos = productosNoComprados;
        carrito.total = carrito.productos.reduce((total, productoEnCarrito) => total + productoEnCarrito.precioUnitario * productoEnCarrito.cantidad, 0);
        await cartDao.updateCart(carrito._id, carrito);

        // Mover la inicialización de idOrden aquí
        idOrden = nuevaOrden && nuevaOrden._id;

        if (productosNoComprados.length === 0 && idOrden) {
            res.status(201).json({
                message: 'Compra completada con éxito',
                OrderId: nuevaOrden._id,
                success: true,
                productsNotPurchased: [],
            });
        } else {
            res.status(201).json({
                message: 'Algunos productos no fueron comprados por falta de stock',
                OrderId: nuevaOrden._id,
                success: false,
                productsNotPurchased: productosNoComprados,
            });
        }
        } catch (error) {
            console.error('Error en el servidor:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
}

//Ruta DELETE para limpiar el carrito
async function clearCart(req, res) {
    try {
        const userId = req.session.userId;

        await Carrito.deleteOne({ usuario: userId });

        res.status(204).send();
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
}

//Ruta DELETE para eliminar un producto del carrito
async function removeProductFromCart(req, res) {
    try {
        const userId = req.session.userId;
        const productId = req.params.productId;

        const carrito = await Carrito.findOne({ usuario: userId });

        if (!carrito) {
            // Si el carrito no se encuentra, envía una respuesta de error
            return res.status(404).json({ success: false, mensaje: 'Carrito no encontrado' });
        }

        const productoEnCarrito = carrito.productos.find((item) => item._id == productId);

        if (!productoEnCarrito) {
            return res.status(404).json({ success: false, mensaje: 'Producto no encontrado en el carrito' });
        }

        const precioProductoAEliminar = productoEnCarrito.precioUnitario * productoEnCarrito.cantidad;
        carrito.total -= precioProductoAEliminar;

        const productIndex = carrito.productos.findIndex(product => product.producto.toString() === productId);

        carrito.productos.splice(productIndex, 1);

        await carrito.save();

        res.json({ success: true, mensaje: 'Producto eliminado del carrito con éxito' });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ success: false, mensaje: 'Error en el servidor' });
    }
}

//Ruta PUT para actualizar la cantidad de un producto en el carrito
async function updateProductQuantity(req, res) {
    try {
        const userId = req.session.userId;
        const productId = req.params.productId;
        const newQuantity = req.body.newQuantity; // Obtiene la nueva cantidad desde el cuerpo de la solicitud

        const carrito = await Carrito.findOne({ usuario: userId });

        const productoEnCarrito = carrito.productos.find((item) => item.producto.equals(productId));

        if (!productoEnCarrito) {
            return res.status(404).json({ success: false, mensaje: 'Producto no encontrado en el carrito' });
        }

        productoEnCarrito.cantidad = newQuantity;

        carrito.total = carrito.productos.reduce((total, item) => {
            return total + (item.cantidad * item.precioUnitario);
        }, 0);

        await carrito.save();

        res.json({ success: true, mensaje: 'Cantidad actualizada con éxito' });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ success: false, mensaje: 'Error en el servidor' });
    }
}

module.exports = {
    addToCart,
    viewCartPage,
    viewBuyCompletePage,
    completePurchase,
    clearCart,
    removeProductFromCart,
    updateProductQuantity,
};