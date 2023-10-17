const Producto = require('../models/products.models');

async function createProduct(newProductData) {
    try {
        const productoCreado = await Producto.create(newProductData);
        return productoCreado;
    } catch (error) {
        throw error;
    }
}

async function findProductById(productId) {
    try {
        const producto = await Producto.findById(productId);
        return producto;
    } catch (error) {
        throw error;
    }
}

async function updateProduct(productId, updatedProductData) {
    try {
        const productoActualizado = await Producto.findByIdAndUpdate(
            productId,
            updatedProductData,
            { new: true }
        );
        return productoActualizado;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createProduct,
    findProductById,
    updateProduct,
};
