import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import axios from 'axios';
import './reports_m.css';
import { ClipLoader } from 'react-spinners';

const ReportForecasting = () => {
    const [roomForecastData, setRoomForecastData] = useState([]);
    const [eventForecastData, setEventForecastData] = useState([]);
    const [selectedView, setSelectedView] = useState('graphs');
    const [formattedData, setFormattedData] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('room'); // State to handle active tab

    // Base URL for the backend
    const baseUrl = 'https://light-house-system-h74t-server.vercel.app';

    const fetchForecastData = async () => {
        try {
            const response = await axios.post(`${baseUrl}/api/manager_forecast`);
            const data = response.data;

            const historical = data.filter(item => new Date(item.ds) < new Date('2025-01-01'));
            const forecasted = data.filter(item => new Date(item.ds) >= new Date('2025-01-01'));

            const sortedHistorical = historical.sort((a, b) => new Date(a.ds) - new Date(b.ds));
            const condensedForecasted = condenseTo15Days(forecasted);

            setHistoryData(sortedHistorical);
            setRoomForecastData(condensedForecasted);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching forecast:', err);
            setError('Failed to fetch forecast data');
            setLoading(false);
        }
    };

    const handleViewChange = (view) => {
        setSelectedView(view);
    };

    const condenseTo15Days = (data) => {
        const groupedData = [];
        let tempSum = 0;
        let count = 0;
        let startDate = null;

        data.forEach((item, index) => {
            const date = new Date(item.ds);

            if (count === 0) {
                startDate = date;
            }

            tempSum += item.yhat;
            count++;

            if (count === 15 || index === data.length - 1) {
                const avg = tempSum / count;
                const labelDate = count === 15 ? 
                    `${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getDate()}-${new Date(date).getDate()}` : 
                    `${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getDate()}-${date.getDate()}`;

                groupedData.push({
                    ds: labelDate,
                    yhat: avg
                });

                tempSum = 0;
                count = 0;
            }
        });

        return groupedData;
    };

    useEffect(() => {
        fetchForecastData();
    }, []);

    const formatHistoricalDate = (date) => {
        const parsedDate = new Date(date);
        return `${parsedDate.toLocaleString('default', { month: 'short' })} ${parsedDate.getFullYear()}`;
    };

    useEffect(() => {
        const fetchEventForecast = async () => {
            try {
                const response = await axios.post(`${baseUrl}/api/event_forecast`);
                const adjustedData = response.data.map(item => ({
                    ...item,
                    y: item.isHistorical ? item.y : Math.round(item.y) // Only round forecasted (non-historical) data
                }));
                setEventForecastData(adjustedData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching event forecast data:', error);
                setError('Failed to fetch event forecast data');
                setLoading(false);
            }
        };
        fetchEventForecast();
    }, []);

    useEffect(() => {
        const eventTypeMap = {};
        eventForecastData.forEach(item => {
            const { ds, y, event_type, isHistorical } = item;

            if (!eventTypeMap[event_type]) {
                eventTypeMap[event_type] = [];
            }

            eventTypeMap[event_type].push({ ds, y, isHistorical });
        });

        Object.keys(eventTypeMap).forEach(type => {
            eventTypeMap[type].sort((a, b) => new Date(a.ds) - new Date(b.ds));
        });

        const formattedDataArr = Object.keys(eventTypeMap).map(type => ({
            type,
            data: eventTypeMap[type]
        }));

        setFormattedData(formattedDataArr);
    }, [eventForecastData]);

    const formatMonthYear = (date) => {
        const parsedDate = new Date(date);
        return `${parsedDate.toLocaleString('default', { month: 'short' })} ${parsedDate.getFullYear()}`;
    };

    const generateDarkColor = () => {
        const darkColorOptions = [
            { r: 139, g: 0, b: 0 },      // Dark Red
            { r: 184, g: 134, b: 11 },   // Dark Goldenrod (Orange)
            { r: 0, g: 100, b: 0 },      // Dark Green
            { r: 0, g: 0, b: 139 },      // Dark Blue
            { r: 72, g: 61, b: 139 },    // Dark Slate Blue
            { r: 85, g: 107, b: 47 },    // Dark Olive Green
            { r: 139, g: 69, b: 19 },    // Saddle Brown
            { r: 47, g: 79, b: 79 },     // Dark Slate Gray
        ];

        const selectedColor = darkColorOptions[Math.floor(Math.random() * darkColorOptions.length)];
        const redHex = selectedColor.r.toString(16).padStart(2, '0');
        const greenHex = selectedColor.g.toString(16).padStart(2, '0');
        const blueHex = selectedColor.b.toString(16).padStart(2, '0');

        return `#${redHex}${greenHex}${blueHex}`;
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <ClipLoader color="#123abc" loading={loading} size={50} />
        </div>
    );

    if (error) return <p>{error}</p>;

    return (
        // Your rendering logic here
        // This part remains the same as in your original code
    );
};

export default ReportForecasting;
