import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bulma/css/bulma.min.css'; // Using Bulma CSS for styling
import '../App.css'; // Optional custom CSS
import AllLaundryRecords from '../frontdesk_modals/AllLaundryRecords';
import { Table, Snackbar, Alert, FormControlLabel , Switch, TableBody, CircularProgress, TableCell, TableContainer, Box, TableHead, TableRow, Paper, Button, TextField, Typography , IconButton, TableFooter,
  Divider, InputAdornment,} from '@mui/material';
import { jwtDecode } from 'jwt-decode'; 
import { IoAdd, IoRemove } from 'react-icons/io5';

const AddLaundry = () => {
  const [checkedInGuests, setCheckedInGuests] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]); // Allow multiple selected rooms
  const [loading, setLoading] = useState(true);
  const [ongoingConciergeList, setOngoingConciergeList] = useState([]);
  const [selectedConciergeDetails, setSelectedConciergeDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false); // Added this line
  const [isOutsourced, setIsOutsourced] = useState(false);
  const [currentStaff, setCurrentStaff] = useState({});
  const [ironingToggle, setIroningToggle] = useState(false);
  const [laundryItems, setLaundryItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [kilo, setKilo] = useState(1);
  const [costPerKilo, setCostPerKilo] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [laundryNotes, setLaundryNotes] = useState(''); // State for housekeeping notes
  const [laundryStore, setLaundryStore] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postedBy, setPostedBy] = useState('Helen Gittens');
  const [deliveredBy, setDeliveredBy] = useState('Nina Remi');  
  const [savedRooms, setSavedRooms] = useState([]); // State to manage saved rooms



  const handleKiloChange = (increment) => {
    setKilo((prevKilo) => Math.max(1, prevKilo + increment));
  };

  const handleCostPerKiloChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setCostPerKilo(value);
  };

  const calculateTotalCost = () => {
    const kiloCost = kilo * parseFloat(costPerKilo || 0);
    setTotalCost(kiloCost + grandTotal);
  };
  
  // Trigger calculation when any relevant value changes
  useEffect(() => {
    calculateTotalCost();
  }, [kilo, costPerKilo, grandTotal]);
  

  useEffect(() => {
    const total = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
    setGrandTotal(total);
  }, [selectedItems]);

  const handleToggleIroning = () => {
    if (!ironingToggle) {
      fetchLaundryItems();
    } else {
      resetLaundryOrder();
    }
    setIroningToggle(!ironingToggle);
  };
  
  const fetchLaundryItems = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/getLaundry');
      setLaundryItems(response.data);
    } catch (error) {
      console.error('Error fetching laundry items:', error);
    }
  };
  
  // Reset laundry order when toggled off
  const resetLaundryOrder = () => {
    setSelectedItems([]);
    setGrandTotal(0);
  };
  
  
  const handleAddItem = (item) => {
    setSelectedItems((prevSelectedItems) => {
      const existingItem = prevSelectedItems.find(selected => selected.laundry_id === item.laundry_id);
      if (existingItem) return prevSelectedItems; // Avoid duplicates
  
      const newItem = {
        laundry_id: item.laundry_id,
        laundry_item: item.laundry_item,
        ironing_price: item.laundry_ironing_price,
        quantity: 1,
        subtotal: item.laundry_ironing_price,
      };
      return [...prevSelectedItems, newItem];
    });
  };
  
  const handleQuantityChange = (laundry_id, increment) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.map((item) =>
        item.laundry_id === laundry_id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + increment), // Min quantity is 1
              subtotal: item.ironing_price * Math.max(1, item.quantity + increment),
            }
          : item
      )
    );
  };
  
  const handleRemoveItem = (laundry_id) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.filter(item => item.laundry_id !== laundry_id)
    );
  };
  
  

  
  useEffect(() => {
    const ironingTotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
    setGrandTotal(ironingTotal);
  }, [selectedItems]);
  
  // Toggle ironi
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentStaff({
          staff_id: decoded.staff_id,
          staff_name: `${decoded.staff_fname} ${decoded.staff_lname}`
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const handleToggleOutsourced = () => {
    setIsOutsourced((prev) => !prev);

    // Reset fields when toggling
    if (isOutsourced) {
      setLaundryStore('');
      setPostedBy('');
      setDeliveredBy('');
    }
  };
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info', 
});

const handleCloseNotification = () => {
  setNotification({ ...notification, open: false });
};

const openModal = () => setIsModalOpen(true);
const closeModal = () => setIsModalOpen(false);


useEffect(() => {
  fetchCheckedInGuests();
}, []);


