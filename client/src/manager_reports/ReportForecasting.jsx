import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import './reports_m.css';

const Forecasting = () => {
    const [eventForecastData, setEventForecastData] = useState([]);
    const [roomOccupancyData, setRoomOccupancyData] = useState([]);
    const [selectedMonthData, setSelectedMonthData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [eventForecastMonths, setEventForecastMonths] = useState(1);
    const [roomForecastMonths, setRoomForecastMonths] = useState(1);
    const [activeTab, setActiveTab] = useState('events');
    const [viewMode, setViewMode] = useState('chart');

    const baseUrl = 'https://light-house-system-h74t-server.vercel.app';

    const aggregateEventDataForStack = (data) => {
        const aggregatedData = {};
        const historicalData = data.filter(item => item.isHistorical);
        const forecastedData = data.filter(item => !item.isHistorical).slice(0, eventForecastMonths);
        const limitedData = [...historicalData, ...forecastedData];

        limitedData.forEach((item) => {
            const date = new Date(item.ds);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
            if (!aggregatedData[month]) {
                aggregatedData[month] = { ds: month };
            }
            aggregatedData[month][`${item.event_type}${item.isHistorical ? '_historical' : '_forecasted'}`] = Math.round(item.y);
        });
        return Object.values(aggregatedData).sort((a, b) => new Date(a.ds) - new Date(b.ds));
    };

    const fetchEventForecastData = async () => {
        try {
            const response = await axios.post(`${baseUrl}/api/event_forecast`, { months: eventForecastMonths });
            const aggregatedData = aggregateEventDataForStack(response.data);
            setEventForecastData(aggregatedData);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching event forecast:', err);
            setError('Failed to fetch event forecast data');
            setLoading(false);
        }
    };

    const fetchRoomOccupancyData = async () => {
        try {
            const response = await axios.post(`${baseUrl}/api/manager_forecast`, { months: roomForecastMonths });
            const historicalData = response.data.filter(item => item.isHistorical).map(item => ({ ...item, y_historical: item.y }));
            const forecastedData = response.data.filter(item => !item.isHistorical).slice(0, roomForecastMonths).map(item => ({ ...item, y_forecasted: item.y }));
            const combinedData = [...historicalData, ...forecastedData];
            setRoomOccupancyData(combinedData);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching room occupancy forecast:', err);
            setError('Failed to fetch room occupancy forecast data');
            setLoading(false);
        }
    };

    const formatMonthYear = (date) => {
        const parsedDate = new Date(date);
        return `${parsedDate.toLocaleString('default', { month: 'short' })} ${parsedDate.getFullYear()}`;
    };

    const handleChartClick = (state) => {
        if (state && state.activeLabel) {
            const monthData = (activeTab === 'events' ? eventForecastData : roomOccupancyData).find(
                item => item.ds === state.activeLabel
            );
            setSelectedMonthData(monthData);
        }
    };

    useEffect(() => {
        setLoading(true);
        if (activeTab === 'events') {
            fetchEventForecastData();
        } else {
            fetchRoomOccupancyData();
        }
    }, [activeTab, eventForecastMonths, roomForecastMonths]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <ClipLoader color="#123abc" loading={loading} size={50} />
        </div>
    );

    if (error) return <p>{error}</p>;

    // Define the table rendering functions for each tab
    const renderEventForecastTable = () => (
        <table className="forecast-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Event Type</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody>
                {eventForecastData.map((item, index) => (
                    Object.keys(item).map((key) => (
                        key !== 'ds' && (
                            <tr key={`${index}-${key}`}>
                                <td>{formatMonthYear(item.ds)}</td>
                                <td>{key.replace('_historical', '').replace('_forecasted', '')}</td>
                                <td>{item[key] || 'N/A'}</td>
                            </tr>
                        )
                    ))
                ))}
            </tbody>
        </table>
    );
    

    const renderRoomOccupancyTable = () => (
        <table className="forecast-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Occupancy Rate (%)</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                {roomOccupancyData.map((item, index) => (
                    <tr key={index}>
                        <td>{formatMonthYear(item.ds)}</td>
                        <td>Occupancy</td>
                        <td>{item.y_historical ? `${item.y_historical.toFixed(2)}%` : item.y_forecasted ? `${item.y_forecasted.toFixed(2)}%` : 'N/A'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <section className='section-p1'>
            <div className='tabs'>
                <button onClick={() => setActiveTab('events')} className={activeTab === 'events' ? 'active' : ''}>
                    Event Forecasting
                </button>
                <button onClick={() => setActiveTab('room_occupancy')} className={activeTab === 'room_occupancy' ? 'active' : ''}>
                    Room Occupancy Forecasting
                </button>
            </div>

            <div className='filter'>
                <label>View Mode: </label>
                <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                    <option value="chart">Chart</option>
                    <option value="table">Table</option>
                </select>
                {activeTab === 'events' ? (
                    <>
                        <label>Show Forecast for: </label>
                        <select value={eventForecastMonths} onChange={(e) => setEventForecastMonths(Number(e.target.value))}>
                            <option value={1}>1 Month</option>
                            <option value={2}>2 Months</option>
                            <option value={3}>3 Months</option>
                        </select>
                    </>
                ) : (
                    <>
                        <label>Show Forecast for: </label>
                        <select value={roomForecastMonths} onChange={(e) => setRoomForecastMonths(Number(e.target.value))}>
                            <option value={1}>1 Month</option>
                            <option value={2}>2 Months</option>
                            <option value={3}>3 Months</option>
                        </select>
                    </>
                )}
            </div>

            {viewMode === 'chart' ? (
                activeTab === 'events' ? (
                    <div>
                        <p className='subtitle is-3'>Event Forecasting (Historical & Next {eventForecastMonths} Month{eventForecastMonths > 1 ? 's' : ''})</p>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={eventForecastData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }} onClick={handleChartClick}>
                                <defs>
                                    <pattern id="forecastPattern" patternUnits="userSpaceOnUse" width="10" height="10">
                                        <rect width="10" height="10" fill="#0000CD" />
                                        <path d="M0 0L10 10ZM10 0L0 10Z" stroke="#FFFFFF" strokeWidth="2" />
                                    </pattern>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="ds" type="category" tickFormatter={formatMonthYear} allowDuplicatedCategory={false}>
                                    <Label value="Date" offset={-20} position="insideBottom" style={{ fontSize: '18px' }} />
                                </XAxis>
                                <YAxis label={{ value: "Event Count", angle: -90, position: "insideLeft", style: { fontSize: '18px' } }} />
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="top" align="center" wrapperStyle={{ fontSize: '16px' }} />
                                {["ANNIVERSARY", "WEDDING", "BIRTHDAY", "EXHIBITION", "CHRISTMAS", "SEMINAR"].map((eventType, index) => (
                                    <Bar key={`${eventType}-${index}`} dataKey={`${eventType}_historical`} name={`${eventType} (Historical)`} fill="#0000CD" stackId="a" />
                                ))}
                                {["ANNIVERSARY", "WEDDING", "BIRTHDAY", "EXHIBITION", "CHRISTMAS", "SEMINAR"].map((eventType, index) => (
                                    <Bar key={`${eventType}-forecast-${index}`} dataKey={`${eventType}_forecasted`} name={`${eventType} (Forecasted)`} fill="url(#forecastPattern)" stackId="a" />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div>
                        <p className='subtitle is-3'>Room Occupancy Forecasting (Historical & Next {roomForecastMonths} Month{roomForecastMonths > 1 ? 's' : ''})</p>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={roomOccupancyData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }} onClick={handleChartClick}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="ds" type="category" tickFormatter={formatMonthYear} allowDuplicatedCategory={false}>
                                    <Label value="Date" offset={-20} position="insideBottom" style={{ fontSize: '18px' }} />
                                </XAxis>
                                <YAxis label={{ value: "Occupancy Rate (%)", angle: -90, position: "insideLeft", style: { fontSize: '18px' } }} tickFormatter={(tick) => tick ? `${tick}%` : ''} />
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="top" align="center" wrapperStyle={{ fontSize: '16px' }} />
                                <Bar dataKey="y_historical" name="Room Occupancy (Historical)" fill="#32CD32" />
                                <Bar dataKey="y_forecasted" name="Room Occupancy (Forecasted)" fill="#FF4500" opacity={0.5} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )
            ) : activeTab === 'events' ? renderEventForecastTable() : renderRoomOccupancyTable()}

            {viewMode === 'chart' && selectedMonthData && (
                <div className="selected-data-display">
                    <h4>Data for {formatMonthYear(selectedMonthData.ds)}</h4>
                    {activeTab === 'events' ? (
                        Object.keys(selectedMonthData).map((key, index) => (
                            key !== "ds" && (
                                <p key={index}><strong>{key.replace('_historical', '').replace('_forecasted', '')} Count:</strong> {selectedMonthData[key] || 'N/A'}</p>
                            )
                        ))
                    ) : (
                        <p><strong>Room Occupancy Rate:</strong> {selectedMonthData.y_historical ? `${selectedMonthData.y_historical.toFixed(2)}%` : selectedMonthData.y_forecasted ? `${selectedMonthData.y_forecasted.toFixed(2)}%` : 'N/A'}</p>
                    )}
                </div>
            )}
        </section>
    );
};

export default Forecasting;
