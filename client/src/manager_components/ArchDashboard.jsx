import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_m.css';
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
        { label: 'Staffs', count: counts.staffCount, link: '/manager_archive_accounts', icon: <IoPerson size={40} className="is-violet" /> },
        { label: 'Rooms', count: counts.roomCount, link: '/manager_archive_rooms', icon: <IoHome size={40} className="is-violet" /> },
        { label: 'Foods', count: counts.foodItemCount, link: '/manager_archive_foods', icon: <IoFastFood size={40} className="is-violet" /> },
        { label: 'Drinks', count: counts.barDrinkCount, link: '/manager_archive_drinks', icon: <IoWine size={40} className="is-violet" /> },
        { label: 'Concierges', count: counts.conciergeDetailCount, link: '/manager_archive_concierges', icon: <IoBagCheck size={40} className="is-violet" /> },
        { label: 'Laundry', count: counts.laundryDetailCount, link: '/manager_archive_laundry', icon: <IoShirt size={40} className="is-violet" /> },
        { label: 'Venues', count: counts.eventCount, link: '/manager_archive_venues', icon: <IoCalendar size={40} className="is-violet" /> },
        { label: 'Food Packages', count: counts.eventFoodPackageCount, link: '/manager_archive_packages', icon: <IoRestaurant size={40} className="is-violet" /> }
    ];

    return (
        <section className='section-p1'>
            <div className="container has-background-light p-5">
                <div className="columns is-vcentered">
                    <div className="column is-half">
                        <div className="notification is-white">
                            <h1 className="title is-4">Hello, {staffUsername}!</h1>
                            <p className="subtitle">Welcome to the Archives.</p>
                        </div>
                    </div>
                    <div className="column is-half has-text-right">
                        <div className="box">
                            <p className="title is-5">{formatDateTime(currentDateTime)}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='columns is-vcentered'>
                <div className="column is-one-half">
                    <div className="columns is-multiline" style={{ margin: '2%' }}>
                        {sections.map((section) => (
                            <div key={section.label} className="column is-6">
                                <Link to={section.link}>
                                    <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>
                                        <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }}>
                                            <span>{section.icon}</span>
                                        </div>
                                        <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                                            <label className="has-text-weight-semibold">{section.label}</label>
                                            <p className="is-size-5 has-text-primary">{section.count}</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ArchDashboard;
