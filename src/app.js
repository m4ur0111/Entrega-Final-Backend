require('dotenv').config();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUiExpress = require('swagger-ui-express');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const session = require('express-session');
const cookieParser = require('cookie-parser');
const initializePassport = require('./config/passport.config');
const errorHandler = require('./services/errors/errorHandler');
const { addDevelopmentLogger, addProductionLogger } = require('./services/logger/logger');

// Configuración del puerto
const PORT = process.env.PORT;

// Configuración de Express
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "views")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Configuracion de Swagger para la documentación
const SwaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: "Documentacion de API",
            description: "API para productos y carrito",
            version: '1.0.3',
        },
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
}

const specs = swaggerJsdoc(SwaggerOptions)
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

// Configuración de middleware de cookie-parser
app.use(cookieParser());

// Configuración de express-session
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30,
        secure: false,
        httpOnly: true,
        sameSite: 'strict',
    }
});

app.use(sessionMiddleware);

// Inicializo Passport
initializePassport();

// Conexion a la base de datos
mongoose.connect(process.env.MONGODB_URI, {}).then(() => {
    // console.log("Conectado a la base de datos");
}).catch(error => {
    console.log("Error en la conexion", error);
});

// Agregar el logger de desarrollo en el entorno de desarrollo
if (process.env.NODE_ENV === 'development') {
    app.use(addDevelopmentLogger);
    console.log("usando desarrollo");
} else {
    // Agregar el logger de producción en otros entornos (como producción)
    app.use(addProductionLogger);
    console.log("usando produccion");
}

// En tu archivo de configuración de Express o donde estés configurando EJS
app.locals.isDocumentLoaded = function(documentName, documents) {
    // Verifica si el documento está en la lista de documentos cargados
    return documents.some(doc => doc.name === documentName);
};


// Rutas
const indexRoutes = require('./routes/index.router');
const usersRoutes = require('./routes/users.router');
const productRoutes = require('./routes/products.router');
const cartRoutes = require('./routes/cart-router');
const sessionRoutes = require('./routes/session.router');
const messagesRoutes = require('./routes/messages-router');

app.use('/', indexRoutes);
app.use('/', usersRoutes);
app.use('/', productRoutes);
app.use('/', cartRoutes);
app.use('/', sessionRoutes);
app.use('/', messagesRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    errorHandler.customErrorHandler(err, req, res, next);
});

// Último middleware para manejar rutas no encontradas
app.use('*', async (req, res) => {
    res.render('404');
});

// Exporta la instancia de Express
module.exports = app;

// Iniciar el servidor
http.listen(PORT, () => {
    console.log(`Servidor Express en funcionamiento en el puerto ${PORT}`);
});
