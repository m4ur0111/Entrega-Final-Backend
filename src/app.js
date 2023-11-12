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
const { addDevelopmentLogger, addProductionLogger } = require('./services/logger/logger');

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

//Middleware de manejo de errores
app.use(errorHandler);

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
    console.log("Conectado a la base de datos");
}).catch(error => {
    console.log("Error en la conexion", error)
});

// Agregar el logger de desarrollo en el entorno de desarrollo
if (process.env.NODE_ENV === 'development') {
    app.use(addDevelopmentLogger);
    console.log("usando desarrollo")
} else {
    // Agregar el logger de producción en otros entornos (como producción)
    app.use(addProductionLogger);
    console.log("usando produccion")
}

const users = {}

io.on('connection', (socket) => {
    console.log("Un usuario se ha conectado")
    
    socket.on("new-user", async (userData) => {
        const { userId, username, isAdmin } = userData;
        users[socket.id] = { userId, username, isAdmin };
        io.emit("userConnected", { userId, username, isAdmin });

        if (isAdmin) {
            // Emitir un mensaje especial cuando un admin se conecta
            io.emit("adminConnected", { userId, username });
        }
    });

    socket.on("chatMessage", (message) => {
        const username = users[socket.id]
        io.emit("message", { username, message })
    })

    socket.on("disconnect", () => {
        const username = users[socket.id]
        delete users[socket.id]
        io.emit("userDisconnected", username)
    })
})

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
    res.render('404'); 
});

//Iniciar el servidor 
http.listen(PORT, () => {
    console.log(`Servidor Express en funcionamiento en el puerto ${PORT}`)
});
