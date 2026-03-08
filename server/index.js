const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    },
});

// In-memory message history (last 50)
const MESSAGE_LIMIT = 50;
const messageHistory = [];

io.use((socket, next) => {
    // Authenticate via token passed in handshake auth
    const token = socket.handshake.auth?.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
        } catch {
            socket.user = null; // Invalid token — allow as guest (read-only)
        }
    } else {
        socket.user = null; // No token — guest
    }
    next();
});

io.on('connection', (socket) => {
    // Send history to newly connected client
    socket.emit('chat:history', messageHistory);

    // Broadcast online count after connect
    io.emit('chat:online', io.engine.clientsCount);

    socket.on('chat:message', (text) => {
        if (!socket.user) return; // Only authenticated users can send
        if (!text || typeof text !== 'string' || text.trim().length === 0) return;
        if (text.trim().length > 500) return; // Max message length

        const msg = {
            id: Date.now().toString(),
            senderId: socket.user.id,
            senderName: socket.handshake.auth?.name || 'User',
            text: text.trim(),
            timestamp: new Date().toISOString(),
        };

        messageHistory.push(msg);
        if (messageHistory.length > MESSAGE_LIMIT) messageHistory.shift();

        io.emit('chat:message', msg);
    });

    socket.on('disconnect', () => {
        io.emit('chat:online', io.engine.clientsCount);
    });
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// ── Static uploads ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── MongoDB ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('✅  MongoDB connected');
        server.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error('❌  MongoDB connection error:', err.message);
        process.exit(1);
    });
