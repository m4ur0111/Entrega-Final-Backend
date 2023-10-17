const { userModel } = require('../models/user.model');
const bcrypt = require('bcryptjs');

//Funcion para encontrar el email del usuario
async function findUserByEmail(email) {
    try {
        const user = await userModel.findOne({ email });
        return user;
    } catch (error) {
        throw error;
    }
}

//Funcion para crear un usuario
async function createUser({ nombre, apellido, edad, email, pass }) {
    try {
        const usuarioExistente = await findUserByEmail(email);
        if (usuarioExistente) {
            return null; // Usuario ya existe
        }

        const hashedPass = await bcrypt.hash(pass, 10);
        const nuevoUsuario = new userModel({
            nombre,
            apellido,
            edad,
            email,
            pass: hashedPass,
        });

        const usuarioCreado = await nuevoUsuario.save();
        return usuarioCreado;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    findUserByEmail,
    createUser,
};
