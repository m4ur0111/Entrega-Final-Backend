const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/github', passport.authenticate('github',{scope:['user:email']}),async(req, res) => {

})

router.get('/sessions/githubcallback', passport.authenticate('github',{failureRedirect:'/login'}),async(req, res) => {
    req.session.userId = req.user._id;
    res.redirect('/');
})

module.exports = router;