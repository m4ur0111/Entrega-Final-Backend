require('dotenv').config();
const stripe = require('stripe')(process.env.KEY_STRIPE)
const Carrito = require('../models/cart.model');
const Order = require('../models/order.model');
const generateCode = require('../utils/function');
const axios = require('axios');
const moment = require('moment-timezone');
const cartDao = require('../dao/cart.dao');
const mongoose = require('mongoose');

async function renderSuccesPage(req, res) {
    res.render('success');
}

async function completePurchase(req, res) {
    try {
        const userId = req.session.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID de usuario no válido' });
        }

        const purchaserEmail = req.session.email;
        const carrito = await cartDao.getCartByUserId(userId);

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

        //Creo la sesión de Stripe
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: 'payment',
            success_url: 'http://localhost:8080/completado',
            cancel_url: 'http://localhost:8080/cart',
        });

        //Envio la URL de la sesión al cliente
        res.json({ redirectUrl: session.url });
    } catch (error) {
        console.error('Error al completar la compra:', error);
        res.status(500).send('Error al procesar la compra');
    }
}


module.exports = {
    renderSuccesPage,
    completePurchase,
};