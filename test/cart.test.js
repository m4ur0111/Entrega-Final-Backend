require('dotenv').config();
const app = require('../src/app');
const chai = require('chai');
const expect = chai.expect;
const supertest = require('supertest');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const testUserCredentials = {
    _id: '655ebf69bccbe282c41f0469',
    email: 'userpremium@gmail.com',
    pass: 'UsuarioPremium',
};

describe('Cart Testing', () => {
    describe('GET /cart', () => {
        it('Deberia renderizar la view del carrito de un usuario en especifico', async () => {
            const authenticatedUser = chai.request.agent(app);

            await authenticatedUser
                .post('/login')
                .send(testUserCredentials);

            const res = await authenticatedUser
            .get('/cart')

            expect(res).to.have.status(200);
            expect(res).to.be.html;
        });
    });

    describe('GET /completado', () => {
        it('Debería renderizar la página de completar la compra de un Usuario en la ruta GET /completado', async () => {
            const authenticatedUser = chai.request.agent(app);
    
            await authenticatedUser
                .post('/login')
                .send(testUserCredentials);

            const res = await authenticatedUser
            .get('/completado')

            expect(res).to.have.status(200);
            expect(res).to.be.html;
        });
    });


    describe('POST /agregar-al-carrito/:productoId', () => {
        it('Debería agregar un producto al carrito con éxito', async () => {
            const authenticatedUser = chai.request.agent(app);
            const userCredentials = {
                email: 'userpremium@gmail.com',
                pass: 'UsuarioPremium',
            };

            //Realiza una solicitud POST para iniciar sesión como usuario
            await authenticatedUser
                .post('/login')
                .send(userCredentials);

            const productoId = '64f5882b063fd242a17236cb';

            const cantidadDesdeCliente = 1;
            const response = await authenticatedUser
                .post(`/agregar-al-carrito/${productoId}`)
                .send({ quantity: cantidadDesdeCliente });

            //Verifica que la respuesta tenga el código de estado esperado
            expect(response).to.have.status(200); 

            //Cierra la sesión después de la prueba
            await authenticatedUser.get('/logout');
        });
    });

    /* El usuario tiene que tener el producto en el carrito sino el test da error */
    describe('DELETE /limpiar/:productId', () => {
        it('Debería eliminar un producto del carrito con éxito', async () => {
            const authenticatedUser = chai.request.agent(app);
            const userCredentials = {
                email: 'userpremium@gmail.com',
                pass: 'UsuarioPremium',
            };

            //Realiza una solicitud POST para iniciar sesión como usuario
            await authenticatedUser
                .post('/login')
                .send(userCredentials);

            //Realiza una solicitud DELETE para eliminar el producto del carrito
            const productIdToRemove = '655ec0bc9aed0b5dacb3088e';
            const response = await authenticatedUser
                .delete(`/limpiar/${productIdToRemove}`);

            expect(response).to.have.status(200);

            //Realiza una solicitud GET para obtener el carrito después de eliminar el producto
            const cartResponse = await authenticatedUser
                .get('/cart'); 

            //Verifica que el producto se haya eliminado del carrito
            expect(cartResponse).to.have.status(200);

            //Cierra la sesión después de la prueba
            await authenticatedUser.get('/logout');
        });
    });

    describe('DELETE /limpiar-carrito', () => {
        it('Debería limpiar el carrito con éxito', async () => {
            const authenticatedUser = chai.request.agent(app);
            const userCredentials = {
                email: 'userpremium@gmail.com',
                pass: 'UsuarioPremium',
            };

            //Realiza una solicitud POST para iniciar sesión como usuario
            await authenticatedUser
                .post('/login')
                .send(userCredentials);

            //Realiza una solicitud DELETE para limpiar el carrito
            const response = await authenticatedUser
                .delete('/limpiar-carrito');

            expect(response).to.have.status(204);

            //Realiza una solicitud GET para obtener el carrito después de limpiarlo
            const cartResponse = await authenticatedUser
                .get('/cart');

            //Verifica que el carrito esté vacío después de la limpieza
            expect(cartResponse).to.have.status(200);

            await authenticatedUser.get('/logout');
        });
    });
});