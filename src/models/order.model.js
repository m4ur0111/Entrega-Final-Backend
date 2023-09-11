const mongoose = require('mongoose');

const orderCollection = "orders"

const productoEnOrdenSchema = new mongoose.Schema({
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
    cantidad: Number,
    precioUnitario: Number,
    nombre: String, 
    imagen: String, 
});

const orderSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    productos: [productoEnOrdenSchema], 
    total: Number,
    fechaCreacion: { type: Date, default: Date.now }, 
    estado: { type: String, default: "aprobado" }, 
});

const Order = mongoose.model(orderCollection, orderSchema);

module.exports = Order;
