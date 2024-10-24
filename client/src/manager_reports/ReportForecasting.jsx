import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import axios from 'axios';
import './reports_m.css';
import { ClipLoader } from 'react-spinners';


const ReportForecasting = () => {
    const [roomForecastData, setRoomForecastData] = useState([]);
    const [eventForecastData, setEventForecastData] = useState([]);

    const [formattedData, setFormattedData] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('room'); // State to handle active tab

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
            setRoomForecastData(condensedForecasted);
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

    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

    useEffect(() => {
      const fetchForecast = async () => {
        try {
          const response = await axios.post(`${backendUrl}/api/event_forecast`);
          // Round forecasted values to integers
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
      fetchForecast();
    }, []);
  
    useEffect(() => {
      // Group the data by event type and sort by date
      const eventTypeMap = {};
      eventForecastData.forEach(item => {
        const { ds, y, event_type, isHistorical } = item;
  
        if (!eventTypeMap[event_type]) {
          eventTypeMap[event_type] = [];
        }
  
        eventTypeMap[event_type].push({ ds, y, isHistorical });
      });
  
      // Sort each event type's data by date (ascending)
      Object.keys(eventTypeMap).forEach(type => {
        eventTypeMap[type].sort((a, b) => new Date(a.ds) - new Date(b.ds));
      });
  
      // Convert to array format for rendering
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
      // Create an array of preset dark, solid color hues with RGB values.
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
  
      // Randomly select one of the dark color options
      const selectedColor = darkColorOptions[Math.floor(Math.random() * darkColorOptions.length)];
  
      // Convert the RGB components to hexadecimal
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
            <div className='tabs is-left is-boxed'>
                <ul>
                    <li className={activeTab === 'room' ? 'is-active' : ''} onClick={() => setActiveTab('room')}>
                        <a>Room Forecasting</a>
                    </li>
                    <li className={activeTab === 'event' ? 'is-active' : ''} onClick={() => setActiveTab('event')}>
                        <a>Event Forecasting</a>
                    </li>
                </ul>
            </div>

            {activeTab === 'room' && (
                <div>
                    <h1 className='is-size-5'>Hotel Room Occupancy Rate Forecast Based on 5 Months of Data</h1>
                    <ResponsiveContainer width="100%" maxHeight="60%" aspect={2}>
                        <LineChart
                            margin={{ top: 20, right: 30, left: 30, bottom: 40 }}
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
                                    style={{ fontSize: window.innerWidth < 600 ? '14px' : '18px' }}
                                />
                            </XAxis>
                            <YAxis 
                                tickFormatter={(value) => `${value.toFixed(2)}%`}
                                width={window.innerWidth < 600 ? 50 : 80}
                            >


                                <Label 
                                    value="Occupancy Rate (%)" 
                                    angle={-90} 
                                    position="insideLeft" 
                                    offset={-10}
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
                                data={roomForecastData.map(item => ({ ...item }))}
                                dataKey="yhat"
                                name="Forecasted Data"
                                stroke="#000080"
                                strokeWidth={2}
                                dot={{ fill: '#000080', r: window.innerWidth < 600 ? 2 : 4 }}
                                strokeDasharray="5 5"
                            />
                        </LineChart>
                    </ResponsiveContainer>

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
                                {roomForecastData.map((item, index) => (
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
                
            )}

            {activeTab === 'event' && (
                <div className='event-forecast-container'>
                <h1 className='is-size-5'>Event Trends Monthly Forecast Based on Trends</h1>
                <ResponsiveContainer width="100%" height={500}>
                  <LineChart
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="ds"
                        type="category"
                        scale="point"
                        tickFormatter={formatMonthYear}
                        allowDuplicatedCategory={false}
                        interval={0} 
                        tickMargin={-50}
                      >
                        <Label value="Month" offset={5} tickMargin={40} position="insideBottom" />
                      </XAxis>
                    <YAxis label={{ value: 'Number of Events', angle: -90, position: 'insideLeft' }} />
                    <Tooltip labelFormatter={(label) => formatMonthYear(label)} offset={-20}  />
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
          
                <div className="columns is-multiline">
                    {/* Historical Event Data */}
                    <div className="column is-half-tablet is-full-mobile">
                        <div className="box">
                            <h2 className="title is-5">Historical Event Data</h2>
                            <div className="table-container">
                                <table className="table is-fullwidth is-striped is-hoverable">
                                    <thead>
                                        <tr>
                                            <th>Event Type</th>
                                            <th>Month</th>
                                            <th>Number of Events</th>
                                        </tr>
                                    </thead>
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
                        </div>
                    </div>

                    {/* Forecasted Event Data */}
                    <div className="column is-half-tablet is-full-mobile">
                        <div className="box">
                            <h2 className="title is-5">Forecasted Event Data</h2>
                            <div className="table-container">
                                <table className="table is-fullwidth is-striped is-hoverable">
                                    <thead>
                                        <tr>
                                            <th>Event Type</th>
                                            <th>Month</th>
                                            <th>Predicted Events</th>
                                        </tr>
                                    </thead>
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
                    </div>
                </div>

              </div>
            )}
        </section>
    );
};

export default ReportForecasting;