const fetchCheckedInGuests = async () => {
    try {
        const response = await axios.get('http://localhost:3001/api/getCheckedInGuests');
        const sortedGuests = response.data.sort((a, b) => a.room_number - b.room_number);
        setCheckedInGuests(sortedGuests);
        setLoading(false);

    } catch (error) {
        console.error('Error fetching checked-in guests:', error);
        setLoading(false);

    }
};

const fetchOngoingConcierges = async () => {
  try {
      const response = await axios.get('http://localhost:3001/api/getLaundryGuest');
      setOngoingConciergeList(response.data);
  } catch (error) {
      console.error('Error fetching ongoing concierges:', error);
  } finally {
      setLoading(false);
  }
};

const handleSelectRoom = (guest) => {
  const isOngoing = ongoingConciergeList.some(
      (ongoing) => ongoing.room_number === guest.room_number
  );

  if (isOngoing) {
      // Only select this ongoing room if it's not already selected
      setSelectedRooms([guest]); // Set this room as the only selected room
  } else {
      setSelectedRooms((prevSelectedRooms) => {
          if (prevSelectedRooms.some((room) => room.check_in_id === guest.check_in_id)) {
              return prevSelectedRooms.filter((room) => room.check_in_id !== guest.check_in_id);
          } else {
              return [...prevSelectedRooms, guest];
          }
      });
  }
};

const fetchLaundryDetails = async (check_in_id) => { 
  setDetailsLoading(true);
  try {
      const response = await axios.get(`http://localhost:3001/api/getLaundryDetails?check_in_id=${check_in_id}`);
      const { data } = response;
      
      if (data) {
        setSelectedConciergeDetails(data); // Ensure data contains av_laundry_id
        console.log("Fetched Laundry Details:", data); // Log data to check structure
      } else {
        console.error("No data found for the given check_in_id");
      }
  } catch (error) {
      console.error("Error fetching laundry details:", error);
  } finally {
      setDetailsLoading(false);
  }
};

useEffect(() => {
  fetchOngoingConcierges();
}, []);

