import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const ForecastComponent = () => {
  const [forecastData, setForecastData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch data from the backend
  const fetchForecastData = async () => {
    try {
      // Switch between local and production backend URL
      const baseUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3001' // for local development
          : 'https://light-house-system-h74t-server.vercel.app'; // for production

      const response = await axios.post(`${baseUrl}/api/manager_forecast`);
      const data = response.data;

      // Separate historical and forecasted data
      const historical = data.filter(item => new Date(item.ds) < new Date('2025-01-01')); // Historical data
      const forecasted = data.filter(item => new Date(item.ds) >= new Date('2025-01-01')); // Forecasted data

      // Sort historical and forecasted data by date
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
          <XAxis
            dataKey="ds"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
            scale="time"
          />
          <YAxis tickFormatter={(value) => `${value}%`} />
          <Tooltip
            formatter={(value) => `${value}%`}
            labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB')}
            content={({ payload }) => {
              if (payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px' }}>
                    <p>{new Date(data.ds).toLocaleDateString('en-GB')}</p>
                    {data.isForecast ? (
                      <p>Forecasted Data: {data.yhat}%</p>
                    ) : (
                      <p>Historical Data: {data.y}%</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            data={historyData.map(item => ({ ...item, ds: new Date(item.ds).getTime(), isForecast: false }))}
            type="monotone"
            dataKey="y"
            name="Historical Data"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          <Line
            data={forecastData.map(item => ({ ...item, ds: new Date(item.ds).getTime(), isForecast: true }))}
            type="monotone"
            dataKey="yhat"
            name="Forecasted Data"
            stroke="#82ca9d"
            strokeDasharray="5 5"
            activeDot={{ r: 8 }}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastComponent;
