const socket = io();

const currentUserId = document.getElementById("userId").innerText.trim();
const currentUsername = document.getElementById("nombreUsuario").innerText.trim();
const userRole = document.getElementById("rolUsuario").innerText.trim();

// Almacena la lista de administradores disponibles
let availableAdmins = [];
// Almacena la lista de usuarios activos
let activeUsers = [];
let selectedUserId = null;
let selectedUsername = null;

// Emitir automáticamente el evento "new-user" cuando se conecta al servidor
socket.on('connect', () => {
    socket.emit("new-user", { userId: currentUserId, username: currentUsername, isAdmin: userRole === "admin" });
});

function sendMessage(message) {
    if (selectedUserId) {
        // Enviar mensaje privado
        socket.emit("privateChatMessage", { fromUserId: currentUserId, toUserId: selectedUserId, message });
    } else {
        // Enviar mensaje común
        socket.emit("commonChatMessage", { fromUserId: currentUserId, message });
    }
}

// Evento al enviar el formulario del chat
document.getElementById("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const messageInput = document.getElementById("message");
    const message = messageInput.value;
    messageInput.value = "";

    // Enviar mensaje privado si se selecciona un administrador, de lo contrario, enviar un mensaje común
    const selectedAdmin = document.getElementById("admin-list")?.value;
    sendMessage(message, selectedAdmin);
});

// Evento al recibir un mensaje del servidor
socket.on("commonMessage", (data) => {
    displayMessage(data);
});

// Evento al recibir un mensaje privado del servidor
socket.on("privateMessage", (data) => {
    displayMessage(data);
});

function displayMessage(data) {
    const chatMessages = document.getElementById("chat-messages");
    const messageElement = document.createElement("div");

    const isSentByCurrentUser = data.fromUserId === currentUserId;
    messageElement.classList.add(isSentByCurrentUser ? "sent" : "received");

    messageElement.innerHTML = `<strong>${isSentByCurrentUser ? 'Tú' : data.username}:</strong> ${data.message}`;
    chatMessages.appendChild(messageElement);
}

// Evento al recibir la lista actualizada de administradores disponibles y usuarios activos
socket.on("availableAdmins", (admins) => {
    availableAdmins = admins;
    updateAdminList();
});

// Evento al recibir la lista actualizada de administradores disponibles y usuarios activos
socket.on("activeUsers", (users) => {
    activeUsers = users;
    updateActiveUsers();

    // También puedes manejar la lógica específica para el usuario seleccionado aquí
});

// Función para actualizar la lista de administradores en el lateral
function updateAdminList() {
    const adminListContainer = document.getElementById("admin-list-container");
    adminListContainer.innerHTML = "<h3>Administradores disponibles</h3>";

    const adminList = document.createElement("select");
    adminList.id = "admin-list";

    availableAdmins.forEach((admin) => {
        const option = document.createElement("option");
        option.value = admin.userId;
        option.text = admin.username;
        adminList.appendChild(option);
    });

    adminListContainer.appendChild(adminList);
}

// Función para actualizar la lista de usuarios activos en la interfaz de usuario
function updateActiveUsers() {
    const activeUsersContainer = document.getElementById("active-users-container");
    activeUsersContainer.innerHTML = "<h3>Usuarios activos</h3>";

    activeUsers.forEach((user) => {
        const userElement = document.createElement("div");
        userElement.classList.add("active-user");
        userElement.dataset.userId = user.userId;
        userElement.innerText = user.username;

        // Agregar evento de clic para seleccionar el usuario
        userElement.addEventListener("click", () => {
            // Aquí puedes implementar la lógica para manejar la selección del usuario
            handleUserSelection(user.userId, user.username);
        });

        activeUsersContainer.appendChild(userElement);
    });
}

function handleUserSelection(userId, username) {
    selectedUserId = userId;
    selectedUsername = username;

    // Habilitar el botón de enviar mensajes privados
    document.getElementById("send-private-message").disabled = false;

    // Puedes resaltar visualmente al usuario seleccionado si lo deseas
    // ...

    console.log(`Usuario seleccionado: ${userId} - ${username}`);
}

// Evento al hacer clic en el botón de enviar mensajes privados
document.getElementById("send-private-message").addEventListener("click", () => {
    // Obtener el mensaje del input
    const messageInput = document.getElementById("message");
    const message = messageInput.value;

    // Verificar que haya un destinatario seleccionado
    if (selectedUserId) {
        // Enviar el mensaje privado
        sendMessage(message, selectedUserId);
    } else {
        // Puedes manejar el caso en el que no se ha seleccionado un destinatario
        console.log("Selecciona un usuario para enviar un mensaje privado");
    }

    // Limpiar el input de mensaje
    messageInput.value = "";
    // Limpiar el destinatario seleccionado
    selectedUserId = null;
    selectedUsername = null;
    // Actualizar la interfaz de usuario
    updateActiveUsers();
    // Desactivar el botón de enviar mensajes privados
    document.getElementById("send-private-message").disabled = true;
});
// ... (resto del código)
