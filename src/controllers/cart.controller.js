require('dotenv').config();
const Carrito = require('../models/cart.model');
const Order = require('../models/order.model');
const Producto = require('../models/products.models');
const cartDao = require('../dao/cart.dao');
const generateCode = require('../utils/function');
const { getUserRoleFromDatabase } = require('../utils/function');
const moment = require('moment-timezone');
const errorDictionary = require('../services/errors/errorDictionary')
const { userModel } = require('../models/user.model');
const stripe = require('stripe')(process.env.KEY_STRIPE);
const mongoose = require('mongoose');

//Ruta POST para agregar un producto al carrito
const addToCart = async (req, res) => {
    try {
        const productoId = req.params.productoId;
        const userId = req.session.userId;

        const userRole = await getUserRoleFromDatabase(userId);
        let isPremium = false;

        if (userRole === 'premium') {
            isPremium = true;
        }

        let carrito = await cartDao.getCartByUserId(userId);

        if (!carrito) {
            carrito = await cartDao.createCart(userId);
        }

        const productoEnCarrito = carrito.productos.find((item) => item.producto.equals(productoId));

        const cantidadDesdeCliente = parseInt(req.body.quantity);

        const producto = await Producto.findById(productoId);

        //Verifica si el producto pertenece al usuario actual
        if (producto && producto.owner && producto.owner.equals(userId)) {
            return res.status(403).json({
                message: 'No puedes agregar tus propios productos al carrito.',
            });
        }

        if (isPremium) {
            //Si el usuario es premium, verifica si el producto pertenece a otro usuario premium
            if (producto && (!producto.owner || !producto.owner.equals(userId))) {
                if (productoEnCarrito) {
                    productoEnCarrito.cantidad += cantidadDesdeCliente;
                } else {
                    carrito.productos.push({
                        producto: productoId,
                        cantidad: cantidadDesdeCliente,
                        precioUnitario: producto.precio,
                        nombre: producto.nombre,
                        imagen: producto.imagen,
                    });
                }
            } else {
                return res.status(403).json({
                    message: 'Los usuarios premium no pueden agregar sus propios productos al carrito.',
                });
            }
        } else {
            if (producto) {
                if (productoEnCarrito) {
                    productoEnCarrito.cantidad += cantidadDesdeCliente;
                } else {
                    //Agrega el producto al carrito
                    carrito.productos.push({
                        producto: productoId,
                        cantidad: cantidadDesdeCliente,
                        precioUnitario: producto.precio,
                        nombre: producto.nombre,
                        imagen: producto.imagen,
                    });
                }
            } else {
                //Si el producto no se encuentra, devuelve un mensaje de error
                return res.status(404).json({ message: errorDictionary.productoNoEncontrado });
            }
        }

        //Actualiza el total del carrito
        carrito.total = carrito.productos.reduce((total, item) => {
            return total + item.cantidad * item.precioUnitario;
        }, 0);

        await carrito.save();

        res.redirect('/');
    } catch (error) {
        req.logger.error('Error en el servidor:', error);
        res.status(500).json({ message: errorDictionary.errorServidor });
    }
};

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
        console.error('Error en viewCartPage:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
}

//Ruta GET para la página de compra completada
function viewBuyCompletePage(req, res) {
    res.render('buy-complete');
}

