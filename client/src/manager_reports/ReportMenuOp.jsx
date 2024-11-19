import React, { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { ResponsiveBar } from "@nivo/bar";
import axios from "axios";
import {
    Grid,
    FormControl,
    Typography,
    InputLabel,
    Box,
    Tabs,
    Tab,
    Select,
    MenuItem,
    Button,
} from "@mui/material";

const ReportMenuOp = () => {
    // Set default year and month for "from" and "to"
    const [activeTab, setActiveTab] = useState("food");
    const [fromYear, setFromYear] = useState("2022");
    const [fromMonth, setFromMonth] = useState("01");
    const [toYear, setToYear] = useState("2024");
    const [toMonth, setToMonth] = useState("12");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2022 + 1 }, (_, i) => `${2022 + i}`);
    
    const months = [
        { name: "January", value: "01" },
        { name: "February", value: "02" },
        { name: "March", value: "03" },
        { name: "April", value: "04" },
        { name: "May", value: "05" },
        { name: "June", value: "06" },
        { name: "July", value: "07" },
        { name: "August", value: "08" },
        { name: "September", value: "09" },
        { name: "October", value: "10" },
        { name: "November", value: "11" },
        { name: "December", value: "12" },
    ];

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const startDate = `${fromYear}-${fromMonth}-01`;
            const lastDayOfMonth = new Date(toYear, parseInt(toMonth), 0).getDate();
            const adjustedEndDate = `${toYear}-${toMonth}-${lastDayOfMonth}`;

            // Determine endpoint based on active tab
            const endpoint =
                activeTab === "food"
                    ? "https://light-house-system-h74t-server.vercel.app/api/getFoodOrdersComparison"
                    : "https://light-house-system-h74t-server.vercel.app/api/getDrinkOrdersComparison";

            const response = await axios.get(endpoint, {
                params: { startDate, endDate: adjustedEndDate },
            });

            const fetchedData = response.data || [];
            if (!Array.isArray(fetchedData)) {
                throw new Error("Invalid data format received from the server");
            }

            setData(fetchedData);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Error fetching data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fromYear, fromMonth, toYear, toMonth, activeTab]);

    const handleClearFilters = () => {
        setFromYear("2024");
        setFromMonth("01");
        setToYear("2024");
        setToMonth("12");
        setData([]);
    };

    const colorByYear = (year) => {
        const yearColors = {
            "2024": "#4287f5",
            "2023": "#42f54e",
            "2022": "#f5a742",
        };
        return yearColors[year] || "#ccc"; // Default color
    };

    // Transform data for the chart (separated bars for each year)
    const chartData = data.flatMap(({ food_name, drink_name, year, order_count }) => ({
        id: `${activeTab === "food" ? food_name : drink_name} (${year})`,
        name: activeTab === "food" ? food_name : drink_name,
        year,
        order_count,
        color: colorByYear(year),
    }));

    // Create a unique list of items (X-axis categories)
    const itemNames = [...new Set(chartData.map((item) => item.name))];

    // Organize data by name for side-by-side bars
    const formattedData = itemNames.map((name) => {
        const entry = { name };
        chartData.forEach((dataPoint) => {
            if (dataPoint.name === name) {
                entry[dataPoint.year] = dataPoint.order_count;
            }
        });
        return entry;
    });

    // Sort years (keys) in ascending order
    const keys = [...new Set(chartData.map((item) => item.year))].sort((a, b) => a - b);

    const handleChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <section className="section-p1">
            <div className="container">
                <Typography variant="h4" component="h1" gutterBottom>
                    Order Comparison Graph (Restaurant and Bar)
                </Typography>

                <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
                    <Tabs
                        value={activeTab}
                        onChange={handleChange}
                        textColor="primary"
                        indicatorColor="primary"
                    >
                        <Tab value="food" label="Food Orders" />
                        <Tab value="drinks" label="Drink Orders" />
                    </Tabs>
                </Box>

                <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                    {/* From Year Filter */}
                    <Grid item xs={2}>
                        <FormControl fullWidth>
                            <InputLabel>From Year</InputLabel>
                            <Select
                                value={fromYear}
                                onChange={(e) => setFromYear(e.target.value)}
                                label="From Year"
                            >
                                {years.map((year) => (
                                    <MenuItem 
                                        key={year} 
                                        value={year} 
                                        disabled={toYear && parseInt(year) > parseInt(toYear)}
                                    >
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* From Month Filter */}
                    <Grid item xs={2}>
                        <FormControl fullWidth>
                            <InputLabel>From Month</InputLabel>
                            <Select
                                value={fromMonth}
                                onChange={(e) => setFromMonth(e.target.value)}
                                label="From Month"
                            >
                                {months.map(({ name, value }) => (
                                    <MenuItem 
                                        key={value} 
                                        value={value} 
                                        disabled={
                                            toYear === fromYear && toMonth && parseInt(value) > parseInt(toMonth)
                                        }
                                    >
                                        {name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* To Year Filter */}
                    <Grid item xs={2}>
                        <FormControl fullWidth>
                            <InputLabel>To Year</InputLabel>
                            <Select
                                value={toYear}
                                onChange={(e) => setToYear(e.target.value)}
                                label="To Year"
                            >
                                {years.map((year) => (
                                    <MenuItem 
                                        key={year} 
                                        value={year} 
                                        disabled={fromYear && parseInt(year) < parseInt(fromYear)}
                                    >
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* To Month Filter */}
                    <Grid item xs={2}>
                        <FormControl fullWidth>
                            <InputLabel>To Month</InputLabel>
                            <Select
                                value={toMonth}
                                onChange={(e) => setToMonth(e.target.value)}
                                label="To Month"
                            >
                                {months.map(({ name, value }) => (
                                    <MenuItem 
                                        key={value} 
                                        value={value} 
                                        disabled={
                                            toYear === fromYear && fromMonth && parseInt(value) < parseInt(fromMonth)
                                        }
                                    >
                                        {name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Reset Filters Button */}
                    <Grid item xs={2} style={{ textAlign: "right" }}>
                        <Button variant="contained" color="primary" onClick={handleClearFilters}>
                            Reset Filters
                        </Button>
                    </Grid>
                </Grid>


                <div style={{ height: "500px", marginTop: "20px" }}>
                    {loading ? (
                        <ClipLoader />
                    ) : error ? (
                        <div>{error}</div>
                    ) : formattedData.length > 0 ? (
                        <ResponsiveBar
                            data={formattedData}
                            keys={keys} // Years as keys
                            indexBy="name" // X-axis: item names
                            margin={{ top: 50, right: 130, bottom: 70, left: 60 }}
                            padding={0.2}
                            groupMode="grouped" // Ensure bars are side-by-side
                            colors={({ id }) => colorByYear(id)} // Color by year
                            axisBottom={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: activeTab === "food" ? "Food Items" : "Drink Items",
                                legendPosition: "middle",
                                legendOffset: 50,
                            }}
                            axisLeft={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: "Order Count",
                                legendPosition: "middle",
                                legendOffset: -40,
                                tickValues: Array.from({ length: 11 }, (_, i) => i), // Whole numbers only
                            }}
                            legends={[
                                {
                                    dataFrom: "keys",
                                    anchor: "bottom-right",
                                    direction: "column",
                                    justify: false,
                                    translateX: 120,
                                    itemsSpacing: 2,
                                    itemWidth: 100,
                                    itemHeight: 20,
                                    itemDirection: "left-to-right",
                                    itemOpacity: 0.85,
                                    symbolSize: 20,
                                    effects: [
                                        {
                                            on: "hover",
                                            style: {
                                                itemOpacity: 1,
                                            },
                                        },
                                    ],
                                },
                            ]}
                            animate={true}
                            motionStiffness={90}
                            motionDamping={15}
                        />
                    ) : (
                        <p>No data available for the selected range.</p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ReportMenuOp;
