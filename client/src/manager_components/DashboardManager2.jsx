import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoPerson } from 'react-icons/io5';
import { ResponsiveBar } from '@nivo/bar';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Box, Typography, Grid, Container } from '@mui/material';
import { BarChart, LineChart, Line, Bar, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';

const DashboardManager2 = () => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [staffUsername, setStaffUsername] = useState('Manager');
    const theme = useTheme();

    const salesData = [
        { name: 'Jan', sales: 400 },
        { name: 'Feb', sales: 300 },
        { name: 'Mar', sales: 500 },
        { name: 'Apr', sales: 400 },
        { name: 'May', sales: 300 },
        { name: 'Jun', sales: 400 },
    ];

    const forecastData = [
        { name: 'Jan', value: 200 },
        { name: 'Feb', value: 250 },
        { name: 'Mar', value: 300 },
        { name: 'Apr', value: 100 },
        { name: 'May', value: 300 },
        { name: 'Jun', value: 200 },
    ];

    const chartData = [
        { service: 'Staffs', quantity: 40 },
        { service: 'Rooms', quantity: 30 },
        { service: 'Food', quantity: 50 },
        { service: 'Drinks', quantity: 40 },
        { service: 'Laundry', quantity: 20 },
        { service: 'Concierge', quantity: 25 },
        { service: 'Venue', quantity: 35 },
        { service: 'Food Package', quantity: 45 },
    ];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setStaffUsername(decoded.staff_username);
            } catch (error) {
                console.error('Error decoding token:', error);
                setStaffUsername('Manager');
            }
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date) => date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    return (
        <Box component="section" sx={{ pt: 8, pb: 4 }}>
            <Container maxWidth="lg">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4">Hello, {staffUsername}!</Typography>
                    <Typography variant="h6">{formatDateTime(currentDateTime)}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>Service Reports</Typography>
                
                <Grid container spacing={2}>
                    {/* Column 1 - Sales Overview */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ backgroundColor: 'white', padding: 2, borderRadius: 2, boxShadow: 1, mb: 2 }}>
                            <Link to="/manager_report_sales" style={{ textDecoration: 'none' }}>
                                <Typography variant="subtitle1" fontWeight="bold">Sales Overview</Typography>
                            </Link>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={salesData}>
                                    <Bar dataKey="sales" fill="#6495ed" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>

                    {/* Column 2 - Forecast Overview */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ backgroundColor: 'white', padding: 2, borderRadius: 2, boxShadow: 1, mb: 2 }}>
                            <Link to="/manager_report_forecasting" style={{ textDecoration: 'none' }}>
                                <Typography variant="subtitle1" fontWeight="bold">Forecast Overview</Typography>
                            </Link>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={forecastData}>
                                    <Line type="monotone" dataKey="value" stroke="#4169e1" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>

                    {/* Column 3 - Service Count Overview */}
                    <Grid item xs={12} md={4}>
                        {/* Menu Optimization */}
                        <Box sx={{ backgroundColor: 'white', padding: 2, borderRadius: 2, boxShadow: 1 }}>
                            <Link to="/manager_report_menu_optimization" style={{ textDecoration: 'none' }}>
                                <Typography variant="subtitle1" fontWeight="bold">Menu Optimization</Typography>
                            </Link>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={salesData}>
                                    <Bar dataKey="sales" fill="#000080" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default DashboardManager2;
