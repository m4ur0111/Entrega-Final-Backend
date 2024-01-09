require('dotenv').config();
const express = require('express');
const Producto = require('../models/products.models');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { requireLogin } = require('../middleware/authMiddleware');

//Ruta GET para la página de carrito
router.get('/cart', cartController.viewCartPage);

//Ruta GET para la página de compra completada
// router.get('/completado', requireLogin, cartController.viewBuyCompletePage);

//Ruta POST para agregar un producto al carrito
router.post('/agregar-al-carrito/:productoId', cartController.addToCart);

//Ruta POST para finalizar la compra
router.post('/finalizar-compra-stripe', cartController.completePurchase);

//Ruta DELETE para limpiar el carrito
router.delete('/limpiar-carrito', cartController.clearCart);

//Ruta DELETE para eliminar un producto del carrito
router.delete('/limpiar/:productId', cartController.removeProductFromCart);

//Ruta PUT para actualizar la cantidad de un producto en el carrito
router.put('/cart/update-quantity/:productId', cartController.updateProductQuantity);

module.exports = router;