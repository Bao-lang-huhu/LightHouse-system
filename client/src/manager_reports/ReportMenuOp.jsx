import React, { useState, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';
import { ResponsiveBar } from '@nivo/bar';
import axios from 'axios';
import 'bulma/css/bulma.min.css';

const ReportMenuOp = () => {
    const [activeTab, setActiveTab] = useState('food');
    const [activeYear, setActiveYear] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const years = ['2022', '2023', '2024','2025', '2026', '2027', '2028', '2029', '2030']; // Update this as needed

    const months = [
        { name: 'January', value: '01' },
        { name: 'February', value: '02' },
        { name: 'March', value: '03' },
        { name: 'April', value: '04' },
        { name: 'May', value: '05' },
        { name: 'June', value: '06' },
        { name: 'July', value: '07' },
        { name: 'August', value: '08' },
        { name: 'September', value: '09' },
        { name: 'October', value: '10' },
        { name: 'November', value: '11' },
        { name: 'December', value: '12' }
    ];

    const getRandomMutedBlue = () => {
        const hue = 210;
        const saturation = Math.floor(Math.random() * 30) + 40;
        const lightness = Math.floor(Math.random() * 30) + 60;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    // Fetch data when year or month changes
    useEffect(() => {
        const fetchData = async () => {
            if (!activeYear) return;

            setLoading(true);
            setError(null);
            setData([]); 

            try {
                let response;
                if (!activeFilter) {
                    // Fetch yearly data
                    response = await axios.get(`http://localhost:3001/api/getYearly${activeTab === 'food' ? 'Food' : 'Drink'}Orders`, {
                        params: { year: activeYear }
                    });
                } else {
                    // Fetch monthly data
                    const monthStartDate = `${activeYear}-${activeFilter}-01`;
                    const lastDayOfMonth = new Date(activeYear, parseInt(activeFilter), 0).getDate();
                    const monthEndDate = `${activeYear}-${activeFilter}-${lastDayOfMonth}`;

                    response = await axios.get(`http://localhost:3001/api/getMonthly${activeTab === 'food' ? 'Food' : 'Drink'}Orders`, {
                        params: { startDate: monthStartDate, endDate: monthEndDate }
                    });
                }

                // Only set data if response contains valid results
                if (response.data && response.data.length > 0) {
                    setData(response.data);
                } else {
                    setData([]); // Clear data if no results
                }
            } catch (err) {
                console.error(`Error fetching ${activeTab} data:`, err);
                setError('Error fetching data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, activeFilter, activeYear]);

    // Handle year change and reset the month filter
    const handleYearChange = (year) => {
        setActiveYear(year);
        setActiveFilter(''); // Reset the month filter
        setData([]); // Clear data immediately when switching years
    };

    const handleMonthClick = (value) => {
        if (activeFilter === value) return; // Prevent re-fetching if the same month is selected
        setActiveFilter(value);
    };

    const chartData = (data) => Array.isArray(data) ? data.map(item => ({
        name: item.food_name || item.drink_name,
        order_count: item.order_count,
        color: getRandomMutedBlue(),
    })) : [];

    return (
        <section className='section-p1'>
            <div className='mb-5 mt-4'>
                <p className='subtitle is-3'>Menu Optimization</p>
            </div>

            {/* Tabs for Food and Drinks */}
            <div className="tabs is-left is-boxed">
                <ul>
                    <li className={activeTab === 'food' ? 'is-active' : ''} onClick={() => { setActiveTab('food'); setData([]); }}>
                        <a>Food Orders</a>
                    </li>
                    <li className={activeTab === 'drinks' ? 'is-active' : ''} onClick={() => { setActiveTab('drinks'); setData([]); }}>
                        <a>Drink Orders</a>
                    </li>
                </ul>
            </div>

            {/* Year Dropdown */}
            <div className="select is-centered mb-4">
                <select value={activeYear} onChange={(e) => handleYearChange(e.target.value)}>
                    <option value="">Select Year</option>
                    {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {/* Month Buttons (disabled until a year is selected) */}
            <div className="buttons is-centered mb-4">
                {months.map(({ name, value }) => (
                    <button
                        key={value}
                        className={`button ${activeFilter === value ? 'is-blue' : 'is-light'}`}
                        onClick={() => handleMonthClick(value)}
                        disabled={!activeYear}
                    >
                        {name}
                    </button>
                ))}
            </div>

            {/* Chart Container */}
            <div className="chart-container" style={{ height: '400px' }}>
                {error && <div>{error}</div>}

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <ClipLoader color="#00d1b2" size={50} />
                    </div>
                ) : (
                    data.length > 0 ? (
                        <ResponsiveBar
                            data={chartData(data)}
                            keys={['order_count']}
                            indexBy="name"
                            margin={{ top: 50, right: 130, bottom: 100, left: 60 }}
                            padding={0.5}
                            valueScale={{ type: 'linear' }}
                            indexScale={{ type: 'band', round: true }}
                            colors={({ data }) => data.color}
                            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                            axisTop={null}
                            axisRight={null}
                            axisBottom={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: activeTab === 'food' ? 'Food Name' : 'Drink Name',
                                legendPosition: 'middle',
                                legendOffset: 60,
                            }}
                            axisLeft={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: 'Order Count',
                                legendPosition: 'middle',
                                legendOffset: -40
                            }}
                            labelSkipWidth={12}
                            labelSkipHeight={12}
                            labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                            animate={true}
                            motionStiffness={90}
                            motionDamping={15}
                        />
                    ) : (
                        <div>No data available for the selected year or month.</div>
                    )
                )}
            </div>
        </section>
    );
};

export default ReportMenuOp;
