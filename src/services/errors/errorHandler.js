const errorDictionary = require('./errorDictionary');

function errorHandler(err, req, res, next) {
    const errorCode = err.message; //El código de error se toma del mensaje del error
    if (errorDictionary[errorCode]) {
        res.status(400).json({ mensaje: errorDictionary[errorCode] });
    } else {
        res.status(500).json({ mensaje: 'Error genérico' });
    }
}

module.exports = errorHandler;
