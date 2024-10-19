import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const EventForecastComponent = () => {
  const [forecastData, setForecastData] = useState([]);
  const [formattedData, setFormattedData] = useState([]);

  // Use the backend URL for localhost or your hosted server
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    // Fetch the forecast data from the backend
    const fetchForecast = async () => {
      try {
        const response = await axios.post(`${backendUrl}/api/event_forecast`);
        setForecastData(response.data);
      } catch (error) {
        console.error('Error fetching event forecast data:', error);
      }
    };

    fetchForecast();
  }, []);

  useEffect(() => {
    // Format the data to group by event type
    const eventTypeMap = {};
    forecastData.forEach(item => {
      const { ds, y, event_type } = item;

      // Initialize if event type does not exist
      if (!eventTypeMap[event_type]) {
        eventTypeMap[event_type] = [];
      }

      eventTypeMap[event_type].push({ ds, y });
    });

    // Convert to array of objects for rendering
    const formattedDataArr = Object.keys(eventTypeMap).map(type => ({
      type,
      data: eventTypeMap[type]
    }));

    setFormattedData(formattedDataArr);
  }, [forecastData]);

  return (
    <div className='section-p1 section-m1'>
      <h1>Event Trends Monthly Forecast</h1>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          width={500}
          height={300}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ds" />
          <YAxis />
          <Tooltip />
          <Legend />
          
          {/* Render a Line for each event type */}
          {formattedData.map((item, index) => (
            <Line
              key={item.type}
              type="monotone"
              data={item.data}
              dataKey="y"
              name={item.type}
              stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`} // Random color
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EventForecastComponent;
