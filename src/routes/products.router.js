const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
const { requireLogin } = require('../middleware/authMiddleware');

//Ruta DELETE para eliminar productos
router.delete('/limpiar/:productId', productsController.deleteProduct);

//Ruta GET para obtener los productos con variables
router.get('/products', productsController.getProducts);

//Ruta GET para la página de agregar producto
router.get('/product/add' ,productsController.renderAddProductPage);

//Ruta POST para agregar un nuevo producto
router.post('/products', productsController.addProduct);

//Ruta GET para mostrar la vista de edición de productos
router.get('/product/edit/:id', productsController.renderEditProductPage);

//Ruta POST para procesar la edición de un producto
router.post('/product/edit/:id', productsController.editProduct);

//Ruta GET para ver los detalles de un producto
router.get('/product/:_id', productsController.viewProductDetails);

//Ruta GET para ver los productos que el usuario creo
router.get('/my-products', productsController.getMyProducts);

module.exports = router;