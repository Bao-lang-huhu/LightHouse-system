import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import axios from 'axios';
import './ForecastComponent.css'; // Import CSS for styling

const ForecastComponent = () => {
    const [forecastData, setForecastData] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchForecastData = async () => {
        try {
            const baseUrl = process.env.NODE_ENV === 'development' 
                ? 'http://localhost:3001'
                : 'https://chic-endurance-production.up.railway.app';

            const response = await axios.post(`${baseUrl}/api/manager_forecast`);
            const data = response.data;

            const historical = data.filter(item => new Date(item.ds) < new Date('2025-01-01'));
            const forecasted = data.filter(item => new Date(item.ds) >= new Date('2025-01-01'));

            const sortedHistorical = historical.sort((a, b) => new Date(a.ds) - new Date(b.ds));
            const condensedForecasted = condenseTo15Days(forecasted);

            setHistoryData(sortedHistorical);
            setForecastData(condensedForecasted);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching forecast:', err);
            setError('Failed to fetch forecast data');
            setLoading(false);
        }
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

    return (
        <div>
            <h1>Hotel Occupancy Rate Forecast</h1>
            <ResponsiveContainer width={700} height={400}>
                <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="ds"
                        tickFormatter={(value) => {
                            if (typeof value === 'string' && value.includes('-')) {
                                return value; // For forecasted data
                            }
                            return formatHistoricalDate(value); // For historical data
                        }}
                        type="category"
                        allowDuplicatedCategory={false}
                    >
                        <Label value="Date" offset={-5} position="insideBottom" />
                    </XAxis>
                    <YAxis tickFormatter={(value) => `${value.toFixed(2)}%`}>
                        <Label value="Occupancy Rate (%)" angle={-90} position="insideLeft" />
                    </YAxis>
                    <Tooltip 
                        formatter={(value) => `${value.toFixed(2)}%`} 
                        labelFormatter={(label) => label}
                    />
                    <Legend />
                    <Line
                        data={historyData.map(item => ({ ...item, ds: new Date(item.ds), isForecast: false }))}
                        dataKey="y"
                        name="Historical Data"
                        stroke="#8884d8"
                    />
                    <Line
                        data={forecastData.map(item => ({ ...item }))}
                        dataKey="yhat"
                        name="Forecasted Data"
                        stroke="#82ca9d"
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Flex Container for Tables */}
            <div className="table-container">
                {/* Historical Data Table */}
                <div className="table-cell">
                    <h2>Historical Data</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Occupancy Rate (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyData.map((item, index) => (
                                <tr key={index}>
                                    <td>{formatHistoricalDate(item.ds)}</td>
                                    <td>{item.y.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Forecasted Data Table */}
                <div className="table-cell">
                    <h2>Forecasted Data</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Occupancy Rate (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forecastData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.ds}</td>
                                    <td>{item.yhat.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ForecastComponent;
