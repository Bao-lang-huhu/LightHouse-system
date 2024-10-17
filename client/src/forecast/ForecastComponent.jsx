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
      const response = await axios.post('https://light-house-system-h74t-server.vercel.app/api/foreacstRoutes');  // Call your backend API route
      const data = response.data;

/*
const currentDate = new Date();
// Calculate the date from 5 months ago
const fiveMonthsAgo = new Date();
fiveMonthsAgo.setMonth(currentDate.getMonth() - 5);

// Filter the data based on the last 5 months
const historical = data.filter(item => new Date(item.ds) >= fiveMonthsAgo && new Date(item.ds) < currentDate);
const forecasted = data.filter(item => new Date(item.ds) >= currentDate);
*/

      // Separate historical and forecasted data
      const historical = data.filter(item => new Date(item.ds) < new Date('2025-01-01'));  // Historical data
      const forecasted = data.filter(item => new Date(item.ds) >= new Date('2025-01-01'));  // Forecasted data

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
          {/* Format XAxis to show months */}
          <XAxis
            dataKey="ds"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
            scale="time"
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}  // Add percent symbol to Y-axis labels
          />
          <Tooltip
            formatter={(value) => `${value}%`}  // Add percent symbol to tooltip values
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

          {/* Historical Data Line */}
          <Line
            data={historyData.map(item => ({ ...item, ds: new Date(item.ds).getTime(), isForecast: false }))}
            type="monotone"
            dataKey="y"
            name="Historical Data"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          
          {/* Forecasted Data Line */}
          <Line
            data={forecastData.map(item => ({ ...item, ds: new Date(item.ds).getTime(), isForecast: true }))}
            type="monotone"
            dataKey="yhat"
            name="Forecasted Data"
            stroke="#82ca9d"
            strokeDasharray="5 5"  // Dashed line for forecast
            activeDot={{ r: 8 }}
            dot={false}  // Disable dot for forecast start to keep it clean
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Table to display the data */}
      <h2>Data Table</h2>
      <table style={{ width: '700px', margin: '20px 0', border: '1px solid #ddd', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Occupancy Rate (%)</th>
          </tr>
        </thead>
        <tbody>
          {[...historyData, ...forecastData].map((item, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {new Date(item.ds).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.yhat ? `${item.yhat}%` : `${item.y}%`}</td> {/* Add percent symbol to table */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ForecastComponent;
