import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import './reports_m.css';

const Forecasting = () => {
    const [eventForecastData, setEventForecastData] = useState([]);
    const [roomOccupancyData, setRoomOccupancyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [forecastMonths, setForecastMonths] = useState(3);
    const [activeTab, setActiveTab] = useState('events');
    const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'

    const baseUrl = 'https://light-house-system-h74t-server.vercel.app';


    const fetchEventForecastData = async () => {
        try {
            const response = await axios.post(`${baseUrl}/api/event_forecast`, { months: forecastMonths });
            const data = response.data;
    
            // Log data to inspect the fetched response
            console.log("Fetched Event Forecast Data:", data);
    
            const eventTypes = Array.from(new Set(data.map(item => item.event_type)));
            const completeData = [];
    
            eventTypes.forEach(eventType => {
                const historicalData = data
                    .filter(item => item.event_type === eventType && item.isHistorical)
                    .sort((a, b) => new Date(a.ds) - new Date(b.ds));
    
                const forecastedData = data
                    .filter(item => item.event_type === eventType && !item.isHistorical)
                    .sort((a, b) => new Date(a.ds) - new Date(b.ds))
                    .slice(0, forecastMonths);
    
                if (forecastedData.length > 0 && historicalData.length > 0) {
                    const lastHistoricalPoint = historicalData[historicalData.length - 1];
                    const duplicatedPoint = {
                        ...lastHistoricalPoint,
                        isHistorical: false
                    };
                    completeData.push(...historicalData, duplicatedPoint, ...forecastedData);
                } else {
                    completeData.push(...historicalData, ...forecastedData);
                }
            });
    
            // Assuming `event_count` is the field, map it to default to 0 if not present
            const updatedData = completeData.map(item => ({
                ...item,
                event_count: item.event_count || 0
            }));
    
            setEventForecastData(updatedData.sort((a, b) => new Date(a.ds) - new Date(b.ds)));
            setLoading(false);
        } catch (err) {
            console.error('Error fetching event forecast:', err);
            setError('Failed to fetch event forecast data');
            setLoading(false);
        }
    };
    

    const fetchRoomOccupancyData = async () => {
        try {
            const response = await axios.post(`${baseUrl}/api/manager_forecast`, { months: forecastMonths });
            const data = response.data;

            const historicalData = data
                .filter(item => item.isHistorical)
                .sort((a, b) => new Date(a.ds) - new Date(b.ds));

            const forecastedData = data
                .filter(item => !item.isHistorical)
                .sort((a, b) => new Date(a.ds) - new Date(b.ds))
                .slice(0, forecastMonths);

            if (forecastedData.length > 0 && historicalData.length > 0) {
                const lastHistoricalPoint = historicalData[historicalData.length - 1];
                const duplicatedPoint = {
                    ...lastHistoricalPoint,
                    isHistorical: false
                };
                setRoomOccupancyData([...historicalData, duplicatedPoint, ...forecastedData]);
            } else {
                setRoomOccupancyData([...historicalData, ...forecastedData]);
            }
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

    useEffect(() => {
        if (activeTab === 'events') {
            fetchEventForecastData();
        } else {
            fetchRoomOccupancyData();
        }
    }, [activeTab, forecastMonths]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <ClipLoader color="#123abc" loading={loading} size={50} />
        </div>
    );

    if (error) return <p>{error}</p>;

    const renderTable = (data, isHistorical) => (
        <table className="forecast-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>{activeTab === 'events' ? 'Event Type' : 'Occupancy Rate'}</th>
                    {activeTab === 'events' && <th>Event Count</th>}
                </tr>
            </thead>
            <tbody>
                {data.filter(item => item.isHistorical === isHistorical).map((item, index) => (
                    <tr key={index}>
                        <td>{formatMonthYear(item.ds)}</td>
                        <td>{activeTab === 'events' ? item.event_type : `${Math.round(item.y)}%`}</td>
                        {activeTab === 'events' && <td>{item.y}</td>}
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
                <label>Show Forecast for: </label>
                <select value={forecastMonths} onChange={(e) => setForecastMonths(Number(e.target.value))}>
                    <option value={1}>1 Month</option>
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                </select>
            </div>

            {viewMode === 'chart' ? (
                activeTab === 'events' ? (
                    <div>
                        <p className='subtitle is-3'>Event Forecasting (Historical & Next {forecastMonths} Month{forecastMonths > 1 ? 's' : ''})</p>
                        <ResponsiveContainer width="100%" maxHeight="60%" aspect={2}>
                            <LineChart data={eventForecastData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="ds" type="category" tickFormatter={formatMonthYear} allowDuplicatedCategory={false}>
                                    <Label value="Date" offset={-20} position="insideBottom" style={{ fontSize: '18px' }} />
                                </XAxis>
                                <YAxis width={80} label={{ value: "Event Count", angle: -90, position: "insideLeft", offset: -10, style: { fontSize: '18px' } }} />
                                <Tooltip formatter={(value) => Math.round(value)} />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '16px' }} />
                                {["ANNIVERSARY", "WEDDING", "BIRTHDAY", "EXHIBITION", "CHRISTMAS", "SEMINAR"].map((eventType, index) => (
                                    <React.Fragment key={eventType}>
                                        <Line type="linear" dataKey={(item) => item.event_type === eventType && item.isHistorical ? item.y : null} name={`${eventType} (Historical)`} stroke={["#0000CD", "#FF4500", "#32CD32", "#FF6347", "#8A2BE2", "#FFA500"][index]} strokeWidth={2} dot={{ r: 2 }} connectNulls />
                                        <Line type="linear" dataKey={(item) => item.event_type === eventType && !item.isHistorical ? item.y : null} name={`${eventType} (Forecasted)`} stroke={["#0000CD", "#FF4500", "#32CD32", "#FF6347", "#8A2BE2", "#FFA500"][index]} strokeWidth={2} dot={{ r: 2 }} strokeDasharray="5 5" connectNulls />
                                    </React.Fragment>
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div>
                        <p className='subtitle is-3'>Room Occupancy Forecasting (Historical & Next {forecastMonths} Month{forecastMonths > 1 ? 's' : ''})</p>
                        <ResponsiveContainer width="100%" maxHeight="60%" aspect={2}>
                            <LineChart data={roomOccupancyData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="ds" type="category" tickFormatter={formatMonthYear} allowDuplicatedCategory={false}>
                                    <Label value="Date" offset={-20} position="insideBottom" style={{ fontSize: '18px' }} />
                                </XAxis>
                                <YAxis width={80} label={{ value: "Occupancy Rate (%)", angle: -90, position: "insideLeft", offset: -10, style: { fontSize: '18px' } }} tickFormatter={(tick) => `${Math.round(tick)}%`} />
                                <Tooltip formatter={(value) => `${Math.round(value)}%`} />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '16px' }} />
                                <Line type="linear" dataKey={(item) => item.isHistorical ? item.y : null} name="Room Occupancy (Historical)" stroke="#32CD32" strokeWidth={2} dot={{ r: 2 }} connectNulls />
                                <Line type="linear" dataKey={(item) => !item.isHistorical ? item.y : null} name="Room Occupancy (Forecasted)" stroke="#FF4500" strokeWidth={2} dot={{ r: 2 }} strokeDasharray="5 5" connectNulls />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )
            ) : (
                <div className="table-container">
                    <div className="table-cell">
                        <p className="subtitle">Historical Data</p>
                        {renderTable(activeTab === 'events' ? eventForecastData : roomOccupancyData, true)}
                    </div>
                    <div className="table-cell">
                        <p className="subtitle">Forecasted Data</p>
                        {renderTable(activeTab === 'events' ? eventForecastData : roomOccupancyData, false)}
                    </div>
                </div>
            )}
        </section>
    );
};

export default Forecasting;
