const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { requireLogin } = require('../middleware/authMiddleware');
const uploadDocument = require('../middleware/multer');

//Ruta GET para renderizar la página de registro
router.get('/register', usersController.renderRegisterPage);

//Ruta POST para agregar un usuario
router.post('/register', usersController.registerUser);

//Ruta GET para obtener la página de inicio de sesión
router.get('/login', usersController.renderLoginPage);

//Ruta POST para iniciar sesión del usuario
router.post('/login', usersController.loginUser);

//Ruta para cerrar sesión
router.get('/logout', usersController.logoutUser);

//Ruta para acceder al perfil
router.get('/perfil', requireLogin, usersController.renderProfile);

//Ruta para cambiar el rol del usuario
router.post('/premium', requireLogin, usersController.changeUserRole);

//Ruta para poder verificar si el usuario se puede actualizar a premium
router.post('/premium/:uid', requireLogin, usersController.updateToPremium);

//Ruta post para cargar documentos de un usuario
router.post('/:uid/documents', uploadDocument, usersController.uploadDocuments);

//Ruta para ver el listado de usuarios
router.get('/rol-usuario', usersController.renderAllUsers);

//Ruta para obtener a todos los usuarios con sus datos
router.get('/all-users', usersController.getAllUsersWithBasicInfo);

//Ruta para eliminar usuarios inactivos
router.delete('/delete-inactive-users', usersController.eliminarUsuariosInactivos);

module.exports = router;
