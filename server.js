const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", socket => {
    socket.on("auth", user => console.log("👤 Usuário autenticado:", user.name));

    socket.on("join-room", ({ room, uid }) => {
        if (!uid) return;
        socket.join(room);
        console.log(`Socket ${socket.id} (UID: ${uid}) entrou na sala: ${room}`);
    });

    socket.on("chat-message", data => {
        const room = data.room || data.groupId;
        if (room && room !== "global") socket.to(room).emit("chat-message", data);
        else socket.broadcast.emit("chat-message", data);
    });

    socket.on("typing", data => {
        if (data.room && data.room !== "global") socket.to(data.room).emit("typing", data);
        else socket.broadcast.emit("typing", data);
    });

    socket.on("disconnect", () => console.log("🔴 Utilizador saiu:", socket.id));
});

const PORT = 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});