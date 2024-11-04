import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Paper, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import { IoPerson, IoHome, IoFastFood, IoWine, IoBagCheck, IoShirt, IoCalendar, IoRestaurant } from 'react-icons/io5';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const ArchDashboard = () => {
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
    const [staffUsername, setStaffUsername] = useState('Manager');

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

        const fetchCounts = async () => {
            try {
                const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/deleted_counts');
                const data = response.data;
                setCounts({
                    staffCount: data.deletedStaffCount || 0,
                    roomCount: data.deletedRoomCount || 0,
                    foodItemCount: data.deletedFoodItemCount || 0,
                    barDrinkCount: data.deletedBarDrinkCount || 0,
                    conciergeDetailCount: data.deletedConciergeDetailCount || 0,
                    laundryDetailCount: data.deletedLaundryDetailCount || 0,
                    eventFoodPackageCount: data.deletedEventFoodPackageCount || 0,
                    eventCount: data.deletedEventCount || 0,
                });
            } catch (error) {
                console.error('Error fetching counts:', error);
            }
        };

        fetchCounts();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date) => date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const sections = [
        { label: 'Staffs', count: counts.staffCount, link: '/manager_archive_accounts', icon: <IoPerson size={40} /> },
        { label: 'Rooms', count: counts.roomCount, link: '/manager_archive_rooms', icon: <IoHome size={40} /> },
        { label: 'Foods', count: counts.foodItemCount, link: '/manager_archive_foods', icon: <IoFastFood size={40} /> },
        { label: 'Drinks', count: counts.barDrinkCount, link: '/manager_archive_drinks', icon: <IoWine size={40} /> },
        { label: 'Concierges', count: counts.conciergeDetailCount, link: '/manager_archive_concierges', icon: <IoBagCheck size={40} /> },
        { label: 'Laundry', count: counts.laundryDetailCount, link: '/manager_archive_laundry', icon: <IoShirt size={40} /> },
        { label: 'Venues', count: counts.eventCount, link: '/manager_archive_venues', icon: <IoCalendar size={40} /> },
        { label: 'Food Packages', count: counts.eventFoodPackageCount, link: '/manager_archive_packages', icon: <IoRestaurant size={40} /> }
    ];

    return (
        <Box component="section" sx={{ pt: 8, pb: 4 }}>
            <Container maxWidth="lg">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4">Hello, {staffUsername}!</Typography>
                    <Typography variant="h6">{formatDateTime(currentDateTime)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Service Maintenance Archives</Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    {sections.map((section) => (
                        <Grid item xs={12} sm={6} md={3} key={section.label}>
                            <Link to={section.link} style={{ textDecoration: 'none' }}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        padding: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        transition: '0.3s',
                                        '&:hover': {
                                            backgroundColor: 'primary.light',
                                            boxShadow: '0px 4px 10px rgba(0,0,0,0.3)',
                                        },
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            width: 56,
                                            height: 56,
                                            mb: 1,
                                            transition: '0.3s',
                                            '&:hover': { backgroundColor: 'primary.dark' },
                                        }}
                                    >
                                        {section.icon}
                                    </Avatar>
                                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                        {section.label}
                                    </Typography>
                                    <Typography variant="h5" sx={{ color: 'primary.dark' }}>
                                        {section.count}
                                    </Typography>
                                </Paper>
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default ArchDashboard;
