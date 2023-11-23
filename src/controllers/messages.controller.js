require('dotenv').config();
const nodemailer = require("nodemailer");
const { generarTokenRestablecimiento, verificarTokenRestablecimiento } = require('../utils/tokenMessage');
const userDao = require('../dao/user.dao');

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.USER_MAILER,
        pass: process.env.CODE_MAILER,
    },
});

function enviarCorreo({ nombre, email }, callback) {
    const token = generarTokenRestablecimiento(email);

    const mailOptions = {
        from: process.env.USER_MAILER,
        to: `${email}`,
        subject: "Restablecer Contraseña",
        html: `
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background-color: #f4f4f4;
                        padding: 20px;
                    }
                    .container {
                        background-color: #fff;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                    }
                    .greeting {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 20px;
                    }
                    .message {
                        font-size: 16px;
                        line-height: 1.6;
                        margin-bottom: 30px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <p class="greeting">Hola ${nombre}.</p>
                    <p class="greeting">Email: ${email}.</p>
                    <p class="message">Presione el botón para ser redirigido y proceder al restablecimiento de su contraseña.</p>
                    <a href="http://localhost:8080/restablecer-contrasena/${token}/${email}">Restablecer Contraseña</a>
                    <!-- Agrega más contenido según tus necesidades -->
                </div>
            </body>
            </html>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            callback("Error de envío");
        } else {
            callback(null, "Correo enviado con éxito");
        }
    });
}

async function sendMessage(req, res) {
    const { nombre, email } = req.body;

    enviarCorreo({ nombre, email }, (error, resultado) => {
        if (error) {
            res.send(error);
        } else {
            res.send(resultado);
        }
    });
}

async function resetPass(req, res) {
    const token = req.params.token;
    let email = req.params.email;  

    try {
        email = verificarTokenRestablecimiento(token);

        // Obtener información adicional del usuario (nombre) si es necesario
        const usuario = await userDao.findUserByEmail(email);
        const nombreUsuario = usuario ? usuario.nombre : '';

        res.render('reset-pass', {
            Email: email,
            Token: token,
            Nombre: nombreUsuario,
        });
    } catch (error) {
        if (error.message === 'Token no válido') {
            // Obtener información adicional del usuario (nombre) si es necesario
            const usuario = await userDao.findUserByEmail(email);
            const nombreUsuario = usuario ? usuario.nombre : '';

            // Redirigir a la vista de errorPass con el mensaje adecuado y la información del usuario
            return res.render('errorPass', {
                mensaje: 'El enlace ha expirado. Genera un nuevo correo de restablecimiento.',
                Email: email,
                Nombre: nombreUsuario,
            });
        }

        console.error(error);
        res.render('errorPass', { mensaje: 'Error al procesar el restablecimiento de contraseña' });
    }
}

async function procesarContrasena(req, res) {
    const { token, nuevaContrasena, confirmarContrasena } = req.body;

    try {
        const email = verificarTokenRestablecimiento(token);

        if (nuevaContrasena !== confirmarContrasena) {
            return res.render('error', { mensaje: 'Las contraseñas no coinciden' });
        }

        await userDao.updatePass(email, nuevaContrasena);

        res.render('login');
    } catch (error) {
        console.error(error);
        res.render('login');
    }
}

module.exports = { enviarCorreo, sendMessage, resetPass, procesarContrasena };