const handleSaveChanges = async () => {
  if (selectedRooms.length === 0) {
    setNotification({
      open: true,
      message: 'Please select a room before saving.',
      severity: 'warning',
    });
    return;
  }

  if (!costPerKilo || parseFloat(costPerKilo) <= 0) {
    setNotification({
      open: true,
      message: 'Please enter a valid Cost of Laundry by Kilo.',
      severity: 'warning',
    });
    return;
  }

  const requestBody = {
    check_in_id: selectedRooms[0].check_in_id,
    staff_id: currentStaff.staff_id,
    laun_notes: laundryNotes,
    laun_kilo: kilo,
    laun_total_price: totalCost,
    laun_ironing: ironingToggle,
    laun_is_outsourced: isOutsourced,
    start_date: new Date().toISOString(),
    end_date: null, // Set this based on your completion criteria
    outsourcedDetails: isOutsourced
      ? {
          laun_outsource_name: laundryStore,
          laun_posted_by: postedBy,
          laun_date_posted: new Date().toISOString(),
          laun_delivered_by: deliveredBy,
          laun_date_delivered: null, // Update if applicable
        }
      : null,
    selectedLaundryItems: selectedItems.map(item => ({
      laundry_id: item.laundry_id,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
  };

  try {
    const response = await axios.post('http://localhost:3001/api/addLaundryOrder', requestBody);
    if (response.status === 201) {
      setNotification({
        open: true,
        message: 'Laundry order saved successfully!',
        severity: 'success',
      });
      // Reset fields after saving
      setSelectedRooms([]);
      setLaundryNotes('');
      setKilo(1);
      setCostPerKilo('');
      setTotalCost(0);
      setSelectedItems([]);
      setIsOutsourced(false);
      setIroningToggle(false);
      refreshLaundryList();
    } else {
      throw new Error('Failed to save laundry order');
    }
  } catch (error) {
    console.error('Error saving laundry order:', error);
    setNotification({
      open: true,
      message: 'Error saving laundry order. Please try again.',
      severity: 'error',
    });
  }
};

  const handleCancelLaundry = () => {
    alert(`Laundry for rooms ${savedRooms.map(r => r.id).join(', ')} has been canceled.`);
    setSavedRooms([]); // Clear saved rooms after cancellation
  };

  const handleComplete = async () => { 
    const laundryId = selectedConciergeDetails?.laundryData?.av_laundry_id;
    if (!laundryId) {
      console.error("av_laundry_id is undefined");
      return;
    }
  
    try {
      await axios.put(`http://localhost:3001/api/updateLaundryStatus`, {
        av_laundry_id: laundryId,
        laun_status: 'COMPLETE'
      });
      setNotification({
        open: true,
        message: 'Laundry order marked as complete.',
        severity: 'success',
      });
      fetchLaundryDetails(laundryId); 
      refreshLaundryList();
    } catch (error) {
      console.error('Error completing laundry order:', error);
    }
  };
  
  const handleCancel = async () => { 
    const laundryId = selectedConciergeDetails?.laundryData?.av_laundry_id;
    if (!laundryId) {
      console.error("av_laundry_id is undefined");
      return;
    }
  
    try {
      await axios.put(`http://localhost:3001/api/updateLaundryStatus`, {
        av_laundry_id: laundryId,
        laun_status: 'CANCELED'
      });
      setNotification({
        open: true,
        message: 'Laundry order canceled.',
        severity: 'info',
      });
      fetchLaundryDetails(laundryId); 
      refreshLaundryList();
    } catch (error) {
      console.error('Error canceling laundry order:', error);
    }
  };
  
  
  const refreshLaundryList = () =>{
    fetchCheckedInGuests(); 
    fetchOngoingConcierges();
  };

  return (
    <section className='section-p1'>
      <div className='columns'>
       <div className="column is-3">
            <div style={{ backgroundColor: 'white', borderRadius: '10px', height: '90%', display: 'flex', flexDirection: 'column' }}>
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
                sx={{ width: '500px' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} style={{ fontSize: '1.2rem', padding: '20px' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
              <div style={{ flex: 1 }}>
                {/* Title and Button Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h1 className='subtitle' style={{ marginLeft: '25px', margin: 18 }}>
                    <strong>Add Laundry</strong>
                  </h1>
                  <div className='control'>
                  <Button variant="contained" color="primary" onClick={openModal} >
                    ALL RECORD
                  </Button>
                  </div>
                </div>
                <p className='has-text-grey' style={{ fontSize: '16px', margin: 6 }}>
                  Rooms with checked-in guest
                </p>

                {/* Room List Section */}
                <div className="container section-p1" style={{ maxHeight: '400px', overflowY: 'auto', flex: 1 }}>
                {loading ? (
                    <p>Loading check-ins...</p>
                ) : (
                  <div className="columns is-multiline is-mobile">
                  {checkedInGuests.map((guest) => {
                      const isOngoing = ongoingConciergeList.some(
                          (ongoing) => ongoing.room_number === guest.room_number
                      );
                      const isSelected = selectedRooms.some((room) => room.check_in_id === guest.check_in_id);
              
                      // Only render the button if the room is not ongoing
                      return !isOngoing ? (
                          <div key={guest.check_in_id} className="column is-12">
                              <button
                                  className="button is-fullwidth"
                                  onClick={() => handleSelectRoom(guest)}
                                  style={{ backgroundColor: isSelected ? 'lightblue' : undefined }}
                              >
                                  Room {guest.room_number} - {guest.guest_fname} {guest.guest_lname}
                              </button>
                          </div>
                      ) : null;
                  })}
              </div>
              
                )}
            </div>

              </div>
            </div>
        </div>

        
        <div className='column is-9'>
          {selectedRooms ? (
          <div className='box'>
          
          <Box sx={{ padding: 3, backgroundColor: 'white', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              <strong>Room Laundry Detail</strong>
            </Typography>
            <Box display="flex" gap={3}>
              {/* Left Column */}
              <Box flex={1}>
                <Box alignItems="center" mb={2}>
                  <Typography variant="body1" sx={{ mr: 2, minWidth: '80px' }}>
                    <strong>Room:</strong>
                  </Typography>
                  {selectedRooms.length > 0 ? (
                        selectedRooms.map((room) => (
                    <Box key={room.check_in_id} sx={{ marginBottom: 1 }}>
                        <TextField
                             fullWidth
                            value={`Room ${room.room_number} - ${room.guest_fname} ${room.guest_lname}`}
                            InputProps={{ readOnly: true }}
                                              />
                                          </Box>
                                      ))
                      ) : (
                       <Typography variant="body1">No rooms selected</Typography>
                     )}
                </Box>

                {/* Toggle for Outsourcing */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={isOutsourced}
                      onChange={handleToggleOutsourced}
                      color="primary"
                    />
                  }
                  label={<Typography variant="body1" sx={{ fontWeight: 'bold' }}>Outsourced</Typography>}
                  sx={{ mt: 3 }}
                />

                {/* Outsourcing Fields - Shown only if isOutsourced is true */}
                {isOutsourced && (
                  <>
                    <TextField
                      label="Laundry Outsourcing Name/Store"
                      variant="outlined"
                      fullWidth
                      placeholder="Enter Store Name"
                      value={laundryStore}
                      onChange={(e) => setLaundryStore(e.target.value)}
                      sx={{ mt: 1 }}
                    />

                    <TextField
                      label="Laundry Posted By"
                      variant="outlined"
                      fullWidth
                      placeholder="Enter Poster Name"
                      value={postedBy}
                      onChange={(e) => setPostedBy(e.target.value)}
                      sx={{ mt: 2 }}
                    />

                    <TextField
                      label="Laundry Delivered By"
                      variant="outlined"
                      fullWidth
                      placeholder="Enter Delivery Person Name"
                      value={deliveredBy}
                      onChange={(e) => setDeliveredBy(e.target.value)}
                      sx={{ mt: 2 }}
                    />
                  </>
                )}

              </Box>

              {/* Right Column */}
              <Box flex={1}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Staff
                </Typography>

                  {/* Staff Name TextField */}
                  <TextField
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled
                    placeholder="Staff Name"
                    value={currentStaff.staff_name || ''}
                  />

            <TextField
                  label="Laundry Notes"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Enter laundry notes here..."
                  value={laundryNotes}
                  onChange={(e) => setLaundryNotes(e.target.value)}
                  sx={{ mt: 2 }}
                />
             
              </Box>
            </Box>
            <Box>
            <>
              <Button variant="outlined" color="primary"  sx={{ mt: 2 }} fullWidth onClick={handleToggleIroning}>
                {ironingToggle ? 'Remove Ironing' : 'Add Ironing'}
              </Button>

              {ironingToggle && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6">Available Laundry Items</Typography>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Laundry Item</strong></TableCell>
                          <TableCell><strong>Ironing Price</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {laundryItems.map(item => (
                          <TableRow key={item.laundry_id}>
                            <TableCell>{item.laundry_item}</TableCell>
                            <TableCell>₱{item.laundry_ironing_price.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button variant="contained" color="primary" size="small" onClick={() => handleAddItem(item)}>
                                Add
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Selected Items Table */}
                  {selectedItems.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6">Selected Laundry Items</Typography>
                      <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Laundry Item</strong></TableCell>
                              <TableCell><strong>Ironing Price</strong></TableCell>
                              <TableCell><strong>Quantity</strong></TableCell>
                              <TableCell><strong>Subtotal</strong></TableCell>
                              <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedItems.map(item => (
                              <TableRow key={item.laundry_id}>
                                <TableCell>{item.laundry_item}</TableCell>
                                <TableCell>₱{item.ironing_price.toFixed(2)}</TableCell>
                                <TableCell>
                                  <IconButton onClick={() => handleQuantityChange(item.laundry_id, -1)} disabled={item.quantity <= 1}>
                                    <IoRemove />
                                  </IconButton>
                                  {item.quantity}
                                  <IconButton onClick={() => handleQuantityChange(item.laundry_id, 1)}>
                                    <IoAdd />
                                  </IconButton>
                                </TableCell>
                                <TableCell>₱{item.subtotal.toFixed(2)}</TableCell>
                                <TableCell>
                                  <Button variant="contained" color="secondary" size="small" onClick={() => handleRemoveItem(item.laundry_id)}>
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Grand Total Display */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="h6">Ironing Total:</Typography>
                        <Typography variant="h6">₱{grandTotal.toFixed(2)}</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </>
           {/* Kilo of Laundry with +/- buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Typography variant="body1" sx={{ minWidth: '140px' }}>
                  Kilo of Laundry
                </Typography>
                <IconButton onClick={() => handleKiloChange(-1)} disabled={kilo <= 1}>
                  <IoRemove />
                </IconButton>
                <Typography>{kilo}</Typography>
                <IconButton onClick={() => handleKiloChange(1)}>
                  <IoAdd />
                </IconButton>
              </Box>

              {/* Cost per Kilo */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  label="Cost of Laundry by Kilo"
                  variant="outlined"
                  placeholder="Enter Cost per Kilo"
                  value={costPerKilo}
                  onChange={handleCostPerKiloChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                  fullWidth
                />
              </Box>

              <TextField
                  label="Total Cost of Laundry"
                  variant="outlined"
                  value={`₱${totalCost.toFixed(2)}`}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                  fullWidth
                  sx={{ mt: 2 }}
                />

              </Box>

            <Divider sx={{ my: 3, borderColor: 'black' }} />

            <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveChanges}
              sx={{ px: 4 }}
            >
              Save Changes
            </Button>

              <Button
                variant="contained"
                color="error"
                onClick={handleCancelLaundry}
                sx={{ px: 4 }}
              >
                CANCEL
              </Button>
            </Box>
          </Box>
          </div>
          ) : (
            <div className='box'>
            <p>Please select a room to view available concierge services.</p>
              </div>
          )}
        </div>

      </div>

      <div className='columns' style={{ minHeight: '100px' }}>
        <div className="column is-3" style={{ backgroundColor: 'white', borderRadius: '10px', height: '90%' , marginRight:'20px' }}> 
          <div className='column'>
            <h1 className='subtitle'>
              <strong>Room Laundry</strong>
            </h1>
            <p className='has-text-grey' style={{ fontSize: '16px', margin: 10 }}>
              ONGOING
            </p>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : ongoingConciergeList.length > 0 ? (
            <div className="container section-p1" style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
              <div className="columns is-multiline is-mobile">
                {ongoingConciergeList.map((laundry) => (
                  <div key={laundry.av_laundry_id} className="column is-12">
                    <button
                      className="button is-fullwidth is-blue"
                      onClick={() => fetchLaundryDetails(laundry.check_in_id)} 
                    >
                      Room {laundry.room_number} - {laundry.guest_fname} {laundry.guest_lname}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>No ongoing laundry services found.</p>
          )}
        </div>

          <>
          <Box className="column is-9" sx={{ padding: 3, backgroundColor: 'white', borderRadius: 2 }}>
        {selectedConciergeDetails && (
          <>
            <Typography variant="h5" gutterBottom>
              Room Laundry Details
            </Typography>
            
            <Typography variant="body1">
              <strong>Guest:</strong> {selectedConciergeDetails.guestData.guest_fname} {selectedConciergeDetails.guestData.guest_lname}
            </Typography>
            <Typography variant="body1">
              <strong>Notes:</strong> {selectedConciergeDetails.laundryData.laun_notes}
            </Typography>
            <Typography variant="body1">
              <strong>Total Kilos:</strong> {selectedConciergeDetails.laundryData.laun_kilo}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Total Price:</strong> ₱{selectedConciergeDetails.laundryData.laun_total_price.toFixed(2)}
            </Typography>

            {selectedConciergeDetails.laundryData.laun_is_outsourced && selectedConciergeDetails.outsourcedData && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Outsourced Laundry Details
                </Typography>
                <Typography variant="body1">
                  <strong>Outsource Name:</strong> {selectedConciergeDetails.outsourcedData.laun_outsource_name}
                </Typography>
                <Typography variant="body1">
                  <strong>Posted By:</strong> {selectedConciergeDetails.outsourcedData.laun_posted_by}
                </Typography>
                <Typography variant="body1">
                  <strong>Date Posted:</strong> {selectedConciergeDetails.outsourcedData.laun_date_posted}
                </Typography>
                <Typography variant="body1">
                  <strong>Delivered By:</strong> {selectedConciergeDetails.outsourcedData.laun_delivered_by}
                </Typography>
              </Box>
            )}

            {/* Only render the table if there are laundry items */}
            {selectedConciergeDetails.laundryItems && selectedConciergeDetails.laundryItems.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Laundry Items
                </Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Laundry Item</strong></TableCell>
                        <TableCell><strong>Ironing Price</strong></TableCell>
                        <TableCell><strong>Quantity</strong></TableCell>
                        <TableCell><strong>Subtotal</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedConciergeDetails.laundryItems.map((item) => (
                        <TableRow key={item.laundry_id}>
                          <TableCell>{item.laundry_item}</TableCell>
                          <TableCell>₱{item.laundry_ironing_price.toFixed(2)}</TableCell>
                          <TableCell>{item.laun_quantity}</TableCell>
                          <TableCell>₱{item.laun_subtotal.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right"><strong>Grand Total</strong></TableCell>
                        <TableCell><strong>₱{selectedConciergeDetails.laundryData.laun_total_price.toFixed(2)}</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>


            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => handleCancel(selectedConciergeDetails.av_laundry_id)}
                    sx={{ mr: 2 }}
                  >
                    CANCEL
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleComplete(selectedConciergeDetails.av_laundry_id)}
                  >
                    DONE
                  </Button>
            </Box>
          </>
          
        )}
      </Box>
          </>

          
          <AllLaundryRecords open={isModalOpen} onClose={closeModal} />


      </div>

    </section>
  );
};

export default AddLaundry;
