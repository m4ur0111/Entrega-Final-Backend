const bcrypt = require('bcryptjs');
const userDao = require('../dao/user.dao');
const path = require('path');
const { userModel } = require('../models/user.model');
const errorHandlers = require('../services/errors/errorHandler');
const { getUserRoleFromDatabase } = require('../utils/function');

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
            req.logger.info('Usuario registrado con éxito:', email);
            res.redirect('login');
        }
    } catch (error) {
        req.logger.error('Error en el servidor:', error);
        // errorHandlers.customErrorHandler('errorServidor', res); //Manejo de error personalizado
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
        req.logger.error('Error en el servidor:', error);
    }
}

//Cerrar la sesión del usuario
function logoutUser(req, res) {
    req.session.destroy((err) => {
        if (err) {
            req.logger.error('Error al cerrar sesión:', err);
            return res.status(500).json({ mensaje: 'Error al cerrar sesión' });
        }
        res.redirect('/login');
    });
}

//Renderiza la vista del perfil del usuario
async function renderProfile(req, res) {
    try {
        const userId = req.session.userId;
        const usuario = await userModel.findById(userId);

        // Verificar si el usuario tiene documentos cargados
        const hasDocuments = usuario.documents && usuario.documents.length > 0;

        res.render('perfil', {
            userId: usuario.id,
            nombreUsuario: usuario.nombre,
            userEmail: usuario.email,
            userRol: usuario.rol,
            isPremium: usuario.rol === 'premium',
            isAdmin: usuario.rol === 'admin',
            profilePhoto: usuario.profilePhoto,
            hasDocuments: hasDocuments,
            documents: usuario.documents,
        });
    } catch (error) {
        console.error('Error al renderizar el perfil:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
}

//Funcion para verificar el rol del usuario
async function checkUserRole(req, res) {
    try {
        const userId = req.session.userId; 

        const user = await userModel.findById(userId);

        if (user && (user.rol === 'premium' || user.rol === 'admin')) {
            res.status(200).send();
        } else {
            res.status(403).json({ mensaje: 'Acceso no autorizado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
}

//Cambiar el rol del usuario a premium o user
// Verificar el rol del usuario
async function checkUserRole(userId) {
    try {
        const user = await userModel.findById(userId);

        // Verificar si el array documents tiene exactamente 3 elementos
        return user && user.documents && user.documents.length === 3;
    } catch (error) {
        console.error(error);
        return false;
    }
}

// Cambiar el rol del usuario a premium o user
async function changeUserRole(req, res) {
    try {
        const userIdToUpdate = req.body.userIdToUpdate;
        const newRole = req.body.newRole;

        // Verifica si el usuario al que le estás cambiando el rol tiene los documentos cargados
        const hasRequiredDocuments = await checkUserRole(userIdToUpdate);

        if (!hasRequiredDocuments) {
            return res.status(400).json({ message: 'El usuario no tiene los documentos requeridos cargados.' });
        }

        // Verifica si el nuevo rol es válido (user o premium)
        if (newRole !== 'user' && newRole !== 'premium') {
            return res.status(400).json({ message: 'Rol no válido. Use "user" o "premium".' });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userIdToUpdate,
            { rol: newRole },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario actualizado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
}

//Renderizar la pagina para cambiar el rol del usuario
async function renderAllUsers(req, res) {
    res.render('change-rol');
}

//Funcion para subir los archivos de los usuarios
async function uploadDocuments(req, res) {
    try {
        const userId = req.params.uid;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Verificar si se están subiendo documentos
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No se han proporcionado documentos' });
        }

        // Lógica para manejar los documentos subidos
        const newDocuments = req.files.map(file => {
            return {
                name: file.originalname,
                reference: file.filename,
            };
        });

        // Agregar los nuevos documentos al array si no existen
        for (const newDoc of newDocuments) {
            const existingDocIndex = user.documents.findIndex(doc => doc.name === newDoc.name);
            if (existingDocIndex === -1) {
                user.documents.push(newDoc);
            } else {
                // Reemplazar el documento existente
                user.documents[existingDocIndex] = newDoc;
            }
        }

        await user.save();

        res.status(200).json({ success: true, message: 'Documentos subidos exitosamente' });
    } catch (error) {
        console.error('Error al subir los documentos:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
}

//Funcion para verificar si estan cargados los documentos
async function updateToPremium(req, res) {
    try {
        const userId = req.params.uid;
    
        // Verifica si el usuario ha cargado los documentos requeridos
        const user = await userModel.findById(userId);
    
        const requiredDocuments = ['identificacion.pdf', 'comprobantedomicilio.pdf', 'comprobanteestado.pdf'];

        const hasRequiredDocuments = requiredDocuments.every(docName =>
            user.documents.some(doc => doc.name === docName)
        );

        if (!hasRequiredDocuments) {
            return res.status(400).json({ message: 'Por favor, carga los documentos requeridos primero.' });
        }
    
        // Actualiza al usuario a premium
        user.rol = 'premium';
        await user.save();
    
        res.status(200).json({ message: 'Usuario actualizado a premium.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar al usuario a premium.' });
    }
}

// Obtener todos los usuarios con datos principales
async function getAllUsersWithBasicInfo(req, res) {
    try {
        const users = await userModel.find({}, { nombre: 1, apellido: 1, edad: 1, email: 1, rol: 1 });
    
        if (req.accepts('html')) {
            res.render('all-users', { users });
        } else {
            res.json(users);
        }
        } catch (error) {
        console.error('Error al obtener usuarios con datos principales:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
}

// Modifica la función enviarCorreosAUsuariosEliminados
async function enviarCorreosAUsuariosEliminados(usuarios) {
    if (usuarios && usuarios.deletedCount !== undefined) {
        // Si usuarios es un objeto con deletedCount, entonces es el resultado de deleteMany
        console.log(`${usuarios.deletedCount} usuarios eliminados exitosamente.`);

        if (usuarios.deletedCount > 0) {
            // Itera sobre los usuarios eliminados solo si se eliminaron algunos
            for (const usuario of usuarios.result) {
                try {
                    const { nombre, email } = usuario;

                    // Lógica para enviar el correo a cada usuario eliminado
                    await enviarCorreo({ nombre, email }, (error, resultado) => {
                        if (error) {
                            console.log(`Error al enviar correo a ${email}: ${error}`);
                        } else {
                            console.log(`Correo enviado a ${email}: ${resultado}`);
                        }
                    });
                } catch (error) {
                    console.error('Error al enviar correos electrónicos:', error);
                }
            }

            // Devuelve un objeto indicando que se eliminaron usuarios
            return { eliminados: true, cantidad: usuarios.deletedCount };
        } else {
            console.log('No se encontraron usuarios inactivos para eliminar.');

            // Devuelve un objeto indicando que no se eliminaron usuarios
            return { eliminados: false, cantidad: 0 };
        }
    } else if (Array.isArray(usuarios)) {
        // Si usuarios es un array, entonces es el resultado de find y no se eliminaron usuarios
        console.log('No se encontraron usuarios inactivos para eliminar.');

        // Devuelve un objeto indicando que no se eliminaron usuarios
        return { eliminados: false, cantidad: 0 };
    } else {
        console.log('Resultado inesperado de deleteMany:', usuarios);

        // Devuelve un objeto indicando un resultado inesperado
        return { eliminados: false, cantidad: 0 };
    }
}

// Modifica la función eliminarUsuariosInactivos
async function eliminarUsuariosInactivos(req, res) {
    try {
        // Obtén la fecha actual menos 2 días
        const fechaLimite = new Date(Date.now() - (2 * 24 * 60 * 60 * 1000));

        // Construye la condición para encontrar usuarios inactivos
        const condicion = { last_connection: { $lt: fechaLimite } };

        // Encuentra y elimina los usuarios inactivos
        const usuariosEliminados = await userModel.deleteMany(condicion);

        // Envía correos electrónicos a los usuarios eliminados
        await enviarCorreosAUsuariosEliminados(usuariosEliminados);

        // Responde con un objeto JSON indicando la cantidad de usuarios eliminados
        res.json({ cantidad: usuariosEliminados.deletedCount });
    } catch (error) {
        console.error('Error al eliminar usuarios inactivos:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

module.exports = {
    renderRegisterPage,
    registerUser,
    renderLoginPage,
    loginUser,
    logoutUser,
    renderProfile,
    checkUserRole,
    changeUserRole,
    renderAllUsers,
    updateToPremium,
    uploadDocuments,
    getAllUsersWithBasicInfo,
    eliminarUsuariosInactivos,
};