async function completePurchase(req, res) {
    try {
        const userId = req.session.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID de usuario no válido' });
        }

        const purchaserEmail = req.session.email;
        const carrito = await cartDao.getCartByUserId(userId);

        if (!carrito || carrito.productos.length === 0) {
            return res.status(400).json({ message: errorMessages.carritoVacio });
        }

        const argentinaTimezone = 'America/Argentina/Buenos_Aires';
        const argentinaDateTime = moment.tz(new Date(), argentinaTimezone);
        const uniqueTicketCode = await generateCode.generateUniqueTicketCode();

        const nuevoTicket = {
            code: uniqueTicketCode,
            purchase_datetime: argentinaDateTime.toDate(),
            purchaser: purchaserEmail,
        };

        const productosNoComprados = [];

        let nuevaOrden;
        let idOrden;

        // Crear una lista de artículos para Stripe
        const lineItems = [];

        for (const productoEnCarrito of carrito.productos) {
            // 2. Verifica si Producto.findById devuelve un objeto válido
            const producto = await Producto.findById(productoEnCarrito.producto);

            if (!producto || producto.stock < productoEnCarrito.cantidad) {
                productosNoComprados.push(productoEnCarrito);
                continue;  // Continuar con la siguiente iteración
            }

            producto.stock -= productoEnCarrito.cantidad;
            await producto.save();

            // Crear una nueva orden con el producto
            nuevaOrden = new Order({
                usuario: userId,
                productos: [productoEnCarrito],
                total: productoEnCarrito.precioUnitario * productoEnCarrito.cantidad,
                estado: 'pendiente',
                ticket: nuevoTicket,
            });

            // 3. Asegúrate de que nuevaOrden.save() se complete correctamente
            try {
                await nuevaOrden.save();
            } catch (error) {
                console.error('Error al guardar la nueva orden:', error);
                res.status(500).json({ message: 'Error al guardar la orden' });
                return;  // Salir de la función para evitar más procesamiento
            }

            // Agregar artículo a la lista de artículos para Stripe
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: productoEnCarrito.nombre,
                    },
                    unit_amount: productoEnCarrito.precioUnitario * 100,
                },
                quantity: productoEnCarrito.cantidad,
            });
        }

        // Actualizar el carrito con los productos no comprados
        carrito.productos = productosNoComprados;
        carrito.total = carrito.productos.reduce((total, productoEnCarrito) => total + productoEnCarrito.precioUnitario * productoEnCarrito.cantidad, 0);
        await cartDao.updateCart(carrito._id, carrito);

        idOrden = nuevaOrden && nuevaOrden._id;

        if (productosNoComprados.length === 0 && idOrden) {
            // Crear una sesión de pago en Stripe
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                success_url: 'http://localhost:8080/', // URL a la que se redirige después de una compra exitosa
                cancel_url: 'http://localhost:8080/login', // URL a la que se redirige si se cancela la compra
            });

            // Devolver la URL de la sesión de pago de Stripe
            res.status(201).json({
                message: 'Redireccionando a Stripe para completar la compra',
                sessionId: session.id,
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

//Ruta POST para finalizar la compra
// async function completePurchase(req, res) {
//     try {
//         const userId = req.session.userId;
//         const purchaserEmail = req.session.email;

//         const carrito = await cartDao.getCartByUserId(userId);

//         if (!carrito || carrito.productos.length === 0) {
//             return res.status(400).json({ message: errorMessages.carritoVacio });
//         }

//         //Define el uso horario de Argentina
//         const argentinaTimezone = 'America/Argentina/Buenos_Aires';
//         const argentinaDateTime = moment.tz(new Date(), argentinaTimezone);
//         //Genera un código de ticket único
//         const uniqueTicketCode = await generateCode.generateUniqueTicketCode();

//         //Crea un nuevo ticket
//         const nuevoTicket = {
//             code: uniqueTicketCode, //Usar el código generado
//             purchase_datetime: argentinaDateTime.toDate(),
//             purchaser: purchaserEmail, 
//         };

//         const productosNoComprados = [];

//         let nuevaOrden; 
//         let idOrden;

//         //Recorre los productos en el carrito
//         for (const productoEnCarrito of carrito.productos) {
//             const producto = await Producto.findById(productoEnCarrito.producto);

//             if (producto && producto.stock >= productoEnCarrito.cantidad) {
//                 //restar stock del producto y continuar
//                 producto.stock -= productoEnCarrito.cantidad;
//                 await producto.save();

//                 //Crear una nueva orden con el producto
//                 nuevaOrden = new Order({
//                     usuario: userId,
//                     productos: [productoEnCarrito],
//                     total: productoEnCarrito.precioUnitario * productoEnCarrito.cantidad,
//                     estado: 'aprobado',
//                     ticket: nuevoTicket,
//                 });

//                 await nuevaOrden.save();
//             } else {
//                 //no restar el stock pero agregar el producto al carrito de productos no comprados
//                 productosNoComprados.push(productoEnCarrito);
//             }
//         }

//         //Actualizar el carrito con los productos no comprados
//         carrito.productos = productosNoComprados;
//         carrito.total = carrito.productos.reduce((total, productoEnCarrito) => total + productoEnCarrito.precioUnitario * productoEnCarrito.cantidad, 0);
//         await cartDao.updateCart(carrito._id, carrito);

//         idOrden = nuevaOrden && nuevaOrden._id;

//         if (productosNoComprados.length === 0 && idOrden) {
//             res.status(201).json({
//                 message: 'Compra completada con éxito',
//                 OrderId: nuevaOrden._id,
//                 success: true,
//                 productsNotPurchased: [],
//             });
//         } else {
//             res.status(201).json({
//                 message: 'Algunos productos no fueron comprados por falta de stock',
//                 OrderId: nuevaOrden._id,
//                 success: false,
//                 productsNotPurchased: productosNoComprados,
//             });
//         }
//     } catch (error) {
//         req.logger.error('Error en el servidor:', error);
//     }
// }

//Ruta DELETE para limpiar el carrito
async function clearCart(req, res) {
    try {
        const userId = req.session.userId;

        await Carrito.deleteOne({ usuario: userId });

        res.status(204).send();
    } catch (error) {
        req.logger.error('Error en el servidor:', error);
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
            //Si el carrito no se encuentra, envía una respuesta de error
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
        req.logger.error('Error en el servidor:', error);
        res.status(500).json({ success: false, mensaje: 'Error en el servidor' });
    }
}

//Ruta PUT para actualizar la cantidad de un producto en el carrito
async function updateProductQuantity(req, res) {
    try {
        const userId = req.session.userId;
        const productId = req.params.productId;
        const newQuantity = req.body.newQuantity; 

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
        req.logger.error('Error en el servidor:', error);
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