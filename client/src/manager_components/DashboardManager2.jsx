import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_m.css';
import { Link } from 'react-router-dom';
import { IoPerson } from 'react-icons/io5';
import { ResponsiveBar } from '@nivo/bar';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Import jwtDecode
import { Box, Typography, Grid } from '@mui/material';
import { BarChart, LineChart, Line, Bar } from 'recharts';
import { useTheme } from '@mui/material/styles';

const DashboardManager2 = () => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [counts, setCounts] = useState({
        staffCount: 0,
        roomCount: 0,
        foodItemCount: 0,
        barDrinkCount: 0,
        conciergeDetailCount: 0,
        laundryDetailCount: 0,
        eventFoodPackageCount: 0,
        eventCount: 0
    });
    const [chartData, setChartData] = useState([]);
    const [staffUsername, setStaffUsername] = useState('Manager'); 
    const salesData = [
        { name: 'Jan', sales: 400 },
        { name: 'Feb', sales: 300 },
        { name: 'Mar', sales: 500 },
        { name: 'apr', sales: 400 },
        { name: 'may', sales: 300 },
        { name: 'june', sales: 400 },
      ];
      
      const forecastData = [
        { name: 'Jan', value: 200 },
        { name: 'Feb', value: 250 },
        { name: 'Mar', value: 300 },
        { name: 'apr', value: 100 },
        { name: 'may', value: 300 },
        { name: 'june', value: 200 },
      ];

      const theme = useTheme();
      

    useEffect(() => {
        // Fetch staff username from JWT token
        const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setStaffUsername(decoded.staff_username); // Extract and set staff username
            } catch (error) {
                console.error('Error decoding token:', error);
                setStaffUsername('Manager');
            }
        }

        // Fetch counts data
        const fetchCounts = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/counts'); // Replace with your API endpoint
                const data = response.data;

                const validatedData = {
                    staffCount: data.staffCount || 0,
                    roomCount: data.roomCount || 0,
                    foodItemCount: data.foodItemCount || 0,
                    barDrinkCount: data.barDrinkCount || 0,
                    conciergeDetailCount: data.conciergeDetailCount || 0,
                    laundryDetailCount: data.laundryDetailCount || 0,
                    eventFoodPackageCount: data.eventFoodPackageCount || 0,
                    eventCount: data.eventCount || 0,
                };

                setCounts(validatedData);

                setChartData([
                    { service: 'Staffs', quantity: validatedData.staffCount },
                    { service: 'Rooms', quantity: validatedData.roomCount },
                    { service: 'Food', quantity: validatedData.foodItemCount },
                    { service: 'Drinks', quantity: validatedData.barDrinkCount },
                    { service: 'Laundry', quantity: validatedData.laundryDetailCount },
                    { service: 'Concierge', quantity: validatedData.conciergeDetailCount },
                    { service: 'Venue', quantity: validatedData.eventCount },
                    { service: 'Food Package', quantity: validatedData.eventFoodPackageCount },
                ]);
            } catch (error) {
                console.error('Error fetching counts:', error);
            }
        };

        fetchCounts();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <section className='section-p1'>
            <div className="container has-background-light p-5">
                <div className="columns is-vcentered">
                    <div className="column is-half">
                        <div className="notification is-white">
                            <h1 className="title is-4">Hello, {staffUsername}!</h1> {/* Updated to show staff username */}
                            <p className="subtitle">Welcome to the Reports Dashboard.</p>
                        </div>
                    </div>
                    <div className="column is-half has-text-right">
                        <div className="box">
                            <p className="title is-5">{formatDateTime(currentDateTime)}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='columns is-vcentered p-5 section-p1'>
            <Grid container spacing={2}>
                {/* Left Side - Small Graphs */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(2) }}>
                    {/* Sales Overview (Small Bar Graph) */}
                    <Box
                        sx={{
                        backgroundColor: 'white',
                        padding: theme.spacing(2),
                        borderRadius: '8px',
                        boxShadow: 1,
                        }}
                    >
                        <Link to="/manager_report_sales">
                        <Typography variant="subtitle1" fontWeight="bold">
                        Sales Overview
                        </Typography></Link>
                        <BarChart width={400} height={100} data={salesData}>
                        <Bar dataKey="sales" fill="#6495ed" />
                        </BarChart>
                    </Box>

                    {/* Forecast Overview (Small Line Graph) */}
                    <Box
                        sx={{
                        backgroundColor: 'white',
                        padding: theme.spacing(2),
                        borderRadius: '8px',
                        boxShadow: 1,
                        }}
                    > <Link to="/manager_report_forecasting">
                        <Typography variant="subtitle1" fontWeight="bold">
                        Forecast Overview
                        </Typography></Link>
                        <LineChart width={400} height={100} data={forecastData}>
                        <Line type="monotone" dataKey="value" stroke="#4169e1" />
                        </LineChart>
                    </Box>

                    {/* Sales & Menu Optimization (Small Bar Graph) */}
                    <Box
                        sx={{
                        backgroundColor: 'white',
                        padding: theme.spacing(2),
                        borderRadius: '8px',
                        boxShadow: 1,
                        }}
                    >
                        <Link to="/manager_report_menu_optimization">
                        <Typography variant="subtitle1" fontWeight="bold">
                        Menu and Order Optimization
                        </Typography></Link>
                        <BarChart width={400} height={100} data={salesData}>
                        <Bar dataKey="sales" fill="#000080" />
                        </BarChart>
                    </Box>
                    </Box>
                </Grid>

                {/* Right Side - Main Count Bar Chart */}
                <Grid item xs={12} md={8}>
                    <Box sx={{ height: 400, backgroundColor: 'white', padding: theme.spacing(2), borderRadius: '8px', boxShadow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>
                        Service Counts
                    </Typography>
                    <ResponsiveBar
                        data={chartData}
                        keys={['quantity']}
                        indexBy="service"
                        margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                        colors={['#abdbe3']}
                        padding={0.3}
                        axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Service',
                        legendPosition: 'middle',
                        legendOffset: 32,
                        }}
                        axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Quantity',
                        legendPosition: 'middle',
                        legendOffset: -40,
                        }}
                        labelSkipWidth={12}
                        labelSkipHeight={12}
                        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                        animate={true}
                    />
                    </Box>
                </Grid>
            </Grid>
            </div>
        </section>
    );
};

export default DashboardManager2;
