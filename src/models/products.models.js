const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productCollection = "products";

const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true },
    categoria: { type: String, required: true },
    imagen: { type: String, required: true },
    disponibilidad: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    stock: { type: String, required: true },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

productoSchema.plugin(mongoosePaginate);

const Producto = mongoose.model(productCollection, productoSchema);

module.exports = Producto;
