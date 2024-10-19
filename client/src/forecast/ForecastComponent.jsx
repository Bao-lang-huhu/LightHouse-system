import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const ForecastComponent = () => {
    const [forecastData, setForecastData] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchForecastData = async () => {
        try {
            const baseUrl = process.env.NODE_ENV === 'development' 
                ? 'http://localhost:3001'
                : 'https://light-house-system-h74t-server.vercel.app';

            const response = await axios.post(`${baseUrl}/api/manager_forecast`);
            const data = response.data;

            const historical = data.filter(item => new Date(item.ds) < new Date('2025-01-01'));
            const forecasted = data.filter(item => new Date(item.ds) >= new Date('2025-01-01'));

            const sortedHistorical = historical.sort((a, b) => new Date(a.ds) - new Date(b.ds));
            const sortedForecasted = forecasted.sort((a, b) => new Date(a.ds) - new Date(b.ds));

            setHistoryData(sortedHistorical);
            setForecastData(sortedForecasted);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching forecast:', err);
            setError('Failed to fetch forecast data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForecastData();
    }, []);

    if (loading) return <p>Loading forecast data...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Hotel Occupancy Rate Forecast</h1>
            <ResponsiveContainer width={700} height={400}>
                <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ds" type="number" domain={['dataMin', 'dataMax']} scale="time" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line data={historyData.map(item => ({ ...item, ds: new Date(item.ds).getTime(), isForecast: false }))} dataKey="y" name="Historical Data" stroke="#8884d8" />
                    <Line data={forecastData.map(item => ({ ...item, ds: new Date(item.ds).getTime(), isForecast: true }))} dataKey="yhat" name="Forecasted Data" stroke="#82ca9d" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ForecastComponent;
