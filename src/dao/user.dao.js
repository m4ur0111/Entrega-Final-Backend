const { userModel } = require('../models/user.model');
const bcrypt = require('bcryptjs');

async function findUserByEmail(email) {
    try {
        const user = await userModel.findOne({ email });
        return user;
    } catch (error) {
        throw error;
    }
}

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

async function updatePass(email, nuevaContrasena) {
    try {
        const hashedPass = await bcrypt.hash(nuevaContrasena, 10);
        const resultado = await userModel.updateOne({ email }, { pass: hashedPass });
        return resultado;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    findUserByEmail,
    createUser,
    updatePass,
};
