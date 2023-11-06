const Producto = require('../models/products.models');

const exampleProduct = {
    nombre: 'Producto de Ejemplo',
    descripcion: 'Esta es una descripción de ejemplo.',
    precio: 19.99,
    categoria: 'Ejemplo',
    imagen: 'imagen-de-ejemplo.jpg',
    disponibilidad: true,
    stock: '10 unidades',
};

async function renderProducts(req, res) {
    const mockedProducts = [];
    for (let i = 0; i < 100; i++) {
        mockedProducts.push(new Producto(exampleProduct));
    }
    res.json(mockedProducts);
}

module.exports = { renderProducts };