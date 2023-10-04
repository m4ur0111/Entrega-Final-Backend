const express = require('express');
const router = express.Router();
const Producto = require('../models/products.models');
const { requireLogin } = require('../middleware/authMiddleware');

// Ruta para obtener los productos con variables
router.get('/products', requireLogin, async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query, minPrice, maxPrice } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sort === 'desc' ? { precio: -1 } : sort === 'asc' ? { precio: 1 } : null,
        };

        const queryOptions = {};
        
        if (query) {
            queryOptions.categoria = query;
        }

        if (minPrice) {
            queryOptions.precio = { $gte: parseFloat(minPrice) };
        }

        if (maxPrice) {
            queryOptions.precio = { ...queryOptions.precio, $lte: parseFloat(maxPrice) };
        }

        const result = await Producto.paginate(queryOptions, options);

        res.render('products', { productos: result.docs, pagination: result });
        } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
        }
});

//Ruta get para la pagina agregar producto
router.get('/product/add', async(req, res) => {
    res.render('add-product');
});

// Ruta POST para agregar un nuevo producto
router.post('/products', async (req, res) => {
    try {
        const nuevoProducto = req.body; // Aquí asumimos que los datos del nuevo producto se envían en el cuerpo de la solicitud
        
        const productoCreado = await Producto.create(nuevoProducto);
        
        // Redirige al usuario a la página de inicio después de crear el producto
        res.redirect('/products');
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

// Ruta para mostrar la vista de edición de productos
router.get('/product/edit/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        // Busca el producto en la base de datos por su ID
        const producto = await Producto.findById(productId);

        if (!producto) {
            // Si no se encuentra el producto, puedes manejarlo de acuerdo a tus necesidades
            return res.status(404).send('Producto no encontrado');
        }

        // Renderiza la vista de edición de productos y pasa el producto como variable
        res.render('edit-product', { producto });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

//Ruta para procesar la edición de un producto (POST)
router.post('/product/edit/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const { nombre, descripcion, precio, categoria, stock, imagen } = req.body;
        const disponibilidad = req.body.disponible === 'on'; // Convierte el valor a un booleano

        // Busca el producto en la base de datos por su ID y actualiza todas sus propiedades
        const productoActualizado = await Producto.findByIdAndUpdate(
            productId,
            { nombre, descripcion, precio, categoria, stock, imagen, disponibilidad },
            { new: true } // Devuelve el producto actualizado
        );

        if (!productoActualizado) {
            // Si no se encuentra el producto o no se puede actualizar, puedes manejarlo
            return res.status(404).send('Producto no encontrado o no se pudo actualizar');
        }

        // Redirige al usuario a la página de detalles del producto actualizado
        res.redirect(`/product/edit/${productoActualizado._id}`);
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

router.get('/product/:_id', async (req, res) => {
    const productId = req.params._id;

    // Busca el producto por su ID en la base de datos
    const product = await Producto.findById(productId);

    if (!product) {
        // Maneja el caso en el que el producto no se encuentra
        return res.status(404).render('404');
    }

    // Establece la cookie con la categoría del producto visitado
    res.cookie('selectedCategory', product.categoria, { maxAge: 1800000 }); // 30 minutos de duración

    // Renderiza la página de detalle de producto y pasa los datos del producto
    res.render('product-detail', { product });
});


module.exports = router;
