require('dotenv').config();
const nodemailer = require("nodemailer");
const { generarTokenReestablecimiento } = require('../utils/tokenMessage');

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.USER_MAILER,
        pass: process.env.CODE_MAILER,
    },
});

function enviarCorreo({ nombre, email }, callback) {
    const token = generarTokenReestablecimiento(email);

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
                    <p class="message">Este es un correo de prueba para el restablecimiento de contraseña.</p>
                    <a href="http://localhost:8080/restablecer-contrasena/${token}">Restablecer Contraseña</a>
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
            console.log("Correo enviado", info.response);
            callback(null, "Correo enviado con éxito");
        }
    });
}

module.exports = { enviarCorreo };
