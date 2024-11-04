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
    const [activeTab, setActiveTab] = useState('room');

    // Set baseUrl based on environment
    const baseUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://light-house-system-h74t-server.vercel.app';

    const fetchForecastData = async () => {
        try {
            const response = await axios.post(`${baseUrl}/api/manager_forecast`, { months: 3 });
            const data = response.data;

            const historical = data.filter(item => item.isHistorical);
            const forecasted = data.filter(item => !item.isHistorical);

            setHistoryData(historical);
            setRoomForecastData(forecasted);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching forecast:', err);
            setError('Failed to fetch forecast data');
            setLoading(false);
        }
    };

    const fetchEventForecast = async () => {
        try {
            const response = await axios.post(`${baseUrl}/api/event_forecast`, { months: 3 });
            const adjustedData = response.data
                .map(item => ({
                    ...item,
                    y: item.isHistorical ? item.y : Math.round(item.y),
                    ds: new Date(item.ds)
                }))
                .sort((a, b) => a.ds - b.ds);

            setEventForecastData(adjustedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching event forecast data:', error);
            setError('Failed to fetch event forecast data');
            setLoading(false);
        }
    };

    const handleViewChange = (view) => setSelectedView(view);

    useEffect(() => {
        fetchForecastData();
        fetchEventForecast();
    }, []);

    useEffect(() => {
        const eventTypeMap = {};

        eventForecastData.forEach(item => {
            const { ds, y, event_type, isHistorical } = item;
            const timestamp = new Date(ds).getTime();

            if (!eventTypeMap[event_type]) {
                eventTypeMap[event_type] = [];
            }

            eventTypeMap[event_type].push({ ds: timestamp, y, isHistorical });
        });

        Object.keys(eventTypeMap).forEach(type => {
            eventTypeMap[type].sort((a, b) => a.ds - b.ds);
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

    // Function to generate random dark colors
    const generateDarkColor = () => {
        const darkColorOptions = [
            { r: 139, g: 0, b: 0 },      // Dark Red
            { r: 184, g: 134, b: 11 },   // Dark Goldenrod
            { r: 0, g: 100, b: 0 },      // Dark Green
            { r: 0, g: 0, b: 139 },      // Dark Blue
            { r: 72, g: 61, b: 139 },    // Dark Slate Blue
            { r: 85, g: 107, b: 47 },    // Dark Olive Green
            { r: 139, g: 69, b: 19 },    // Saddle Brown
            { r: 47, g: 79, b: 79 }      // Dark Slate Gray
        ];

        const selectedColor = darkColorOptions[Math.floor(Math.random() * darkColorOptions.length)];
        const redHex = selectedColor.r.toString(16).padStart(2, '0');
        const greenHex = selectedColor.g.toString(16).padStart(2, '0');
        const blueHex = selectedColor.b.toString(16).padStart(2, '0');

        return `#${redHex}${greenHex}${blueHex}`;
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <ClipLoader color="#123abc" loading={loading} size={50} />
    </div>;

    if (error) return <p>{error}</p>;

    return (
        <section className='section-p1'>
            <div className='mb-5 mt-4'>
                <p className='subtitle is-3'>Forecasting</p>
            </div>
            <div className='tabs is-boxed'>
                <ul className='is-left is-boxed'>
                    <li className={activeTab === 'room' ? 'is-active' : ''} onClick={() => setActiveTab('room')}>
                        <a>Room Forecasting</a>
                    </li>
                    <li className={activeTab === 'event' ? 'is-active' : ''} onClick={() => setActiveTab('event')}>
                        <a>Event Forecasting</a>
                    </li>
                </ul>
                <ul className="is-right is-boxed">
                    <li className={selectedView === 'tables' ? 'is-active' : ''}>
                        <a onClick={() => handleViewChange('tables')}>Tables</a>
                    </li>
                    <li className={selectedView === 'graphs' ? 'is-active' : ''}>
                        <a onClick={() => handleViewChange('graphs')}>Graphs</a>
                    </li>
                </ul>
            </div>

            {activeTab === 'room' && (
                <div>
                    <h1 className='is-size-5'>Hotel Room Occupancy Rate Forecast (Next 3 Months)</h1>
                    {selectedView === 'graphs' && (
                        <ResponsiveContainer width="100%" maxHeight="60%" aspect={2}>
                            <LineChart data={roomForecastData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="ds" tickFormatter={formatMonthYear} />
                                <YAxis tickFormatter={(value) => `${value.toFixed(2)}%`} />
                                <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                                <Legend />
                                <Line type="monotone" data={historyData} dataKey="y" name="Historical Data" stroke="#0000CD" />
                                <Line type="monotone" data={roomForecastData} dataKey="yhat" name="Forecasted Data" stroke="#000080" strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                    {selectedView === 'tables' && (
                        <div className="columns is-multiline">
                            <div className="column is-half-tablet is-full-mobile">
                                <h2 className="title is-5">Historical Data</h2>
                                <table className="table is-fullwidth is-striped">
                                    <thead><tr><th>Date</th><th>Occupancy Rate (%)</th></tr></thead>
                                    <tbody>
                                        {historyData.map((item, index) => (
                                            <tr key={index}>
                                                <td>{formatMonthYear(item.ds)}</td>
                                                <td>{item.y.toFixed(2)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="column is-half-tablet is-full-mobile">
                                <h2 className="title is-5">Forecasted Data (Next 3 Months)</h2>
                                <table className="table is-fullwidth is-striped">
                                    <thead><tr><th>Date</th><th>Occupancy Rate (%)</th></tr></thead>
                                    <tbody>
                                        {roomForecastData.map((item, index) => (
                                            <tr key={index}>
                                                <td>{formatMonthYear(item.ds)}</td>
                                                <td>{item.yhat.toFixed(2)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'event' && (
                <div>
                    <h1 className='is-size-5'>Event Trends Monthly Forecast (Next 3 Months)</h1>
                    {selectedView === 'graphs' && (
                        <ResponsiveContainer width="100%" height={500}>
                            <LineChart>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="ds" tickFormatter={formatMonthYear} />
                                <YAxis label={{ value: 'Number of Events', angle: -90 }} />
                                <Tooltip />
                                <Legend />
                                {formattedData.map((item) => (
                                    <Line
                                        key={item.type}
                                        data={item.data}
                                        dataKey="y"
                                        name={item.type}
                                        type="monotone"
                                        stroke={generateDarkColor()}
                                        dot={false}
                                        strokeDasharray={item.data.some(d => !d.isHistorical) ? '5 5' : '0'}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                    {selectedView === 'tables' && (
                        <div className="columns is-multiline">
                            <div className="column is-half-tablet is-full-mobile">
                                <h2 className="title is-5">Historical Event Data</h2>
                                <table className="table is-fullwidth is-striped">
                                    <thead><tr><th>Event Type</th><th>Month</th><th>Number of Events</th></tr></thead>
                                    <tbody>
                                        {eventForecastData.filter(item => item.isHistorical).map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.event_type}</td>
                                                <td>{formatMonthYear(item.ds)}</td>
                                                <td>{item.y}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="column is-half-tablet is-full-mobile">
                                <h2 className="title is-5">Forecasted Event Data (Next 3 Months)</h2>
                                <table className="table is-fullwidth is-striped">
                                    <thead><tr><th>Event Type</th><th>Month</th><th>Predicted Events</th></tr></thead>
                                    <tbody>
                                        {eventForecastData.filter(item => !item.isHistorical).map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.event_type}</td>
                                                <td>{formatMonthYear(item.ds)}</td>
                                                <td>{item.y}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default ReportForecasting;
