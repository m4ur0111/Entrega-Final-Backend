const mongoose = require('mongoose');

const orderCollection = "orders";

const productoEnOrdenSchema = new mongoose.Schema({
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
    cantidad: Number,
    precioUnitario: Number,
    nombre: String,
    imagen: String,
});

const ticketSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, 
    code: String, 
    purchase_datetime: { type: Date, default: Date.now }, 
    purchaser: String,
});

const orderSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    productos: [productoEnOrdenSchema],
    total: Number,
    fechaCreacion: { type: Date, default: Date.now },
    estado: { type: String, default: "aprobado" },
    ticket: ticketSchema, 
});

const Order = mongoose.model(orderCollection, orderSchema);

module.exports = Order;
