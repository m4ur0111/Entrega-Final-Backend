const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messages.controller');

router.post("/enviar-correo", messageController.sendMessage);

router.get("/restablecer-contrasena/:token/:email", messageController.resetPass);

router.post("/procesar-contrasena", messageController.procesarContrasena);

module.exports = router;