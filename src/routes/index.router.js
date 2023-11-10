const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index.controller');
const productMocking = require('../utils/mocking');
const { requireLogin } = require('../middleware/authMiddleware');

//Ruta GET para la página de inicio
router.get('/', requireLogin, indexController.renderHomePage);

router.get('/mockingproducts', productMocking.renderProducts);

router.get('/loggerTest', (req, res) => {
    req.logger.error('Este es un mensaje de nivel error');
    req.logger.warn('Este es un mensaje de nivel warning'); 
    req.logger.info('Este es un mensaje de nivel info');
    req.logger.http('Este es un mensaje de nivel http');
    req.logger.debug('Este es un mensaje de nivel debug');
    req.logger.fatal('Este es un mensaje de nivel fatal'); 

    //Simula un error
    try {
        throw new Error('Este es un error de prueba');
    } catch (error) {
        req.logger.error('Error en /loggerTest:', error);
    }

    res.send('Punto de prueba de logs');
});

module.exports = router;
