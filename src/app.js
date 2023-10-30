require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const session = require('express-session');
const cookieParser = require('cookie-parser');
const initializePassport = require('./config/passport.config');

//Configuración del puerto
const PORT = process.env.PORT;

//Configuración de Express
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "views")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

//Configuración de middleware de cookie-parser
app.use(cookieParser());

//Configuración de express-session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30,
        secure: false,
        httpOnly: true, 
        sameSite: 'strict',
    }
}));

//Inicializo Passport
initializePassport();

//Conexion a la base de datos
mongoose.connect(process.env.MONGODB_URI, {
}).then(() => {
    console.log("Conectado a la base de datos")
}).catch(error => {
    console.log("Error en la conexion", error)
});

//Rutas
const indexRoutes = require('./routes/index.router');
const usersRoutes = require('./routes/users.router');
const productRoutes = require('./routes/products.router');
const cartRoutes = require('./routes/cart-router');
const sessionRoutes = require('./routes/session.router');

app.use('/', indexRoutes);
app.use('/', usersRoutes);
app.use('/', productRoutes);
app.use('/', cartRoutes);
app.use('/', sessionRoutes);
app.use('*', async (req, res) => {
    res.render('404'); //Renderiza la vista 404.hbs
});

//Iniciar el servidor 
http.listen(PORT, () => {
    console.log("Servidor corriendo correctamente")
});
