require('dotenv').config();
const jwt = require('jsonwebtoken');

//Función para generar un token de restablecimiento de contraseña
function generarTokenRestablecimiento(email) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
}

//Función para verificar y decodificar un token de restablecimiento de contraseña
function verificarTokenRestablecimiento(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const ahora = Date.now() / 1000;
        if (decoded.exp < ahora) {
            throw new Error('El token ha expirado');
        }
        return decoded.email;
    } catch (error) {
        console.error(error); 
        throw new Error('Token no válido');
    }
}

module.exports = { generarTokenRestablecimiento, verificarTokenRestablecimiento };
