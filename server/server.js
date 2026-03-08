const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');

// Import routes
const authRoutes = require('./routes/auth');
const registrationRoutes = require('./routes/registration');

const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

// CORS - allow frontend dev server
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://mitilence-2k26-mitronce.vercel.app',  // replace with actual Vercel URL after deploy
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Development request logger
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
      console.log(`\n[${req.method}] ${req.originalUrl}`);
    }
    next();
  });
}

// Screenshots are now served from Cloudinary (no local static files)

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/registrations', registrationRoutes);

app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MITRONCE 2026 Technical Symposium API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('\n[ERROR]', req.method, req.originalUrl);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ─── Create Default Admin User ───────────────────────────────────────────────

const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mitronce.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword,
        phone: '0000000000',
        college: 'MIT',
        department: 'Administration',
        year: '4th',
        role: 'admin',
      });
      console.log(`Default admin user created (${adminEmail})`);
    } else {
      console.log(`Admin user already exists (${adminEmail})`);
    }
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }
};

// ─── Start Server ────────────────────────────────────────────────────────────

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create default admin user if none exists
    await createDefaultAdmin();

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🚀 MITRONCE 2026 Server running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   API Base:    http://localhost:${PORT}/api`);
      console.log(`   Health:      http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
