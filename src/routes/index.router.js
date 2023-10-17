const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index.controller');
const { requireLogin } = require('../middleware/authMiddleware');

//Ruta GET para la página de inicio
router.get('/', requireLogin, indexController.renderHomePage);

module.exports = router;
