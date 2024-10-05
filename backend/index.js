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
const restaurantRoutes = require ('./routes/restaurantRoutes');

//counts for dashboard
const getCountsDashboardManager = require('./routes/count/getCountsDashboardManager'); 

const app = express();
const port = process.env.PORT || 3001;

// Middleware to enable CORS
app.use(cors({
    origin: 'https://light-house-system-d6wn.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests for all routes
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://light-house-system-d6wn.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});
// Increase the payload size limit for JSON
app.use(bodyParser.json({ limit: '10mb' })); 
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); 

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
app.use('/api', barRoutes);

app.use('/api', verifyTokenRoute);
app.use('/api', restaurantRoutes);

app.use('/api', getCountsDashboardManager);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
console.log("Supabase URL:", process.env.SUPABASE_URL);  
