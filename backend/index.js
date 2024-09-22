require('dotenv').config();
const express = require('express');
const cors = require('cors');
const guestRoutes = require('./routes/guestRoutes');
const checkInRoutes = require('./routes/checkInRoutes');
const staffRoutes = require('./routes/staffRoutes');
const roomRoutes = require('./routes/roomRoutes');
const roomReservationRoutes = require('./routes/roomReservationRoutes');
const foodRoutes = require('./routes/foodRoutes');
const drinkRoutes = require('./routes/drinkRoutes');
const conciergeRoutes = require('./routes/conciergeRoutes');
const laundryRoutes = require('./routes/laundryRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const getCountsDashboardManager = require('./routes/getCountsDashboardManager'); 

const app = express();
const port = process.env.PORT || 3001;

// Middleware to enable CORS
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests for all routes
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

// Middleware to parse JSON
app.use(express.json());

// Guest routes
app.use('/api', guestRoutes);
app.use('/api', checkInRoutes);
app.use('/api', staffRoutes);
app.use('/api', roomRoutes);
app.use('/api', roomReservationRoutes);
app.use('/api', foodRoutes);
app.use('/api', drinkRoutes);
app.use('/api', laundryRoutes);
app.use('/api', conciergeRoutes);
app.use('/api', eventsRoutes);
app.use('/api', getCountsDashboardManager);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
console.log("Supabase URL:", process.env.SUPABASE_URL);  
