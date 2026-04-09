require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Routes
const authRoutes = require('./routes/authRoutes');
const applicantRoutes = require('./routes/applicantRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const employerRoutes = require('./routes/employerRoutes');
const jobRoutes = require('./routes/jobRoutes');
const geofenceRoutes = require('./routes/geofenceRoutes');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by Socket.IO CORS'));
      }
    },
    methods: ['GET', 'POST']
  }
});

// Make io available globally
global.io = io;

// Socket.IO connection logging
io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'from', socket.handshake.headers.origin);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// CORS configuration - allow local development origins
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route groups
app.use('/api/auth', authRoutes);
app.use('/api/applicant', applicantRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/geofences', geofenceRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("AbleWork API running...");
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});