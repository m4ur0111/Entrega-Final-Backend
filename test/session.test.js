require('dotenv').config();
const app = require('../src/app');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http'); // Add this line
const userDao = require('../src/dao/user.dao');
const supertest = require('supertest');
chai.use(chaiHttp); // Add this line

const requester = supertest("http://localhost:8080");

/* Testing sobre las sessions de los usuarios */
describe('Sessions Testing', () => {
    describe('GET /register', () => {
        it('Debería renderizar la página de Registro de Usuario en la ruta GET /register', async () => {
            const response = await requester.get('/register');
            expect(response.status).to.equal(200);
            expect(response.type).to.equal('text/html');
        });
    });

    describe('POST /register', () => {
        it('Deberia crear un usuario y redirigir a la página de login', async () => {
            const userToRegister = {
                nombre: 'UsuarioTest',
                apellido: 'EjemploUser',
                edad: 25,
                email: 'testUser@gmail.com',
                pass: 'pass123',
            };
    
            //Hace una respuesta POST para enviar los datos del usuario a la ruta especificada
            const res = await requester
                .post('/register')
                .send(userToRegister);
    
            //Verifica la respuesta y la redirección
            expect(res).to.have.status(302); // 302 indica redirección
            expect(res).to.redirectTo('login');
    
            const registeredUser = await userDao.findUserByEmail(userToRegister.email);
            expect(registeredUser).to.exist;
            expect(registeredUser.nombre).to.equal(userToRegister.nombre);
            expect(registeredUser.apellido).to.equal(userToRegister.apellido);
            expect(registeredUser.edad).to.equal(userToRegister.edad);
            expect(registeredUser.email).to.equal(userToRegister.email);
        });
    });

    describe('GET /login', () => {
        it('Debería renderizar la página de Login de Usuario en la ruta GET /login', async () => {
            const response = await requester.get('/login');
            expect(response.status).to.equal(200);
            expect(response.type).to.equal('text/html');
        });
    });

    describe('POST /login', () => {
        it('Debería realizar el inicio de sesión y redirigir a la página principal', async () => {
            //Usuario de ejemplo para validar una session de login
            const userToLogin = {
                email: 'test@gmail.com',
                pass: 'pass123',
            };
    
            //Realiza una solicitud POST para iniciar sesión
            const res = await requester
                .post('/login')
                .send(userToLogin);
    
            //Verifica que la respuesta tenga el código de estado y la redirección esperados
            expect(res).to.have.status(302); //302 indica una redirección
            expect(res).to.redirectTo('/');
        });
    });

    describe('GET /perfil', () => {
        it('Debería renderizar la página de perfil con información del usuario', async () => {
            const authenticatedUser = chai.request.agent(app);
            const userToLogin = {
                email: 'test@gmail.com',
                pass: 'pass123',
            };
    
            await authenticatedUser
                .post('/login')
                .send(userToLogin);
    
            const res = await authenticatedUser
                .get('/perfil');
    
            expect(res).to.have.status(200);
            expect(res).to.be.html;
    
            //Contenido esperado en la página
            expect(res.text).to.include('Bienvenido a tu perfil'); 
            expect(res.text).to.include('Tu rol es:'); 
            expect(res.text).to.include('Tu id es:'); 
            expect(res.text).to.include('Restablecer Contraseña'); 
        });
    });

    describe('POST /premium', () => {
        it('Debería cambiar el rol de un usuario a premium', async () => {
            const authenticatedUser = chai.request.agent(app);

            const userIdToUpdate = '657754aee95920464161a127';
            const newRole = 'premium';

            //Realiza una solicitud POST para cambiar el rol del usuario a premium
            const res = await authenticatedUser
                .post('/premium')
                .send({
                    userIdToUpdate,
                    newRole,
                });

            //Verifica que la respuesta tenga el código de estado
            expect(res).to.have.status(200);

            await authenticatedUser.get('/logout');
        });
    });

    describe('GET /rol-usuario', () => {
        it('Debería renderizar la página de Change Rol en la ruta GET /rol-usuario', async () => {
            const response = await requester.get('/rol-usuario');
            expect(response.status).to.equal(200);
            expect(response.type).to.equal('text/html');
        });
    });
});
