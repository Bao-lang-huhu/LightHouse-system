import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import axios from 'axios';
import './reports_m.css';

const ReportForecasting = () => {
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
        <section className='section-p1'>
              <div className='mb-5 mt-4'>
                <p className='subtitle is-3'>Hotel Occupancy Rate Forecast</p>
            </div>
            <div>
                <h1>Hotel Occupancy Rate Forecast Based on 5 Months of Data</h1>
                <ResponsiveContainer width="100%" maxHeight="60%" aspect={2}>
                    <LineChart
                        margin={{ top: 20, right: 30, left: 30, bottom: 40 }} // Adjusted margins for better spacing
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="ds"
                            tickFormatter={(value) => {
                                if (typeof value === 'string' && value.includes('-')) {
                                    return value; 
                                }
                                return formatHistoricalDate(value); 
                            }}
                            type="category"
                            allowDuplicatedCategory={false}
                        >
                            <Label 
                                value="Date" 
                                offset={-20} 
                                position="insideBottom" 
                                style={{ fontSize: window.innerWidth < 600 ? '14px' : '18px' }} // Smaller font on small screens
                            />
                        </XAxis>
                        <YAxis 
                            tickFormatter={(value) => `${value.toFixed(2)}%`}
                            width={window.innerWidth < 600 ? 50 : 80} // Adjust Y-axis width for smaller screens
                        >
                            <Label 
                                value="Occupancy Rate (%)" 
                                angle={-90} 
                                position="insideLeft" 
                                offset={-10} // Adjust offset to prevent overlap
                                style={{ textAnchor: 'middle', fontSize: window.innerWidth < 600 ? '14px' : '18px' }}
                            />
                        </YAxis>
                        <Tooltip 
                            formatter={(value) => `${value.toFixed(2)}%`} 
                            labelFormatter={(label) => label}
                        />
                        <Legend 
                            layout="horizontal" 
                            verticalAlign="bottom" 
                            align="center"
                            wrapperStyle={{ paddingTop: 30, margin: 0 }} 
                        />
                        <Line
                            data={historyData.map(item => ({ ...item, ds: new Date(item.ds), isForecast: false }))}
                            dataKey="y"
                            name="Historical Data"
                            stroke="#0000CD"  
                            strokeWidth={2}
                            dot={{ fill: '#0000CD', r: window.innerWidth < 600 ? 2 : 4 }} 
                        />
                        <Line
                            data={forecastData.map(item => ({ ...item }))}
                            dataKey="yhat"
                            name="Forecasted Data"
                            stroke="#000080" 
                            strokeWidth={2}
                            dot={{ fill: '#000080', r: window.innerWidth < 600 ? 2 : 4 }} 
                            strokeDasharray="5 5" 
                        />
                    </LineChart>
                </ResponsiveContainer>




               {/* Flex Container for Tables */}
            <div className="columns is-multiline">
                {/* Historical Data Table */}
                <div className="column is-half-tablet is-full-mobile">
                    <div className="box">
                        <h2 className="title is-5">Historical Data</h2>
                        <table className="table is-fullwidth is-striped is-hoverable">
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
                </div>

                {/* Forecasted Data Table */}
                <div className="column is-half-tablet is-full-mobile">
                    <div className="box">
                        <h2 className="title is-5">Forecasted Data</h2>
                        <table className="table is-fullwidth is-striped is-hoverable">
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

            </div>
        </section>
    );
};

export default ReportForecasting;