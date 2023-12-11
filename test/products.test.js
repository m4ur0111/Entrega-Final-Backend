require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../src/app');
const chai = require('chai');
const expect = chai.expect;
const supertest = require('supertest');


const requester = supertest("http://localhost:8080");

/* Establecer la conexion con la base de datos y posteriormente cerrarla, solamente se utiliza 1 vez para todos los archivos de testing */
before(async function() {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Conectado con la base de datos');
});

after(async function() {
    await mongoose.disconnect();
    console.log('Desconectado de la base de datos');
});

describe('Products Testing', () => {

    describe('POST /products', () => {
        it('Debería devolver un mensaje de error si el usuario no está autenticado', async () => {
            //Simula un escenario donde el usuario no está autenticado
            const response = await requester
                .post('/products')
                .send({ /* Datos del nuevo producto */ })
                .set('Content-Type', 'application/json');
    
            //Verifica que la respuesta tenga un código de estado 401 y sea de tipo JSON
            expect(response.status).to.equal(401);
            expect(response.type).to.equal('application/json');
            
            //Verifica el cuerpo de la respuesta para asegurarte de que el mensaje de error sea correcto
            expect(response.body).to.deep.equal({ mensaje: 'Usuario no autenticado' });
        });
    });

    describe('GET /product/add', () => {
        it('Debería renderizar la página Add Product en la ruta GET /product/add', async () => {
            const response = await requester.get('/product/add');
            expect(response.status).to.equal(200);
            expect(response.type).to.equal('text/html');
        });
    });

    describe('GET /product/edit/:id', () => {
        it('Debería renderizar la página Edit Product en la ruta GET /product/edit/:id', async () => {
            //Simula el ID del producto que quieres enviar en la solicitud
            const productId = '64f5882b063fd242a17236cb';
            const response = await requester.get(`/product/edit/${productId}`);
            expect(response.status).to.equal(200);
            expect(response.type).to.equal('text/html');
        });
    });

    describe('POST /product/edit/:id', () => {
        it('Debería actualizar un producto y redirigir a la página de edición', async () => {
            //Simula el ID del producto que quieres enviar en la solicitud
            const productId = '64f5882b063fd242a17236cb';
            
            //Datos actualizados del producto
            const updatedProductData = {
                nombre: 'Nuevo nombre',
                precio: 19.99,
            };
    
            const response = await requester
                .post(`/product/edit/${productId}`)
                .send(updatedProductData)
                .set('Content-Type', 'application/json');
    
            expect(response.status).to.equal(302); 
            expect(response.header['location']).to.equal(`/product/edit/${productId}`);
        });
    });

    describe('GET /product/:_id', () => {
        it('Debería mostrar los detalles del producto si existe', async () => {
            //Simula el ID del producto que quieres consultar
            const productId = '64f5882b063fd242a17236cb';
    
            const response = await requester.get(`/product/${productId}`);
            
            //Verifica que la respuesta tenga un código de estado 200 y sea de tipo HTML
            expect(response.status).to.equal(200);
            expect(response.type).to.equal('text/html');
        });
    });

    /*      ESTE TEST ESTA COMENTADO DEBIDO A QUE ELIMINA LOS PRODUCTOS SIN NECESIDAD, ESTE ES EL ID DE UN PRODUCTO QUE NO SE ELIMINO "64f5882b063fd242a17236cb"      */
    // describe('DELETE /limpiar/:productId', () => {
    //     it('Debería eliminar un producto existente y devolver un mensaje de éxito', async () => {
    //         //Simula el ID del producto que quieres eliminar, este Id ya fue eliminado por eso recibe error en el test
    //         const productId = '64f58782b816775ae87b4ac6';

    //         const response = await requester.delete(`/limpiar/${productId}`);

    //         //Verifica que la respuesta tenga un código de estado 200 y sea de tipo JSON
    //         expect(response.status).to.equal(200);
    //         expect(response.type).to.equal('application/json');

    //         //Verifica el cuerpo de la respuesta para asegurar de que el producto fue eliminado con éxito
    //         expect(response.body).to.deep.equal({ success: true, mensaje: 'Producto eliminado con éxito' });
    //     });

        it('Debería devolver un mensaje de error si el ID del producto es inválido', async () => {
            //Simula un ID de producto inválido
            const invalidProductId = 'invalidproductid';
    
            const response = await requester.delete(`/limpiar/${invalidProductId}`);
    
            //Verifica que la respuesta tenga un código de estado 400 y sea de tipo JSON
            expect(response.status).to.equal(400);
            expect(response.type).to.equal('application/json');
    
            //Verifica el cuerpo de la respuesta
            expect(response.body).to.deep.equal({ success: false, mensaje: 'ID de producto inválido' });
        });
    });
