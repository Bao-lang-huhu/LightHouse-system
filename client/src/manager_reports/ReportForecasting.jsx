import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Label,
} from "recharts";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import "./reports_m.css";

const Forecasting = () => {
    const [eventForecastData, setEventForecastData] = useState([]);
    const [roomOccupancyData, setRoomOccupancyData] = useState([]);
    const [selectedMonthData, setSelectedMonthData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("events");
    const [viewMode, setViewMode] = useState("chart");
    const [forecastMonths, setForecastMonths] = useState(1); // Default to 1 month

    const baseUrl = "http://localhost:3001";

    const normalizeDateToMonth = (date) => {
        const parsedDate = new Date(date);
        return `${parsedDate.getFullYear()}-${(parsedDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`;
    };

    const fetchRoomOccupancyData = async () => {
        try {
            const response = await axios.post(`${baseUrl}/api/manager_forecast`);
            const transformedData = transformRoomData(response.data);
            setRoomOccupancyData(transformedData);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching room occupancy data:", err);
            setError("Failed to fetch room occupancy data");
            setLoading(false);
        }
    };

    const transformRoomData = (data) => {
        const groupedData = data.reduce((acc, item) => {
            const normalizedDate = normalizeDateToMonth(item.ds);
            const existing = acc.find((group) => group.ds === normalizedDate);

            if (existing) {
                if (item.isHistorical) existing.y_historical = item.y;
                else existing.y_forecasted = item.y;
            } else {
                acc.push({
                    ds: normalizedDate,
                    y_historical: item.isHistorical ? item.y : null,
                    y_forecasted: !item.isHistorical ? item.y : null,
                });
            }
            return acc;
        }, []);

        return groupedData.sort((a, b) => new Date(a.ds) - new Date(b.ds));
    };

    const fetchEventForecastData = async () => {
        try {
            const response = await axios.post(`${baseUrl}/api/event_forecast`);
            const transformedData = transformEventData(response.data);
            setEventForecastData(transformedData);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching event forecast data:", err);
            setError("Failed to fetch event forecast data");
            setLoading(false);
        }
    };

    const transformEventData = (data) => {
        const groupedData = data.reduce((acc, item) => {
            // Skip the "FORECAST" event type
            if (item.event_type === "FORECAST") return acc;
    
            const normalizedDate = normalizeDateToMonth(item.ds);
            const existing = acc.find((group) => group.ds === normalizedDate);
    
            const eventDetails = {
                event_type: item.event_type,
                isHistorical: item.isHistorical,
                y: item.isHistorical ? item.y : Math.round(item.y), // Round forecasted values
            };
    
            if (existing) {
                if (item.isHistorical) {
                    existing.historicalEvents.push(eventDetails);
                    existing.totalHistorical += item.y;
                } else {
                    existing.forecastedEvents.push(eventDetails);
                    existing.totalForecasted += Math.round(item.y); // Round total forecasted values
                }
            } else {
                acc.push({
                    ds: normalizedDate,
                    historicalEvents: item.isHistorical ? [eventDetails] : [],
                    forecastedEvents: !item.isHistorical ? [eventDetails] : [],
                    totalHistorical: item.isHistorical ? item.y : 0,
                    totalForecasted: !item.isHistorical ? Math.round(item.y) : 0, // Round total forecasted values
                });
            }
            return acc;
        }, []);
    
        return groupedData.sort((a, b) => new Date(a.ds) - new Date(b.ds));
    };
    

    const handleChartClick = (state) => {
        if (state && state.activeLabel) {
            const monthData =
                activeTab === "events"
                    ? eventForecastData.find((item) => item.ds === state.activeLabel)
                    : roomOccupancyData.find((item) => item.ds === state.activeLabel);
            setSelectedMonthData(monthData || null);
        }
    };

    useEffect(() => {
        setLoading(true);
        setSelectedMonthData(null); // Clear selection on tab switch
        if (activeTab === "events") {
            fetchEventForecastData();
        } else {
            fetchRoomOccupancyData();
        }
    }, [activeTab]);

    const formatMonthYear = (date) => {
        const [year, month] = date.split("-");
        return `${new Date(year, month - 1).toLocaleString("default", {
            month: "short",
        })} ${year}`;
    };

    const filterChartData = (data, isEvent = false) => {
        let latestHistoricalDate = null;
    
        // Find the latest historical date
        data.forEach((item) => {
            if (isEvent) {
                // For events, use totalHistorical field
                if (item.totalHistorical) {
                    const itemDate = new Date(item.ds);
                    if (!latestHistoricalDate || itemDate > latestHistoricalDate) {
                        latestHistoricalDate = itemDate;
                    }
                }
            } else {
                // For room occupancy, use y_historical field
                if (item.y_historical !== null) {
                    const itemDate = new Date(item.ds);
                    if (!latestHistoricalDate || itemDate > latestHistoricalDate) {
                        latestHistoricalDate = itemDate;
                    }
                }
            }
        });
    
        if (!latestHistoricalDate) return data; // If no historical data, return the original data
    
        const forecastRangeEnd = new Date(latestHistoricalDate);
        forecastRangeEnd.setMonth(forecastRangeEnd.getMonth() + forecastMonths);
    
        // Filter data
        return data.filter((item) => {
            const itemDate = new Date(item.ds);
            return (
                (isEvent
                    ? item.totalHistorical !== undefined || item.totalForecasted !== undefined
                    : item.y_historical !== null || item.y_forecasted !== null) &&
                itemDate <= forecastRangeEnd // Include historical and forecasted data within range
            );
        });
    };
    

    const renderEventForecastTable = () => {
        const filteredData = filterChartData(eventForecastData, true); // Apply the filter for events
    
        // Combine historical and forecasted data by date and event type
        const combinedData = filteredData.reduce((acc, item) => {
            item.historicalEvents.forEach((e) => {
                const key = `${item.ds}-${e.event_type}`;
                if (!acc[key]) {
                    acc[key] = {
                        date: formatMonthYear(item.ds),
                        event_type: e.event_type,
                        historical: e.y,
                        forecasted: "N/A",
                    };
                } else {
                    acc[key].historical = e.y;
                }
            });
    
            item.forecastedEvents.forEach((e) => {
                const key = `${item.ds}-${e.event_type}`;
                if (!acc[key]) {
                    acc[key] = {
                        date: formatMonthYear(item.ds),
                        event_type: e.event_type,
                        historical: "N/A",
                        forecasted: e.y,
                    };
                } else {
                    acc[key].forecasted = e.y;
                }
            });
    
            return acc;
        }, {});
    
        // Convert the combined data into an array for rendering
        const rows = Object.values(combinedData);
    
        return (
            <table className="forecast-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Event Type</th>
                        <th>Historical Count</th>
                        <th>Forecasted Count</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            {/* Render date only for the first occurrence */}
                            {index === 0 || rows[index - 1].date !== row.date ? (
                                <td rowSpan={rows.filter(r => r.date === row.date).length}>
                                    {row.date}
                                </td>
                            ) : null}
                            <td>{row.event_type}</td>
                            <td>{row.historical}</td>
                            <td>{row.forecasted}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };
    
    
    

    const renderRoomOccupancyTable = () => {
        const filteredData = filterChartData(roomOccupancyData, false); // Apply the filter for room occupancy
    
        return (
            <table className="forecast-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Historical Occupancy Rate (%)</th>
                        <th>Forecasted Occupancy Rate (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item, index) => (
                        <tr key={index}>
                            <td>{formatMonthYear(item.ds)}</td>
                            <td>
                                {item.y_historical !== null
                                    ? `${item.y_historical.toFixed(2)}%`
                                    : "N/A"}
                            </td>
                            <td>
                                {item.y_forecasted !== null
                                    ? `${item.y_forecasted.toFixed(2)}%`
                                    : "N/A"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };
    

    const renderSelectedMonthTable = () => {
        if (!selectedMonthData) return null;

        return activeTab === "events" ? (
            <table className="forecast-table">
                <thead>
                    <tr>
                        <th>Event Type</th>
                        <th>Historical Count</th>
                        <th>Forecasted Count</th>
                    </tr>
                </thead>
                <tbody>
                    {(selectedMonthData.historicalEvents || []).map((event, index) => (
                        <tr key={`historical-${index}`}>
                            <td>{event.event_type || "N/A"}</td>
                            <td>{event.y !== undefined ? event.y : "N/A"}</td>
                            <td>N/A</td>
                        </tr>
                    ))}
                    {(selectedMonthData.forecastedEvents || []).map((event, index) => (
                        <tr key={`forecasted-${index}`}>
                            <td>{event.event_type || "N/A"}</td>
                            <td>N/A</td>
                            <td>{event.y !== undefined ? event.y : "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            <table className="forecast-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Historical Occupancy Rate (%)</th>
                        <th>Forecasted Occupancy Rate (%)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{formatMonthYear(selectedMonthData.ds)}</td>
                        <td>
                            {selectedMonthData.y_historical !== null &&
                            selectedMonthData.y_historical !== undefined
                                ? `${selectedMonthData.y_historical.toFixed(2)}%`
                                : "N/A"}
                        </td>
                        <td>
                            {selectedMonthData.y_forecasted !== null &&
                            selectedMonthData.y_forecasted !== undefined
                                ? `${selectedMonthData.y_forecasted.toFixed(2)}%`
                                : "N/A"}
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    };

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "300px",
                }}
            >
                <ClipLoader color="#123abc" loading={loading} size={50} />
            </div>
        );
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <section className="section-p1">
            <div className="tabs">
                <button
                    onClick={() => setActiveTab("events")}
                    className={activeTab === "events" ? "active" : ""}
                >
                    Event Forecasting
                </button>
                <button
                    onClick={() => setActiveTab("room_occupancy")}
                    className={activeTab === "room_occupancy" ? "active" : ""}
                >
                    Room Occupancy Forecasting
                </button>
            </div>

            <div className="filter">
                <label>View Mode: </label>
                <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                >
                    <option value="chart">Chart</option>
                    <option value="table">Table</option>
                </select>

                <label>Forecast Months: </label>
                <select
                    value={forecastMonths}
                    onChange={(e) => setForecastMonths(Number(e.target.value))}
                >
                    <option value={1}>1 Month</option>
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                </select>
            </div>

            {viewMode === "chart" ? (
                <>
                    <ResponsiveContainer width="100%" height={400}>
                    <BarChart
    data={filterChartData(
        activeTab === "events"
            ? eventForecastData
            : roomOccupancyData,
        activeTab === "events" // Pass the isEvent flag
    )}
    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
    onClick={handleChartClick}
>

                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="ds"
                                tickFormatter={formatMonthYear}
                                allowDuplicatedCategory={false}
                            >
                                <Label
                                    value="Date"
                                    offset={-5}
                                    position="insideBottom"
                                />
                            </XAxis>
                            <YAxis>
                                <Label
                                    value={
                                        activeTab === "events"
                                            ? "Event Count"
                                            : "Occupancy Rate (%)"
                                    }
                                    angle={-90}
                                    position="insideLeft"
                                />
                            </YAxis>
                            <Tooltip />
                            <Legend />
                            {activeTab === "events" ? (
                                <>
                                    <Bar
                                        dataKey="totalHistorical"
                                        name="Historical"
                                        fill="#32CD32"
                                        barSize={25}
                                    />
                                    <Bar
                                        dataKey="totalForecasted"
                                        name="Forecasted"
                                        fill="#FF4500"
                                        barSize={25}
                                    />
                                </>
                            ) : (
                                <>
                                    <Bar
                                        dataKey="y_historical"
                                        name="Historical"
                                        fill="#32CD32"
                                        barSize={25}
                                    />
                                    <Bar
                                        dataKey="y_forecasted"
                                        name="Forecasted"
                                        fill="#FF4500"
                                        barSize={25}
                                    />
                                </>
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                    {selectedMonthData && (
                        <div className="selected-data-container">
                            <h4>
                                Data for {formatMonthYear(selectedMonthData.ds)}
                            </h4>
                            {renderSelectedMonthTable()}
                        </div>
                    )}
                </>
            ) : activeTab === "events" ? (
                renderEventForecastTable()
            ) : (
                renderRoomOccupancyTable()
            )}
        </section>
    );
};

export default Forecasting;