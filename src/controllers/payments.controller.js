require('dotenv').config();
const stripe = require('stripe')(process.env.KEY_STRIPE)
const Carrito = require('../models/cart.model');
const Order = require('../models/order.model');
const generateCode = require('../utils/function');
const Producto = require('../models/products.models');
const axios = require('axios');
const moment = require('moment-timezone');
const cartDao = require('../dao/cart.dao');
const mongoose = require('mongoose');
const Email = require('../controllers/messages.controller');

async function renderSuccesPage(req, res) {
    res.render('success');
}

const completePurchase = async (req, res) => {
    try {
        const userId = req.session.userId;
        const purchaserEmail = req.session.email;
        const carrito = await cartDao.getCartByUserId(userId);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID de usuario no válido' });
        }

        //Verifica si el carrito tiene productos
        if (!carrito || carrito.productos.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }

        //Obtengo la tasa de cambio actual
        const exchangeRateResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const exchangeRate = exchangeRateResponse.data.rates.ARS;

        const line_items = carrito.productos.map(producto => {
            const priceInUSD = producto.precioUnitario / exchangeRate;

            return {
                price_data: {
                    product_data: {
                        name: producto.nombre,
                        description: producto.descripcion,
                        images: [producto.imagen],
                    },
                    currency: 'usd',
                    unit_amount: Math.round(priceInUSD * 100),
                },
                quantity: producto.cantidad,
            };
        });

        const success_url = 'http://localhost:8080/completado';
        const cancel_url = 'http://localhost:8080/cart';

        //Creo la sesión de Stripe
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: 'payment',
            success_url,
            cancel_url,
        });

        console.log(success_url)
        console.log(cancel_url)
        // Llama a handleSuccessfulPayment pasando userId y purchaserEmail
        const paymentResult = await handleSuccessfulPayment(carrito, userId, purchaserEmail, success_url, cancel_url);
        console.log(paymentResult);

        //Envio la URL de la sesión al cliente
        res.json({ redirectUrl: session.url });
    } catch (error) {
        console.error('Error al completar la compra:', error);
        res.status(500).send('Error al procesar la compra');
    }
}

const handleSuccessfulPayment = async (carrito, userId, purchaserEmail, success_url, cancel_url) => {
    try {
        if (success_url === 'http://localhost:8080/completado') {
            // Define el uso horario de Argentina
            const argentinaTimezone = 'America/Argentina/Buenos_Aires';
            const argentinaDateTime = moment.tz(new Date(), argentinaTimezone);

            // Genera un código de ticket único
            const uniqueTicketCode = await generateCode.generateUniqueTicketCode();

            // Crea un nuevo ticket
            const nuevoTicket = {
                code: uniqueTicketCode, // Usar el código generado
                purchase_datetime: argentinaDateTime.toDate(),
                purchaser: purchaserEmail,
            };

            const productosNoComprados = [];

            let nuevaOrden;
            let idOrden;

            // Ejemplo de cómo podrías usar mongoose.Types.ObjectId.isValid
            const ownerId = mongoose.Types.ObjectId.isValid(userId) ? userId : null;

            // Crea o actualiza documentos en la colección products
            for (const productoEnCarrito of carrito.productos) {
                const producto = await Producto.findById(productoEnCarrito.producto);

                if (producto && producto.stock >= productoEnCarrito.cantidad) {
                    // Resta el stock del producto y continúa
                    producto.stock -= productoEnCarrito.cantidad;
                    producto.owner = ownerId;  // Asegúrate de asignar un ObjectId válido
                    await producto.save();

                    // Crea una nueva orden con el producto
                    nuevaOrden = new Order({
                        usuario: ownerId,
                        productos: [productoEnCarrito],
                        total: productoEnCarrito.precioUnitario * productoEnCarrito.cantidad,
                        estado: 'aprobado',
                        ticket: nuevoTicket,
                    });

                    await nuevaOrden.save();
                } else {
                    productosNoComprados.push(productoEnCarrito);
                }
            }

            // Actualiza el carrito con los productos no comprados
            carrito.productos = productosNoComprados;
            carrito.total = carrito.productos.reduce((total, productoEnCarrito) => total + productoEnCarrito.precioUnitario * productoEnCarrito.cantidad, 0);
            await cartDao.updateCart(carrito._id, carrito);

            idOrden = nuevaOrden && nuevaOrden._id;

            // Envía un correo al usuario notificándole que la compra ha sido recibida correctamente
            const userEmail = purchaserEmail;
            const subject = 'Compra recibida exitosamente';
            const message = '¡Gracias por tu compra! Tu pedido ha sido recibido correctamente.';

            Email.generarContenidoCompraExitosa({ email: userEmail, subject, message }, (error, resultado) => {
                if (error) {
                    console.log('Error al enviar el correo de confirmación de compra:', error);
                } else {
                    console.log('Correo de confirmación de compra enviado con éxito:', resultado);
                }
            });

            if (productosNoComprados.length === 0 && idOrden) {
                return {
                    message: 'Compra completada con éxito',
                    OrderId: nuevaOrden._id,
                    success: true,
                    productsNotPurchased: [],
                };
            } else {
                return {
                    message: 'Algunos productos no fueron comprados por falta de stock',
                    OrderId: nuevaOrden._id,
                    success: false,
                    productsNotPurchased: productosNoComprados,
                };
            }
        } else if (cancel_url === 'http://localhost:8080/cart') {
            console.log('Pago cancelado, el carrito no se limpiará');
        }
    } catch (error) {
        console.error('Error al manejar el pago:', error);
        throw new Error('Error al manejar el pago');
    }
};

module.exports = {
    renderSuccesPage,
    completePurchase,
};