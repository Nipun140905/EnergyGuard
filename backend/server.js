require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connectDB = require('./config/db');
const passport = require('./config/passport');

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
    credentials: true,
}));
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
    },
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', require('./routes/auth'));
app.use('/buildings', require('./routes/buildings'));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'energyguard-backend' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`EnergyGuard backend running on port ${PORT}`);
});