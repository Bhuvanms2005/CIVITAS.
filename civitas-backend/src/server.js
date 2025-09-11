require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');
const iotRoutes = require('./routes/iotRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
require('./config/passport-setup'); // Assuming this sets up your Passport strategies

console.log('SERVER DEBUG: Starting server initialization...');
console.log('SERVER DEBUG: MONGO_URI loaded:', !!process.env.MONGODB_URI);
console.log('SERVER DEBUG: JWT_SECRET loaded:', !!process.env.JWT_SECRET);
console.log('SERVER DEBUG: SESSION_SECRET loaded:', !!process.env.SESSION_SECRET);
console.log('SERVER DEBUG: NODE_ENV:', process.env.NODE_ENV);
console.log('SERVER DEBUG: GOOGLE_CLIENT_ID loaded:', !!process.env.GOOGLE_CLIENT_ID);
console.log('SERVER DEBUG: GOOGLE_CLIENT_SECRET loaded:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('SERVER DEBUG: GOOGLE_CALLBACK_URL loaded:', !!process.env.GOOGLE_CALLBACK_URL);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const allowedOrigins = [
  process.env.FRONTEND_URL,  // Netlify
  'http://localhost:3000'    // Local dev
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed from this origin'));
        }
    },
    methods: 'GET,HEAD,POST,PUT,PATCH,DELETE',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());
// Serve uploaded files statically from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000 // Keeping the increased timeout for stability
})
.then(() => {
    console.log("MongoDB is connected successfully");
})
.catch((err) => {
    console.log("Error occured while connecting to MongoDB:", err);
    process.exit(1);
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/announcements', announcementRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/zones', zoneRoutes);
// Basic route for testing
app.get('/', (req, res) => {
    res.send("Welcome to Civitas Backend Server");
});

// Global Error Handling Middleware (should be last app.use)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong on the server.',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

app.listen(process.env.PORT, () => {
    console.log("Server is running on port:", PORT);
});







