const mongoose = require('mongoose');

const userCollection = "users"

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true, max: 100 },
    email: { type: String, required: true, max: 100 },
    pass: { type: String, required: true, max: 50 },
    rol: { type: String, default: 'user' }, //Rol por defecto: 'user'
});

const userModel = mongoose.model(userCollection, userSchema);

module.exports = {userModel};
