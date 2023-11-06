const errorDictionary = {
    /* Error general del servidor */
    errorServidor: 'Error en el servidor',
    /* Mensajes de errores para los productos */
    productoNoEncontrado: 'Producto no encontrado',
    productoNoCreado: 'El producto no se pudo crear correctamente',
    productoNoActualizado: 'El producto no se pudo actualizar',
    productoNoEliminado: 'El producto no se pudo eliminar',
    productoExistente: 'Ya existe un producto con este nombre',
    productoInvalido: 'Los datos del producto son inválidos',
    /* Mensajes de errores para los usuarios */
    usuarioExistente: 'El usuario ya existe',
    usuarioNoEncontrado: 'Usuario no encontrado',
    contrasenaIncorrecta: 'Contraseña incorrecta',
    /* Mensajes de errores para el carrito */
    carritoVacio: 'El carrito está vacío',
    productoNoEncontradoEnCarrito: 'Producto no encontrado en el carrito',
    cantidadActualizada: 'Cantidad actualizada con éxito',
};

module.exports = errorDictionary;