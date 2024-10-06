import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_m.css';
import { Link } from 'react-router-dom';
import { IoPerson } from 'react-icons/io5';
import { ResponsiveBar } from '@nivo/bar';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Import jwtDecode

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
    const [staffUsername, setStaffUsername] = useState('Manager'); // State to store staff username

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
                const response = await axios.get('https://light-house-system.vercel.app/api/counts'); // Replace with your API endpoint
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
                            <p className="subtitle">Welcome to the Manager Dashboard.</p>
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
                    <div className="column is-6">
                            <Link to ="/manager_accounts">
                            <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>
                                
                                <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }} >
                                    <span>
                                        <IoPerson size={40} className="is-violet" />
                                    </span>
                                </div>
                                <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                                    
                                    <label className="has-text-weight-semibold">Staffs</label>
                                    <p className="is-size-5 has-text-primary">{counts.staffCount}</p>
                                </div>
                                
                            </div>
                            </Link>
                        </div>

                        <div className="column is-6">
                            <Link to="/manager_room">
                            <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>
                                <div className="is-flex is-justify-content-center is-align-items-center"  style={{ flex: '1 1 50%', overflow: 'hidden' }} >
                                    <span>
                                        <IoPerson size={40} className="is-violet" />
                                    </span>
                                </div>
                                <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                                    <label className="has-text-weight-semibold">Rooms</label>
                                    <p className="is-size-5 has-text-primary">{counts.roomCount}</p>
                                </div>
                            </div>
                            </Link>
                        </div>

                        <div className="column is-6">
                            <Link to="/manager_food">
                                <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>  
                                    <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }} >
                                        <span>
                                            <IoPerson size={40} className="is-violet" />
                                        </span>
                                    </div>                     
                                    <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                                        <label className="has-text-weight-semibold">Foods</label>
                                        <p className="is-size-5 has-text-primary">{counts.foodItemCount}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="column is-6">
                            <Link to="/manager_drink">
                                <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>
                                    <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }}>
                                        <span>
                                            <IoPerson size={40} className="is-violet" />
                                        </span>
                                    </div>
                                    <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                                        <label className="has-text-weight-semibold">Drinks</label>
                                        <p className="is-size-5 has-text-primary">{counts.barDrinkCount}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="column is-6">
                            <Link to="/manager_concierge">
                                <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>                     
                                    <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }}>
                                        <span>
                                            <IoPerson size={40} className="is-violet" />
                                        </span>
                                    </div>
                                    <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                                        <label className="has-text-weight-semibold">Concierges</label>
                                        <p className="is-size-5 has-text-primary">{counts.conciergeDetailCount}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="column is-6">
                            <Link to="/manager_laundry">
                                <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>                     
                                    <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }}>
                                        <span>
                                            <IoPerson size={40} className="is-violet" />
                                        </span>
                                    </div>
                                    <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                                        <label className="has-text-weight-semibold">Laundry</label>
                                        <p className="is-size-5 has-text-primary">{counts.laundryDetailCount}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="column is-6">
                            <Link to="/manager_venue">
                                <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>                     
                                    <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }}>
                                        <span>
                                            <IoPerson size={40} className="is-violet" />
                                        </span>
                                    </div>
                                    <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                                        <label className="has-text-weight-semibold">Venues</label>
                                        <p className="is-size-5 has-text-primary">{counts.eventCount}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="column is-6">
                            <Link to="/manager_food_package">
                            <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>                     
                                <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }}>
                                    <span>
                                        <IoPerson size={40} className="is-violet" />
                                    </span>
                                </div>
                                <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                                    <label className="has-text-weight-semibold">Food Packages</label>
                                    <p className="is-size-5 has-text-primary">{counts.eventFoodPackageCount}</p>
                                </div>
                            </div>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="column is-one-half chart-container" >
                    <div className="column" style={{ height: '400px' }}>
                        <ResponsiveBar
                            data={chartData} // Use the dynamically updated data here
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
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DashboardManager2;
