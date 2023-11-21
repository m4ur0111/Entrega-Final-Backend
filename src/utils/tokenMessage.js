require('dotenv').config();
const jwt = require('jsonwebtoken');

// Función para generar un token de restablecimiento de contraseña
function generarTokenRestablecimiento(email) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
}

//Función para verificar y decodificar un token de restablecimiento de contraseña
function verificarTokenRestablecimiento(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.email;
    } catch (error) {
        throw new Error('Token no válido');
    }
}

module.exports = { generarTokenRestablecimiento, verificarTokenRestablecimiento };
