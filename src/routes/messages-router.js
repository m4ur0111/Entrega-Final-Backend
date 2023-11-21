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

router.get('/restablecer-contrasena/:token', (req, res) => {
    const token = req.params.token;

    try {
        const email = verificarTokenRestablecimiento(token);
        // Mostrar la vista para restablecer la contraseña
        // res.render('restablecerContrasena', { email, token });
        console.log(`El token es valido ${email} ${token}`)
    } catch (error) {
        // El token no es válido, redirigir a la página para generar un nuevo correo de restablecimiento
        // res.redirect('/generar-correo-restablecimiento');
        console.log("El token no es valido")
    }
});

module.exports = router;