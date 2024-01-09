//Verifica la sesión del usuario
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

function simulateAuthentication(req, res, next) {
    req.session = req.session || {};
    
    req.session.userId = '650b88e5d7b093fdbfa05f4e';

    if (next) {
        next();
    }
}

module.exports = { requireLogin, simulateAuthentication };
