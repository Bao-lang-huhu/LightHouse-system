import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IoEyeOutline, IoCashOutline } from 'react-icons/io5'; // Icons for actions
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
    TablePagination, TextField, ToggleButton, ToggleButtonGroup, CircularProgress, Typography
} from '@mui/material';
import ReservationDetailsModal from '../frontdesk_modals/ReservationDetailModal'; // Import the modal component
import ReservationBillModal from '../frontdesk_modals/ReservationBillModal';

const CheckOutTable = () => {
    const [checkIns, setCheckIns] = useState([]);
    const [filteredCheckIns, setFilteredCheckIns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReservationId, setSelectedReservationId] = useState(null);
    const [selectedCheckInId, setSelectedCheckInId] = useState(null); // Add state for selectedCheckInId
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalBillOpen, setIsModalBillOpen] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchMode, setSearchMode] = useState("staff"); // "staff" or "guest"
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchCheckInData = async () => {
            try {
                const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getCheckInData');
                // Check the actual data being received
                console.log("Fetched Check-In Data:", response.data);
                
                const filteredData = response.data.filter((checkIn) => checkIn.check_in_status === 'CHECKED_OUT');
                setCheckIns(filteredData);
                setFilteredCheckIns(filteredData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching check-in data:', error);
                setLoading(false);
            }
        };
    
    
        fetchCheckInData();
    }, []);
    

    const handleViewDetails = (reservationId) => {
        setSelectedReservationId(reservationId);
        setIsModalOpen(true);
    };

    const handleViewBills = (checkInId) => {
        setSelectedCheckInId(checkInId); // Set the selected check-in ID
        setIsModalBillOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedReservationId(null);
    };

    const handleCloseBillModal = () => {
        setIsModalBillOpen(false);
        setSelectedCheckInId(null); // Reset selectedCheckInId
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchModeChange = (event, newMode) => {
        setSearchMode(newMode);
        setSearchQuery(""); // Clear the search query when switching modes
        setFilteredCheckIns(checkIns); // Reset the list
    };

    // Handle search input change and filter results
    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        let filtered = checkIns;
        if (query) {
            if (searchMode === "staff") {
                filtered = checkIns.filter((checkIn) =>
                    `${checkIn.staff_fname} ${checkIn.staff_lname}`.toLowerCase().includes(query)
                );
            } else if (searchMode === "guest") {
                filtered = checkIns.filter((checkIn) =>
                    `${checkIn.guest_fname} ${checkIn.guest_lname}`.toLowerCase().includes(query)
                );
            }
        }

        setFilteredCheckIns(filtered);
        setPage(0);
    };

    // Clear search input and reset table
    const clearSearch = () => {
        setSearchQuery("");
        setFilteredCheckIns(checkIns);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}><CircularProgress /></div>;
    }

    return (
        <section className='section-p1'>
            <div>
                <Typography variant="h5" gutterBottom>Check-Out Records</Typography>

                {/* Filters */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <ToggleButtonGroup
                        value={searchMode}
                        exclusive
                        onChange={handleSearchModeChange}
                        aria-label="search mode"
                    >
                        <ToggleButton value="staff" aria-label="search staff">
                            Search Staff
                        </ToggleButton>
                        <ToggleButton value="guest" aria-label="search guest">
                            Search Guest
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <TextField
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder={`Search ${searchMode === "staff" ? "Staff" : "Guest"} Name`}
                        variant="outlined"
                        style={{ flex: 1, marginLeft: '20px' }}
                    />

                    <Button variant="contained" color="primary" onClick={clearSearch} style={{ marginLeft: '10px' }}>
                        Clear
                    </Button>
                </div>

                {/* Table */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Staff</TableCell>
                                <TableCell>Guest</TableCell>
                                <TableCell>Check-In Date</TableCell>
                                <TableCell>Check-Out Date</TableCell>
                                <TableCell>Payment Status</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCheckIns
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((checkIn) => (
                                    <TableRow key={checkIn.check_in_id}>
                                        <TableCell>{checkIn.staff_fname} {checkIn.staff_lname}</TableCell>
                                        <TableCell>{checkIn.guest_fname} {checkIn.guest_lname}</TableCell>
                                        <TableCell>{new Date(checkIn.check_in_date_time).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(checkIn.check_out_date_time).toLocaleDateString()}</TableCell>
                                        <TableCell>{checkIn.payment_status || 'N/A'}</TableCell>
                                        <TableCell>{checkIn.check_in_status || 'N/A'}</TableCell>
                                        <TableCell align="center">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                startIcon={<IoEyeOutline />}
                                                onClick={() => handleViewDetails(checkIn.room_reservation_id)}
                                                style={{ marginRight: '5px' }}
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                startIcon={<IoCashOutline />}
                                                onClick={() => handleViewBills(checkIn.check_in_id)}
                                                style={{ marginRight: '5px' }}
                                            >
                                                Bill
                                            </Button>
                                            
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <TablePagination
                    component="div"
                    count={filteredCheckIns.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                />

                {/* Reservation Details Modal */}
                {isModalOpen && (
                    <ReservationDetailsModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        roomReservationId={selectedReservationId}
                    />
                )}

                {/* Reservation Bill Modal */}
                {isModalBillOpen && (
                    <ReservationBillModal
                        isOpen={isModalBillOpen}
                        onClose={handleCloseBillModal}
                        checkInId={selectedCheckInId} // Pass the correct checkInId
                    />
                )}
            </div>
        </section>
    );
};

export default CheckOutTable;
