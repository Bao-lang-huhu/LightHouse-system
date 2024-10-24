import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IoEyeOutline, IoCashOutline, IoArchiveOutline } from 'react-icons/io5'; // Icons for actions
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
    TablePagination, FormControl, Select, MenuItem, InputLabel, CircularProgress, Typography
} from '@mui/material';
import ReservationDetailsModal from '../frontdesk_modals/ReservationDetailModal'; // Import the modal component

const CheckInTable = () => {
    const [checkIns, setCheckIns] = useState([]);
    const [filteredCheckIns, setFilteredCheckIns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReservationId, setSelectedReservationId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [paymentFilter, setPaymentFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const fetchCheckInData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/getCheckInData'); // Example API call
                setCheckIns(response.data);
                setFilteredCheckIns(response.data); // Initialize with all data
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

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedReservationId(null);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const applyFilters = () => {
        let filtered = checkIns;

        if (paymentFilter) {
            filtered = filtered.filter((checkIn) => checkIn.payment_status === paymentFilter);
        }

        if (statusFilter) {
            filtered = filtered.filter((checkIn) => checkIn.check_in_status === statusFilter);
        }

        setFilteredCheckIns(filtered);
        setPage(0);
    };

    const handlePaymentFilterChange = (event) => {
        const value = event.target.value;
        setPaymentFilter(value);

        // If "All" (empty value) is selected, reset the filters
        if (value === '') {
            setFilteredCheckIns(checkIns);
        } else {
            applyFilters();
        }
    };

    const handleStatusFilterChange = (event) => {
        const value = event.target.value;
        setStatusFilter(value);

        // If "All" (empty value) is selected, reset the filters
        if (value === '') {
            setFilteredCheckIns(checkIns);
        } else {
            applyFilters();
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}><CircularProgress /></div>;
    }

    return (
      <section className='section-p1'>
        <div>
            <Typography variant="h5" gutterBottom>Check-In Records</Typography>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <FormControl variant="outlined" style={{ minWidth: 200 }}>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                        value={paymentFilter}
                        onChange={handlePaymentFilterChange}
                        label="Payment Status"
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="PAID">Paid</MenuItem>
                        <MenuItem value="UNPAID">Failed</MenuItem>
                    </Select>
                </FormControl>

              
            </div>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Staff</TableCell>
                            <TableCell>Check-In Date</TableCell>
                            <TableCell>Initial Payment</TableCell>
                            <TableCell>Payment Status</TableCell>
                            <TableCell>Check-In Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCheckIns
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((checkIn) => (
                                <TableRow key={checkIn.check_in_id}>
                                    <TableCell>{checkIn.staff_fname} {checkIn.staff_lname}</TableCell>
                                    <TableCell>{new Date(checkIn.check_in_date_time).toLocaleDateString()}</TableCell>
                                    <TableCell>₱{checkIn.room_downpayment ? checkIn.room_downpayment.toFixed(2) : '0.00'}</TableCell>
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
                                            onClick={() => handleViewBill(checkIn.check_in_id)}
                                            style={{ marginRight: '5px' }}
                                        >
                                            Bill
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            startIcon={<IoArchiveOutline />}
                                            onClick={() => handleArchive(checkIn.check_in_id)}
                                        >
                                            Archive
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

            {/* Pass selectedReservationId to ReservationDetailsModal */}
            {isModalOpen && (
                <ReservationDetailsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    roomReservationId={selectedReservationId}
                />
            )}
        </div>
        </section>
    );
};

// Example action handlers
const handleViewBill = (checkInId) => {
    console.log(`Viewing bill for check-in ID: ${checkInId}`);
};

const handleArchive = (checkInId) => {
    console.log(`Archiving check-in ID: ${checkInId}`);
};

export default CheckInTable;
