import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Container,
    Card,
    CardContent,
    Tabs,
    Tab,
} from '@mui/material';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardManager2 = () => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [staffUsername, setStaffUsername] = useState('Manager');
    const [yearlySales, setYearlySales] = useState([]);
    const [totalSales, setTotalSales] = useState(0);
    const [salesData, setSalesData] = useState([]);
    const [highestSale, setHighestSale] = useState(null);
    const [topFoodItems, setTopFoodItems] = useState([]);
    const [topDrinkItems, setTopDrinkItems] = useState([]);
    const [eventForecast, setEventForecast] = useState(null);
    const [roomOccupancyForecast, setRoomOccupancyForecast] = useState(null);
    const [activeTab, setActiveTab] = useState('room');
    const [serviceComparison, setServiceComparison] = useState([]);

    const currentYear = new Date().getFullYear();
    const backendUrl = 'https://light-house-system-h74t-server.vercel.app';

    const services = ['room', 'event', 'restaurant', 'bar'];

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                let allSales = [];
                let total = 0;
    
                for (const service of services) {
                    const response = await axios.get(
                        `${backendUrl}/api/${service}_sales?type=yearly`
                    );
                    const serviceData = response.data.filter(
                        (item) => parseInt(item.period) === currentYear
                    );
    
                    const serviceTotal = serviceData.reduce(
                        (sum, item) => sum + item.totalSales,
                        0
                    );
    
                    allSales.push({
                        service,
                        totalSales: serviceTotal,
                        data: serviceData,
                    });
    
                    total += serviceTotal;
                }
    
                // Find the service with the highest sales
                const highest = allSales.reduce((max, sale) =>
                    sale.totalSales > (max?.totalSales || 0) ? sale : max,
                    null
                );
    
                setYearlySales(allSales);
                setSalesData(allSales.find((sale) => sale.service === activeTab)?.data || []);
                setTotalSales(total);
                setHighestSale(highest); // Set the highest sale after all services are processed
    
                // Prepare data for comparison chart
                const comparisonData = allSales
                    .map((sale) => ({
                        service: sale.service.charAt(0).toUpperCase() + sale.service.slice(1),
                        totalSales: sale.totalSales,
                    }))
                    .sort((a, b) => b.totalSales - a.totalSales); // Sort by total sales (highest to lowest)
                setServiceComparison(comparisonData);
            } catch (error) {
                console.error('Error fetching sales data:', error);
            }
        };
    
        fetchSalesData();
    }, [activeTab]);
    


    const formatDateTime = (date) =>
        date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });

        useEffect(() => {
            const fetchTopItems = async () => {
                try {
                    // Fetch top food items
                    const foodResponse = await axios.get(
                        `${backendUrl}/api/getFoodOrdersComparison`,
                        {
                            params: {
                                startDate: `${currentYear}-01-01`,
                                endDate: `${currentYear}-12-31`,
                            },
                        }
                    );
    
                    const topFoods = foodResponse.data
                        .sort((a, b) => b.order_count - a.order_count)
                        .slice(0, 3);
    
                    setTopFoodItems(topFoods);
    
                    // Fetch top drink items
                    const drinkResponse = await axios.get(
                        `${backendUrl}/api/getDrinkOrdersComparison`,
                        {
                            params: {
                                startDate: `${currentYear}-01-01`,
                                endDate: `${currentYear}-12-31`,
                            },
                        }
                    );
    
                    const topDrinks = drinkResponse.data
                        .sort((a, b) => b.order_count - a.order_count)
                        .slice(0, 3);
    
                    setTopDrinkItems(topDrinks);
                } catch (error) {
                    console.error('Error fetching top items:', error);
                }
            };
    
            fetchTopItems();
        }, []);


        useEffect(() => {
            const fetchForecastData = async () => {
                try {
                    // Fetch Event Forecast
                    const eventResponse = await axios.post(`${backendUrl}/api/event_forecast`, {
                        months: 1, // Fetch only the first month's forecasted data
                    });
                    const eventData = eventResponse.data.find(item => !item.isHistorical);
                    if (eventData) {
                        setEventForecast({
                            date: new Date(eventData.ds).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                            }),
                            count: Math.round(eventData.y),
                        });
                    }
    
                    // Fetch Room Occupancy Forecast
                    const roomResponse = await axios.post(`${backendUrl}/api/manager_forecast`, {
                        months: 1, // Fetch only the first month's forecasted data
                    });
                    const roomData = roomResponse.data.find(item => !item.isHistorical);
                    if (roomData) {
                        setRoomOccupancyForecast({
                            date: new Date(roomData.ds).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                            }),
                            rate: roomData.y.toFixed(2),
                        });
                    }
                } catch (error) {
                    console.error('Error fetching forecast data:', error);
                }
            };
    
            fetchForecastData();
        }, []);


        useEffect(() => {
            const timer = setInterval(() => {
                setCurrentDateTime(new Date());
            }, 1000);
            return () => clearInterval(timer);
        }, []);


  

    return (
        <Box className="section-p1">
        <Container>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4">Hello, {staffUsername}!</Typography>
                <Typography variant="h6">{formatDateTime(currentDateTime)}</Typography>
            </Box>
    
            <Grid container spacing={4}>
                {/* Left Half */}
                <Grid item xs={12} md={6}>
                    {/* Quick Links */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Quick Links
                            </Typography>
                            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                                <li>
                                    <Typography variant="body1">
                                        <a href="/manager_report_sales" style={{ textDecoration: 'none', color: '#6495ed' }}>
                                            Sales Overview
                                        </a>
                                    </Typography>
                                </li>
                                <li>
                                    <Typography variant="body1">
                                        <a href="/manager_report_forecasting" style={{ textDecoration: 'none', color: '#6495ed' }}>
                                            Forecast Overview
                                        </a>
                                    </Typography>
                                </li>
                                <li>
                                    <Typography variant="body1">
                                        <a href="/manager_report_menu_optimization" style={{ textDecoration: 'none', color: '#6495ed' }}>
                                            Orders Comparison Graph
                                        </a>
                                    </Typography>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
    
                    {/* Highest Sales */}
                    {highestSale && (
                        <Box mt={2}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Highest Sales
                                    </Typography>
                                    <Typography variant="body1">
                                        Service: <strong>{highestSale.service}</strong>
                                    </Typography>
                                    <Typography variant="body1" className='is-size-3'>
                                        Total Sales:{' '}
                                        <strong>
                                            {highestSale.totalSales.toLocaleString('en-PH', {
                                                style: 'currency',
                                                currency: 'PHP',
                                            })}
                                        </strong>
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
    
                    {/* Service Comparison */}
                    <Box mt={2}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Sales Service Comparison - {currentYear}
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={serviceComparison} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="service" />
                                        <YAxis
                                            label={{
                                                value: 'Sales (PHP)',
                                                angle: -90,
                                                position: 'insideLeft',
                                            }}
                                        />
                                        <Tooltip />
                                        <Bar dataKey="totalSales" fill="#6495ed" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Box>
                </Grid>
    
                {/* Right Half */}
                <Grid item xs={12} md={6}>
                    {/* Top Food Items */}
                    <Card>
                        <CardContent>
                        <Typography className='is-size-4' gutterBottom>
                                Orders( Restaurant and Bar)
                            </Typography>

                            <Typography variant="h6" gutterBottom>
                                Top 3 Food Items ({currentYear})
                            </Typography>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                {topFoodItems.map((item, index) => (
                                    <li key={index}>
                                        <Typography variant="body1">
                                            {item.food_name}: <strong>{item.order_count} orders</strong>
                                        </Typography>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Top 3 Drink Items ({currentYear})
                                </Typography>
                                <ul style={{ listStyleType: 'none', padding: 0 }}>
                                    {topDrinkItems.map((item, index) => (
                                        <li key={index}>
                                            <Typography variant="body1">
                                                {item.drink_name}: <strong>{item.order_count} orders</strong>
                                            </Typography>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </Card>
    
                    
                    <Card className='mt-4'>
                        <CardContent>
                        <Typography className='is-size-4' gutterBottom>
                                Forecasting
                        </Typography>
                    {/* Event Forecast */}
                    {eventForecast && (
                        <Box mt={2}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Event Forecast (Next Month)
                                    </Typography>
                                    <Typography variant="body1">
                                        Date: <strong>{eventForecast.date}</strong>
                                    </Typography>
                                    <Typography variant="body1">
                                        Forecasted Events: <strong>{eventForecast.count}</strong>
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
    
                    {/* Room Occupancy Forecast */}
                    {roomOccupancyForecast && (
                        <Box mt={2}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Room Occupancy Forecast (Next Month)
                                    </Typography>
                                    <Typography variant="body1">
                                        Date: <strong>{roomOccupancyForecast.date}</strong>
                                    </Typography>
                                    <Typography variant="body1">
                                        Occupancy Rate: <strong>{roomOccupancyForecast.rate}%</strong>
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    )}</CardContent></Card>
                </Grid>
            </Grid>
        </Container>
    </Box>
    
    
    );
};

export default DashboardManager2;
