import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import axios from 'axios';
import './EventForecastComponent.css';

const EventForecastComponent = () => {
  const [forecastData, setForecastData] = useState([]);
  const [formattedData, setFormattedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setForecastData(adjustedData);
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
    forecastData.forEach(item => {
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
  }, [forecastData]);

  const formatMonthYear = (date) => {
    const parsedDate = new Date(date);
    return `${parsedDate.toLocaleString('default', { month: 'short' })} ${parsedDate.getFullYear()}`;
  };

  // Function to generate darker colors
  const generateDarkColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * 10) + 6; // Range to ensure darker colors
      color += letters[randomIndex];
    }
    return color;
  };

  if (loading) return <p>Loading event forecast data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className='event-forecast-container'>
      <h1>Event Trends Monthly Forecast</h1>
      <ResponsiveContainer width="100%" height={400}>
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
            interval={0} // Ensures all labels are displayed
          >
            <Label value="Month" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis label={{ value: 'Number of Events', angle: -90, position: 'insideLeft' }} />
          <Tooltip labelFormatter={(label) => formatMonthYear(label)} />
          <Legend />

          {formattedData.map((item) => (
            <Line
              key={item.type}
              data={item.data}
              dataKey="y"
              name={item.type}
              type="monotone"
              stroke={generateDarkColor()} // Use darker color generator
              dot={false}
              strokeDasharray={item.data.some(d => !d.isHistorical) ? '5 5' : '0'}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="table-container">
        <div className="table-cell">
          <h2>Historical Event Data</h2>
          <table>
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Month</th>
                <th>Number of Events</th>
              </tr>
            </thead>
            <tbody>
              {forecastData.filter(item => item.isHistorical).map((item, index) => (
                <tr key={index}>
                  <td>{item.event_type}</td>
                  <td>{formatMonthYear(item.ds)}</td>
                  <td>{item.y}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-cell">
          <h2>Forecasted Event Data</h2>
          <table>
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Month</th>
                <th>Predicted Events</th>
              </tr>
            </thead>
            <tbody>
              {forecastData.filter(item => !item.isHistorical).map((item, index) => (
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
  );
};

export default EventForecastComponent;
