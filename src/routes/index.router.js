const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index.controller');
const productMocking = require('../utils/mocking');
const { requireLogin } = require('../middleware/authMiddleware');

//Ruta GET para la página de inicio
router.get('/', requireLogin, indexController.renderHomePage);

router.get('/mockingproducts', productMocking.renderProducts);

module.exports = router;
