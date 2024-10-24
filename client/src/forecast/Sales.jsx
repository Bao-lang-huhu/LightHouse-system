import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './SalesComponent.css';

const Sales = () => {
    const [salesData, setSalesData] = useState([]);
    const [viewType, setViewType] = useState('monthly'); // Default to monthly view
    const [selectedTab, setSelectedTab] = useState('rooms'); // Default to rooms tab
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const backendUrl = 'http://localhost:3001';

    const fetchSalesData = async (type) => {
        try {
            let endpoint;
            switch (selectedTab) {
                case 'rooms':
                    endpoint = 'room_sales';
                    break;
                case 'events':
                    endpoint = 'event_sales';
                    break;
                case 'restaurant':
                    endpoint = 'restaurant_sales';
                    break;
                case 'bar':
                    endpoint = 'bar_sales';
                    break;
                default:
                    endpoint = 'room_sales';
            }
            
            const response = await axios.get(`${backendUrl}/api/${endpoint}?type=${type}`);
            setSalesData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching sales data:', error);
            setError('Failed to fetch sales data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesData(viewType);
    }, [viewType, selectedTab]);

    const handleTabClick = (tab) => {
        setSelectedTab(tab);
        setLoading(true);
        fetchSalesData(viewType);
    };

    const handleViewTypeClick = (type) => {
        setViewType(type);
        setLoading(true);
        fetchSalesData(type);
    };

    if (loading) return <p>Loading sales data...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="sales-container">
            <h1>{selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Sales Report</h1>
            
            {/* Tabs for Rooms, Events, Restaurant, and Bar */}
            <div className="sales-tabs">
                <button className={selectedTab === 'rooms' ? 'active' : ''} onClick={() => handleTabClick('rooms')}>Rooms</button>
                <button className={selectedTab === 'events' ? 'active' : ''} onClick={() => handleTabClick('events')}>Events</button>
                <button className={selectedTab === 'restaurant' ? 'active' : ''} onClick={() => handleTabClick('restaurant')}>Restaurant</button>
                <button className={selectedTab === 'bar' ? 'active' : ''} onClick={() => handleTabClick('bar')}>Bar</button>
            </div>

            {/* Toggle between Monthly and Yearly */}
            <div className="view-type-toggle">
                <button className={viewType === 'monthly' ? 'active' : ''} onClick={() => handleViewTypeClick('monthly')}>Monthly</button>
                <button className={viewType === 'yearly' ? 'active' : ''} onClick={() => handleViewTypeClick('yearly')}>Yearly</button>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalSales" name="Total Sales" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>

            <div className="sales-table">
                <h2>{viewType.charAt(0).toUpperCase() + viewType.slice(1)} {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Sales</h2>
                <table>
                    <thead>
                        <tr>
                            <th>{viewType === 'monthly' ? 'Month' : 'Year'}</th>
                            <th>Total Sales</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.period}</td>
                                <td>{item.totalSales.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Sales;
