require('dotenv').config();
const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');

//Ruta para procesar la compra de los productos 
router.post('/create-checkout-session', paymentsController.completePurchase);

//Ruta para ver la pagina de success
router.get('/completado', paymentsController.renderSuccesPage);

module.exports = router;