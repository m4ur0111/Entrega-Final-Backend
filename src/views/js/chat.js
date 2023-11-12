const socket = io();

// Obtén el nombre de usuario y el rol almacenado en la página
const currentUsername = document.getElementById("nombreUsuario").innerText.trim();
const userRole = document.getElementById("rolUsuario").innerText.trim();

// Función para enviar un mensaje al chat
function sendMessage(message) {
    socket.emit("chatMessage", { username: currentUsername, message });
}

// Función para mostrar un mensaje de administrador en el chat
function showAdminMessage() {
    const chatMessages = document.getElementById("chat-messages");
    const messageElement = document.createElement("div");

    messageElement.classList.add("admin-message");
    messageElement.innerHTML = `<strong>¡Un administrador ha ingresado!</strong>`;
    chatMessages.appendChild(messageElement);
}

// Evento al enviar el formulario del chat
document.getElementById("chat-form").addEventListener("submit", (e) => {
    e.preventDefault(); // Previene la recarga de la página

    const messageInput = document.getElementById("message");
    const message = messageInput.value;
    messageInput.value = "";

    // Usa el nombre de usuario almacenado al enviar un mensaje
    console.log("Enviando mensaje. Usuario:", currentUsername, "Mensaje:", message);
    sendMessage(message);
});

// Evento al recibir un mensaje del servidor
socket.on("message", (data) => {
    const chatMessages = document.getElementById("chat-messages");
    const messageElement = document.createElement("div");

    // Usa el nombre de usuario desde los datos del mensaje
    console.log("Mensaje recibido. Usuario:", data.username, "Mensaje:", data.message);

    // Agrega clases específicas para mensajes enviados por ti y por otros usuarios
    const isSentByCurrentUser = data.message.username === currentUsername;
    messageElement.classList.add(isSentByCurrentUser ? "sent" : "received");

    messageElement.innerHTML = `<strong>${data.message.username}:</strong> ${data.message.message}`;
    chatMessages.appendChild(messageElement);
});

// Verificar si el usuario es un administrador y mostrar un mensaje si es así
if (userRole === "admin") {
    showAdminMessage();
}
