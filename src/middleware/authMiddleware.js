//Verifica la sesión del usuario
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

function simulateAuthentication(req, res, next) {
    // Asegurarse de que req.session esté definido antes de establecer userId
    req.session = req.session || {};
    
    // Simular la autenticación estableciendo un ID de usuario en la sesión
    req.session.userId = '650b88e5d7b093fdbfa05f4e'; // Reemplaza con el ID del usuario que deseas utilizar

    if (next) {
        next(); // Llama a next solo si está presente (se usa como middleware de Express)
    }
}

module.exports = { requireLogin, simulateAuthentication };
