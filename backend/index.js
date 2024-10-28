require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

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
const barRoutes = require('./routes/barRoutes');
const verifyTokenRoute = require('./routes/token/verifyToken');
const restaurantRoutes = require('./routes/restaurantRoutes');
const forecastRoute = require('./routes/forecastRoute');
const roomSalesRoutes = require('./routes/roomSalesRoutes');
const eventForecastRoutes = require('./routes/EventForecast');
const getCountsDashboardManager = require('./routes/count/getCountsDashboardManager');
const housekeepingRoutes = require('./routes/housekeepingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes'); // Adjust the path as necessary
const app = express();
const port = process.env.PORT || 3001;

// Serve home route
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Middleware for CORS
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'https://light-house-system-df35-front.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Preflight requests handling
app.options('*', (req, res) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'https://light-house-system-df35-front.vercel.app'
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

// Logging middleware for debugging
app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Route mounting
app.use('/api', maintenanceRoutes);
app.use('/api', housekeepingRoutes);
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
app.use('/api', barRoutes);
app.use('/api', verifyTokenRoute);
app.use('/api', restaurantRoutes);
app.use('/api', roomSalesRoutes);
app.use('/api', getCountsDashboardManager);
app.use('/api', forecastRoute);
app.use('/api', eventForecastRoutes);

// Server start
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log("Supabase URL:", process.env.SUPABASE_URL);
});
