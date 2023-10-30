const passport = require('passport');

//Manejar la autenticación de GitHub
async function authenticateWithGitHub(req, res) {
    passport.authenticate('github', { scope: ['user:email'] })(req, res);
}

//Manejar la devolución de llamada de autenticación de GitHub
async function handleGitHubCallback(req, res) {
    passport.authenticate('github', { failureRedirect: '/login' })(req, res, () => {
        if (req.user) {
        req.session.userId = req.user._id;
        req.session.email = req.user.email;
        res.redirect('/');
        } else {
        //Manejar la lógica si la autenticación falla
        res.redirect('/login');
        }
    });
}

module.exports = {
    authenticateWithGitHub,
    handleGitHubCallback,
};
