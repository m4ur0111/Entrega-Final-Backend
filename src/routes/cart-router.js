const express = require('express');
const router = express.Router();
const Producto = require('../models/products.models');
const Carrito = require('../models/cart.model');
const Order = require('../models/order.model');
const { requireLogin } = require('../middleware/authMiddleware');

//////////// CARRITO ROUTES ////////////
router.post('/agregar-al-carrito/:productoId', async (req, res) => {
    try {
        const productoId = req.params.productoId;
        const userId = req.session.userId;

        let carrito = await Carrito.findOne({ usuario: userId });

        if (!carrito) {
            carrito = await Carrito.create({ usuario: userId, productos: [], total: 0 });
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
});

// Ruta GET para la página de carrito
router.get('/cart', requireLogin, async (req, res) => {
    try {
        const userId = req.session.userId;
        const carrito = await Carrito.findOne({ usuario: userId });

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
});

router.get('/completado', requireLogin, async (req, res) => {
    res.render('buy-complete');
})

// Ruta para finalizar la compra y mostrar la confirmación
router.post('/finalizar-compra', async (req, res) => {
    try {
        const userId = req.session.userId; // Obtén la ID del usuario actual
        const carrito = await Carrito.findOne({ usuario: userId }); // Busca el carrito del usuario

        if (!carrito || carrito.productos.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }

        //Crea una nueva orden utilizando el modelo Order
        const nuevaOrden = new Order({
            usuario: userId,
            productos: carrito.productos,
            total: carrito.total,
            estado: 'aprobado',
        });

        await nuevaOrden.save();

        //Limpia el carrito
        carrito.productos = [];
        carrito.total = 0;
        await carrito.save();

        res.status(201).json({ message: 'Compra completada con éxito', OrderId: nuevaOrden._id });

    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Ruta DELETE para limpiar el carrito
router.delete('/limpiar-carrito', async (req, res) => {
    try {
        const userId = req.session.userId;

        await Carrito.deleteOne({ usuario: userId });

        res.status(204).send();
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

// Ruta para eliminar un producto del carrito por su ID
router.delete('/limpiar/:productId', requireLogin, async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.params.productId;
        console.log('productId:', productId);

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
});

// Ruta PUT para actualizar la cantidad de un producto en el carrito
router.put('/cart/update-quantity/:productId', requireLogin, async (req, res) => {
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
});

module.exports = router;