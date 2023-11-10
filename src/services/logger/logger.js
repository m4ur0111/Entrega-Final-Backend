const winston = require('winston');

// Define el sistema de niveles
const levels = {
    debug: 0,
    http: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5,
};

// Define los colores para los niveles
const colors = {
    debug: 'magenta',
    http: 'green',
    info: 'blue',
    warn: 'yellow',
    error: 'red',
    fatal: 'red',
};

winston.addColors(colors);

// Configura los formatos
const customFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple()
);

// Logger para desarrollo
const developmentLogger = winston.createLogger({
    levels,
    format: customFormat,
    transports: [new winston.transports.Console({ level: 'debug' })], 
});

// Logger para producción
const productionLogger = winston.createLogger({
    levels,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'errors.log', level: 'error' }),
        new winston.transports.File({ filename: 'info.log', level: 'info' }),
    ],
});

// Agregar el logger de desarrollo a la solicitud
const addDevelopmentLogger = (req, res, next) => {
    req.logger = developmentLogger;
    next();
};

// Agregar el logger de producción a la solicitud
const addProductionLogger = (req, res, next) => {
    req.logger = productionLogger;
    next();
};

module.exports = {
    addDevelopmentLogger,
    addProductionLogger,
};
