const Carrito = require('../models/cart.model');
const Order = require('../models/order.model');

async function getCartByUserId(userId) {
    try {
        const carrito = await Carrito.findOne({ usuario: userId });
        return carrito;
    } catch (error) {
        throw error;
    }
}

async function createCart(userId) {
    try {
        const carrito = await Carrito.create({ usuario: userId, productos: [], total: 0 });
        return carrito;
    } catch (error) {
        throw error;
    }
}

async function updateCart(cartId, updatedCartData) {
    try {
        const carrito = await Carrito.findByIdAndUpdate(cartId, updatedCartData, { new: true });
        return carrito;
    } catch (error) {
        throw error;
    }
}

async function createOrder(newOrderData) {
    try {
        const nuevaOrden = await Order.create(newOrderData);
        return nuevaOrden;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getCartByUserId,
    createCart,
    updateCart,
    createOrder,
};
