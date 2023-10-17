const express = require('express');
const router = express.Router();
const githubController = require('../controllers/session.controller');

//Ruta GET para iniciar la autenticación de GitHub
router.get('/github', githubController.authenticateWithGitHub);

//Ruta GET para la devolución de llamada de autenticación de GitHub
router.get('/sessions/githubcallback', githubController.handleGitHubCallback);

module.exports = router;
