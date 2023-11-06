const bcrypt = require('bcryptjs');
const userDao = require('../dao/user.dao');
const errorHandlers = require('../services/errors/errorHandler');

//Renderizar la página de registro
function renderRegisterPage(req, res) {
    res.render('register');
}

//Agregar un nuevo usuario
async function registerUser(req, res) {
    try {
        const { nombre, apellido, edad, email, pass } = req.body;

        const usuarioCreado = await userDao.createUser({
            nombre,
            apellido,
            edad,
            email,
            pass,
        });

        if (!usuarioCreado) {
            errorHandlers.customErrorHandler('usuarioExistente', res); //Manejo de error personalizado
        } else {
            console.log('Usuario registrado con éxito:', email);
            res.redirect('login');
        }
    } catch (error) {
        console.error('Error en el servidor:', error);
        errorHandlers.customErrorHandler('errorServidor', res); //Manejo de error personalizado
    }
}

//Renderizar la página de inicio de sesión
function renderLoginPage(req, res) {
    res.render('login');
}

//Iniciar sesión del usuario
async function loginUser(req, res) {
    try {
        const { email, pass } = req.body;
        const usuario = await userDao.findUserByEmail(email);

        if (!usuario) {
            errorHandlers.customErrorHandler('usuarioNoEncontrado', res); //Manejo de error personalizado
        } else {
            const isPasswordValid = await bcrypt.compare(pass, usuario.pass);

            if (!isPasswordValid) {
                errorHandlers.customErrorHandler('contrasenaIncorrecta', res); //Manejo de error personalizado
            } else {
                req.session.userId = usuario._id;
                req.session.email = email;
                res.redirect('/');
            }
        }
    } catch (error) {
        console.error('Error en el servidor:', error);
        errorHandlers.customErrorHandler('errorServidor', res); //Manejo de error personalizado
    }
}

//Cerrar la sesión del usuario
function logoutUser(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ mensaje: 'Error al cerrar sesión' });
        }
        res.redirect('/login');
    });
}

module.exports = {
    renderRegisterPage,
    registerUser,
    renderLoginPage,
    loginUser,
    logoutUser,
};
