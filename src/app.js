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
const errorHandler = require('./services/errors/errorHandler');
const compression = require('compression');
const brotli = require('brotli');
const compressionOptions = {
    level: 11, // El nivel de compresión más alto
    threshold: 1024, // Solo comprime si la respuesta es de al menos 1 KB
};

//Configuración del puerto
const PORT = process.env.PORT;

//Habilito la compresión Gzip y Deflate
app.use(compression(compressionOptions));

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
// Middleware de manejo de errores
app.use(errorHandler);
app.use('*', async (req, res) => {
    res.render('404'); //Renderiza la vista 404.hbs
});

//Iniciar el servidor 
http.listen(PORT, () => {
    console.log(`Servidor Express en funcionamiento en el puerto ${PORT}`)
});
