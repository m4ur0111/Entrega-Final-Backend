const express = require('express');
const router = express.Router();
const emailService = require("../controllers/messages.controller");

router.post("/enviar-correo", (req, res) => {
    const { nombre, email } = req.body;

    emailService.enviarCorreo({ nombre, email }, (error, resultado) => {
        if (error) {
            res.send(error);
        } else {
            res.send(resultado);
        }
    });
});

module.exports = router;