import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import { IoPencilOutline, IoPeopleCircleOutline, IoSearchCircle, IoSparklesOutline, IoCloseSharp, IoAdd, IoBagCheck } from 'react-icons/io5';
import { Box, Grid, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import axios from 'axios';
import AddAdditionalItemModal from '../frontdesk_modals/AddAdditionalItemModal';
import EditAdditionalItemModal from '../frontdesk_modals/EditAdditionalItemModal';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';

const AdditionalItem = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBorrowedFilterActive, setIsBorrowedFilterActive] = useState(false);
    const [isReturnedFilterActive, setIsReturnedFilterActive] = useState(false);
    const [additionalItems, setAdditionalItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null); // Ensure this is defined
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [itemToArchive, setItemToArchive] = useState(null); // Store the item ID
    
    const toggleBorrowedFilter = () => {
        setIsBorrowedFilterActive(!isBorrowedFilterActive);
        if (isReturnedFilterActive) {
            setIsReturnedFilterActive(false);
        }
    };

    const handleReturnItem = async (addItemId) => {
        try {
            const payload = {
                add_item_status: 'RETURNED',
                add_item_returned_date: new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
            };
            const response = await axios.put(`http://localhost:3001/api/returnAdditionalItem/${addItemId}`, payload);

            if (response.status === 200) {
                setSuccess('Changes saved successfully!');
                refreshAddAdditionalItemList(); // Refresh the list to show updated status
            }
        } catch (error) {
            console.error('Failed to mark item as returned:', error);
            setError('Failed to save changes. ' + (error.response?.data?.error || error.message));
        }
    };

    const toggleEditModal = (item = null) => {
        setSelectedItem(item); // Set the selected item details when opening the modal
        setIsEditModalOpen(true); // Ensure the modal is opened
    };

    const closeEditModal = () => {
        setSelectedItem(null); // Reset selected item
        setIsEditModalOpen(false); // Close modal
    };

    const toggleReturnedFilter = () => {
        setIsReturnedFilterActive(!isReturnedFilterActive);
        if (isBorrowedFilterActive) {
            setIsBorrowedFilterActive(false);
        }
    };

    const filteredItems = additionalItems.filter((item) => {
        if (isBorrowedFilterActive) return item.add_item_status === "BORROWED";
        if (isReturnedFilterActive) return item.add_item_status === "RETURNED";
        return true; // No filter applied, show all items
    });
    
    const handleDateSearch = () => {
        if (isFilterActive) {
            clearDateSearch(); // Reset items and date
        } else {
            const filteredByDate = additionalItems.filter(item => {
                if (!selectedDate) return true;
                const borrowedDate = new Date(item.add_item_borrowed_date).toISOString().split('T')[0];
                return borrowedDate === selectedDate;
            });
            setAdditionalItems(filteredByDate);
            setIsFilterActive(true); // Set filter as active
        }
    };

    const clearDateSearch = () => {
        setSelectedDate('');
        fetchAdditionalItems(); // Reload original data
        setIsFilterActive(false); // Set filter as inactive
    };

    const toggleAddModal = () => {
        setIsAddModalOpen(!isAddModalOpen);
    };

    const fetchAdditionalItems = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/getAdditionalItems');
            
            // Filter out items with status "DELETE"
            const activeItems = response.data.filter(item => item.add_item_status !== 'DELETE');
            
            setAdditionalItems(activeItems);
        } catch (error) {
            console.error('Error fetching additional items:', error);
        }
    };
    

    const refreshAddAdditionalItemList = () => {
        fetchAdditionalItems();
    };

    const handleArchive = async (addItemId) => {
        try {
            const response = await axios.put(`http://localhost:3001/api/archiveAdditionalItem/${addItemId}`, {
                add_item_status: 'DELETE'
            });
    
            if (response.status === 200) {
                setSuccess('Item archived successfully!');
                refreshAddAdditionalItemList(); // Refresh list to reflect archived status
            }
        } catch (error) {
            console.error('Failed to archive item:', error);
            setError('Failed to archive item. ' + (error.response?.data?.error || error.message));
        }
    };
    

    useEffect(() => {
        fetchAdditionalItems();
    }, []);

    return (
        <section className='section-p1'>
            <header>
                <div style={{ backgroundColor: 'white', borderRadius: '10px 10px' }}>
                    <h1 className='subtitle p-2'>
                        <strong>Additional Item</strong>
                    </h1>
                    <Box sx={{ backgroundColor: 'white', borderRadius: '10px', padding: '10px' }}>
                        <Grid container alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={toggleAddModal}
                                    startIcon={<IoAdd />}
                                >
                                    Add
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <Box display="flex" justifyContent="flex-end" alignItems="center">
                                <p className='mr-1'>Borrowed Date:</p> <TextField
                                    type="date"
                                    variant="outlined"
                                    sx={{ marginRight: 1, width: '150px' }}
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    placeholder="Search by Date"
                                />
                                   <Button
                                    variant={isFilterActive ? "outlined" : "contained"}
                                    color="primary"
                                    startIcon={<IoSearchCircle />}
                                    onClick={handleDateSearch}
                                    sx={{ marginRight: 1 }}
                                >
                                    {isFilterActive ? "Clear" : "Search"}
                                </Button>

                                    <Button
                                        variant={isBorrowedFilterActive ? "contained" : "outlined"}
                                        color="primary"
                                        onClick={toggleBorrowedFilter}
                                        startIcon={<IoPeopleCircleOutline />}
                                        sx={{ marginRight: 1 }}
                                    >
                                        Borrowed
                                    </Button>
                                    <Button
                                        variant={isReturnedFilterActive ? "contained" : "outlined"}
                                        onClick={toggleReturnedFilter}
                                        startIcon={<IoSparklesOutline />}
                                        sx={{
                                            backgroundColor: isReturnedFilterActive ? '#1E3A8A' : 'transparent',
                                            color: isReturnedFilterActive ? '#fff' : '#1E3A8A',
                                            borderColor: '#1E3A8A',
                                            '&:hover': {
                                                backgroundColor: '#1E3A8A',
                                                color: '#fff',
                                            },
                                            marginRight: 1
                                        }}
                                    >
                                        Returned
                                    </Button>
                                    
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </div>
            </header>

            <section className='section-p1'>
            {error && <ErrorMsg message={error} />}
            {success && <SuccessMsg message={success} />}
                <Paper elevation={3} sx={{ backgroundColor: 'white', borderRadius: '10px', padding: 2 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Item Number</strong></TableCell>
                                    <TableCell><strong>Room:</strong></TableCell>
                                    <TableCell><strong>Guest Name</strong></TableCell>
                                    <TableCell><strong>Item Name</strong></TableCell>
                                    <TableCell><strong>Borrowed Date</strong></TableCell>
                                    <TableCell><strong>Returned Date</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell align="center" colSpan={2}><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredItems.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.room_number}</TableCell>
                                        <TableCell>{item.guest_fname} {item.guest_lname}</TableCell>
                                        <TableCell>{item.add_item_name}</TableCell>
                                        <TableCell>
                                            {new Date(item.add_item_borrowed_date).toLocaleString("en-US", { timeZone: "Asia/Manila" })}
                                        </TableCell>
                                        <TableCell>
                                            {item.add_item_returned_date 
                                                ? new Date(item.add_item_returned_date).toLocaleString("en-US", { timeZone: "Asia/Manila" }) 
                                                : 'Not Returned'}
                                        </TableCell>
                                        <TableCell>{item.add_item_status}</TableCell>
                                        <TableCell align="center">
                                            {item.add_item_status !== "RETURNED" && (
                                                <Button
                                                    variant="contained"
                                                    startIcon={<IoBagCheck />}
                                                    onClick={() => handleReturnItem(item.add_item_id)}
                                                    sx={{
                                                        color: '#fff',
                                                        backgroundColor: '#1E3A8A',
                                                        marginRight: 1
                                                    }}
                                                >
                                                    Returned
                                                </Button>
                                            )}
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                startIcon={<IoPencilOutline />}
                                                onClick={() => toggleEditModal(item)} // Pass the item here correctly
                                                sx={{ marginRight: 1 }}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                startIcon={<IoCloseSharp />}
                                                onClick={() => {
                                                    setItemToArchive(item.add_item_id);
                                                    setIsArchiveModalOpen(true); // Open the modal
                                                }}
                                            >
                                                Archive
                                            </Button>

                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </section>
            {isArchiveModalOpen && (
                <div className="modal is-active">
                    <div className="modal-background" onClick={() => setIsArchiveModalOpen(false)}></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">Confirm Archive</p>
                            <button 
                                className="delete" 
                                aria-label="close" 
                                onClick={() => setIsArchiveModalOpen(false)}
                            ></button>
                        </header>
                        <section className="modal-card-body">
                            <p>Are you sure you want to archive this item?</p>
                        </section>
                        <footer className="modal-card-foot">
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => {
                                    handleArchive(itemToArchive); // Confirm archive
                                    setIsArchiveModalOpen(false); // Close modal
                                }}
                                sx={{ marginRight: 1 }}

                            >
                                Yes, Archive
                            </Button>
                            <Button 
                                variant="outlined"
                                onClick={() => setIsArchiveModalOpen(false)}
                            >
                                Cancel
                            </Button>
                        </footer>
                    </div>
                </div>
            )}


            <AddAdditionalItemModal isOpen={isAddModalOpen} toggleModal={toggleAddModal} refreshAddAdditionalItemList={refreshAddAdditionalItemList} />
            <EditAdditionalItemModal 
                isOpen={isEditModalOpen} 
                onClose={closeEditModal} 
                addItemId={selectedItem?.add_item_id} // Pass the ID from selectedItem
                refreshAddAdditionalItemList={refreshAddAdditionalItemList} 
            />
        </section>
    );
};

export default AdditionalItem;
