const { userModel } = require('../models/user.model');
const Order = require('../models/order.model');

async function getUserRoleFromDatabase(userId) {
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            console.error('Usuario no encontrado');
            return 'user'; // Si el usuario no se encuentra, asume un rol predeterminado 'user'
        }
    
        return user.rol;
    } catch (error) {
        console.error('Error al obtener el rol del usuario desde la base de datos:', error);
        return 'user'; // En caso de error, asume un rol predeterminado 'user'
    }
}

//Genera un código de ticket único
async function generateUniqueTicketCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const codeLength = 12;
    
    let isUnique = false;
    let code;

    while (!isUnique) {
        code = '';

        for (let i = 0; i < codeLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters.charAt(randomIndex);
        }

        // Verificar unicidad del código en la base de datos
        const existingOrder = await Order.findOne({ 'ticket.code': code });
        isUnique = !existingOrder; // El código es único si no se encuentra en la base de datos
    }

    return code;
}


module.exports = {
    getUserRoleFromDatabase,
    generateUniqueTicketCode,
};
