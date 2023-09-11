const mongoose = require('mongoose');

const cartCollection = "carts"

const productoEnCarritoSchema = new mongoose.Schema({
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
    cantidad: Number,
    precioUnitario: Number,
    nombre: String, 
    imagen: String, 
});


const carritoSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    productos: [productoEnCarritoSchema], 
    total: Number,
});

const Carrito = mongoose.model(cartCollection, carritoSchema);

module.exports = Carrito;
