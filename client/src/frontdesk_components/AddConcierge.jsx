import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bulma/css/bulma.min.css'; // Using Bulma CSS for styling
import '../App.css'; // Optional custom CSS
import AllConciergeRecords from '../frontdesk_modals/AllConciergeRecords';
import { Table, Snackbar, Alert, TableBody,CircularProgress, TableCell, TableContainer, Box, TableHead, TableRow, Paper, Button, TextField, Typography , IconButton, TableFooter } from '@mui/material';
import { IoAdd, IoRemove } from 'react-icons/io5';


const AddConcierge = () => {
  const [checkedInGuests, setCheckedInGuests] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]); // Allow multiple selected rooms
  const [conciergeNotes, setConciergeNotes] = useState('');
  const [selectedConcierges, setSelectedConcierges] = useState([]); // To store added concierge services temporarily
  const [availableConcierges, setAvailableConcierges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conciergeLoading, setConciergeLoading] = useState(true);
  const [numberOfGuests, setNumberOfGuests] = useState(1); 
  const [ongoingConciergeList, setOngoingConciergeList] = useState([]);
  const [selectedConciergeDetails, setSelectedConciergeDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false); // Added this line
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Initial number of guests

  const handleIncrease = () => {
    if (numberOfGuests < 40) {
      setNumberOfGuests(numberOfGuests + 1);
    }
  };

  const handleDecrease = () => {
    if (numberOfGuests > 1) {
      setNumberOfGuests(numberOfGuests - 1);
    }
  };

  const handleRoomClick = (concierge) => {
    if (concierge.check_in_id) {
        fetchConciergeDetails(concierge.check_in_id);
    } else {
        console.error("No check_in_id found for this concierge.");
    }
};


const fetchConciergeDetails = async (check_in_id) => {
  
    setDetailsLoading(true);
    try {
        const response = await axios.get(`https://light-house-system-h74t-server.vercel.app/api/getConciergeDetails?check_in_id=${check_in_id}`);
        setSelectedConciergeDetails(response.data);
    } catch (error) {
        console.error("Error fetching concierge details:", error);
    } finally {
        setDetailsLoading(false);
    }
};


  const fetchOngoingConcierges = async () => {
    try {
        const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getConciergesGuest');
        setOngoingConciergeList(response.data);
    } catch (error) {
        console.error('Error fetching ongoing concierges:', error);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    fetchOngoingConcierges();
}, []);

  const fetchCheckedInGuests = async () => {
    try {
        const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getCheckedInGuests');
        const sortedGuests = response.data.sort((a, b) => a.room_number - b.room_number);
        setCheckedInGuests(sortedGuests);
        setLoading(false);

    } catch (error) {
        console.error('Error fetching checked-in guests:', error);
        setLoading(false);

    }
};

const fetchAvailableConcierges = async () => { 
  try {
      const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getConcierge');
      const activeConcierges = response.data.filter(concierge => concierge.concierge_status === 'ACTIVE'); // Corrected 'concierge_status'
      setAvailableConcierges(activeConcierges);
  } catch (error) {
      console.error('Error fetching concierge services:', error);
  } finally {
      setConciergeLoading(false);
  }
};


useEffect(() => {
  fetchCheckedInGuests();
  fetchAvailableConcierges();
}, []);



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


const handleRemoveConciergeService = (conciergeId) => {
  setSelectedConcierges(selectedConcierges.filter(c => c.concierge_id !== conciergeId));
};

const handleSaveChanges = async () => {
  if (selectedRooms.length === 0) {
    setNotification({
      open: true,
      message: 'Please select at least one room before saving.',
      severity: 'warning',
    });
    return;
  }

  const roomsMissingCheckInId = selectedRooms.filter(room => !room.check_in_id);
  if (roomsMissingCheckInId.length > 0) {
    setNotification({
      open: true,
      message: 'Each selected room must have a check-in ID.',
      severity: 'warning',
    });
    return;
  }

  // Check if there is at least one order selected
  if (selectedConcierges.length === 0) {
    setNotification({
      open: true,
      message: 'Please add at least one concierge order before saving.',
      severity: 'warning',
    });
    return;
  }

  try {
    const requests = selectedRooms.map((room) => {
      const requestBody = {
        check_in_id: room.check_in_id,
        av_no_of_guest: numberOfGuests,
        av_concierge_notes: conciergeNotes,
        av_concierge_total_price: calculateGrandTotal(),
        selected_concierges: selectedConcierges.map(concierge => ({
          concierge_id: concierge.concierge_id,
          quantity: concierge.quantity,
          subtotal: concierge.subtotal,
        })),
      };
      return axios.post('https://light-house-system-h74t-server.vercel.app/api/addConciergeOrder', requestBody);
    });

    const responses = await Promise.all(requests);
    responses.forEach((response, index) => {
      if (response.status === 201) {
        console.log(`Concierge order saved for room ${selectedRooms[index].room_number}:`, response.data);
      }
    });

      setSelectedRooms([]);
      setConciergeNotes('');
      setNumberOfGuests(1);
      setSelectedConcierges([]);


    setNotification({
      open: true,
      message: 'Concierge orders saved successfully for selected rooms!',
      severity: 'success',
    });
    // Assume refreshConciergeList is a function that reloads the concierge list
    refreshConciergeList();
  } catch (error) {
    console.error('Error saving concierge orders:', error);
    setNotification({
      open: true,
      message: 'Error saving concierge orders. Please try again.',
      severity: 'error',
    });
  }
};

const handleCancel = async (conciergeId) => {
  try {
      await axios.put(`https://light-house-system-h74t-server.vercel.app/api/updateConciergeStatus`, {
          av_concierge_id: conciergeId,
          av_concierge_status: 'CANCELED'
      });
      setNotification({
        open: true,
        message: 'Concierge order has been canceled.',
        severity: 'success',
        
    });
      fetchConciergeDetails(conciergeId);
      refreshConciergeList();
  } catch (error) {
      console.error('Error canceling concierge order:', error);
      
  }
};

const handleComplete = async (conciergeId) => {
  try {
      await axios.put(`https://light-house-system-h74t-server.vercel.app/api/updateConciergeStatus`, {
          av_concierge_id: conciergeId,
          av_concierge_status: 'COMPLETE'
      });
      setNotification({
        open: true,
        message: 'Concierge orders marked as complete.',
        severity: 'success',
        
    });
      fetchConciergeDetails(conciergeId); 
      refreshConciergeList();
  } catch (error) {
      console.error('Error completing concierge order:', error);
  }
};


const handleAddConciergeService = (conciergeId) => {
  const conciergeToAdd = availableConcierges.find(c => c.concierge_id === conciergeId);
  if (conciergeToAdd && !selectedConcierges.find(c => c.concierge_id === conciergeId)) {
      setSelectedConcierges([
          ...selectedConcierges,
          {
              ...conciergeToAdd,
              quantity: 1, // Default quantity
              subtotal: conciergeToAdd.concierge_type_price, // Default subtotal based on price
          }
      ]);
  }
};

const handleQuantityChange = (conciergeId, increment) => {
  setSelectedConcierges(prevConcierges =>
      prevConcierges.map(concierge =>
          concierge.concierge_id === conciergeId
              ? {
                  ...concierge,
                  quantity: Math.min(5, Math.max(1, concierge.quantity + increment)),
                  subtotal: concierge.concierge_type_price * (Math.min(5, Math.max(1, concierge.quantity + increment)))
              }
              : concierge
      )
  );
};

const calculateGrandTotal = () => {
  return selectedConcierges.reduce((total, concierge) => total + (concierge.subtotal || 0), 0);
};

  // Define a function to refresh the staff list
  const refreshConciergeList = () => {
    fetchCheckedInGuests(); 
    fetchOngoingConcierges();
    
};


  return (
    <section className='section-p1'>
        <div className='columns'>
          {/* First Left Column: Add Housekeeping */}
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
                    <strong>Add Concierge</strong>
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
                      <div className='columns'>
                          <div className='column is-6'>
                              <Box className='field'>
                                  <label className='label'>Concierge: Number of Guests</label>
                                  <Box display="flex" alignItems="center">
                                    <IconButton
                                      onClick={handleDecrease}
                                      disabled={numberOfGuests <= 1}
                                      color="primary"
                                    >
                                      <IoRemove />
                                    </IconButton>
                                    
                                    <TextField
                                      value={numberOfGuests}
                                      inputProps={{ readOnly: true, style: { textAlign: 'center' } }}
                                      sx={{ width: '60px', textAlign: 'center' }}
                                    />
                                    
                                    <IconButton
                                      onClick={handleIncrease}
                                      disabled={numberOfGuests >= 40}
                                      color="primary"
                                    >
                                      <IoAdd />
                                    </IconButton>
                                  </Box>
                                </Box>
                              <div className='field'>
                                  <label className='label'>Concierge Notes</label>
                                  <TextField
                                      fullWidth
                                      multiline
                                      rows={4}
                                      placeholder="Enter concierge notes here..."
                                      value={conciergeNotes}
                                      onChange={(e) => setConciergeNotes(e.target.value)}
                                  />
                              </div>
                          </div>

                          <div className='column is-6'>
                              <div className='field'>
                                  <label className='label'>Check-in Room(s)</label>
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
                              </div>
                          </div>


                      </div>

                      {/* Available Concierge Services */}
                      <Typography variant="h6" gutterBottom>Available Concierge Services</Typography>
                      {conciergeLoading ? (
                          <p>Loading concierge services...</p>
                      ) : (
                          <TableContainer component={Paper}>
                              <Table>
                                  <TableHead>
                                      <TableRow>
                                          <TableCell><strong>Package Name</strong></TableCell>
                                          <TableCell><strong>Supplier</strong></TableCell>
                                          <TableCell><strong>Contact</strong></TableCell>
                                          <TableCell><strong>Duration</strong></TableCell>
                                          <TableCell><strong>Price</strong></TableCell>
                                          <TableCell><strong>Actions</strong></TableCell>
                                      </TableRow>
                                  </TableHead>
                                  <TableBody>
                                      {availableConcierges.map((concierge) => (
                                          <TableRow key={concierge.concierge_id}>
                                              <TableCell>{concierge.concierge_type}</TableCell>
                                              <TableCell>{concierge.concierge_supplier}</TableCell>
                                              <TableCell>{concierge.concierge_phone_no}</TableCell>
                                              <TableCell>{concierge.concierge_duration} - {concierge.concierge_start_time}</TableCell>
                                              <TableCell>₱{concierge.concierge_type_price}</TableCell>
                                              <TableCell>
                                                  <Button
                                                      variant="contained"
                                                      color="primary"
                                                      size="small"
                                                      onClick={() => handleAddConciergeService(concierge.concierge_id)}
                                                  >
                                                      Add
                                                  </Button>
                                              </TableCell>
                                          </TableRow>
                                      ))}
                                  </TableBody>
                              </Table>
                          </TableContainer>
                      )}

                      {/* Selected Concierge Services */}
                      {selectedConcierges.length > 0 && (
                          <>
                              <Typography variant="h6" gutterBottom className="mt-4">Selected Concierge Services</Typography>
                              <TableContainer component={Paper}>
                                  <Table>
                                      <TableHead>
                                          <TableRow>
                                              <TableCell>Package Name</TableCell>
                                              <TableCell>Duration</TableCell>
                                              <TableCell>Price</TableCell>
                                              <TableCell>Quantity</TableCell>
                                              <TableCell>Subtotal</TableCell>
                                              <TableCell>Actions</TableCell>
                                          </TableRow>
                                      </TableHead>
                                      <TableBody>
                                          {selectedConcierges.map((concierge) => (
                                              <TableRow key={concierge.concierge_id}>
                                                  <TableCell>{concierge.concierge_type}</TableCell>
                                                  <TableCell>{concierge.concierge_duration}</TableCell>
                                                  <TableCell>₱{(concierge.concierge_type_price || 0).toFixed(2)}</TableCell>
                                                  <TableCell>
                                                      <IconButton
                                                          onClick={() => handleQuantityChange(concierge.concierge_id, -1)}
                                                          disabled={concierge.quantity <= 1}
                                                      >
                                                          <IoRemove />
                                                      </IconButton>
                                                      {concierge.quantity}
                                                      <IconButton
                                                          onClick={() => handleQuantityChange(concierge.concierge_id, 1)}
                                                          disabled={concierge.quantity >= 5}
                                                      >
                                                          <IoAdd />
                                                      </IconButton>
                                                  </TableCell>
                                                  <TableCell>₱{(concierge.subtotal || 0).toFixed(2)}</TableCell>
                                                  <TableCell>
                                                      <Button
                                                          variant="contained"
                                                          color="secondary"
                                                          size="small"
                                                          onClick={() => handleRemoveConciergeService(concierge.concierge_id)}
                                                      >
                                                          Remove
                                                      </Button>
                                                  </TableCell>
                                              </TableRow>
                                          ))}
                                      </TableBody>

                                      <TableFooter>
                                          <TableRow>
                                              <TableCell colSpan={4} align="right">
                                                  <Typography variant="h6"><strong>Grand Total:</strong></Typography>
                                              </TableCell>
                                              <TableCell colSpan={2}>
                                                  <Typography variant="h6">₱{calculateGrandTotal().toFixed(2)}</Typography>
                                              </TableCell>
                                          </TableRow>
                                      </TableFooter>
                                  </Table>
                              </TableContainer>

                          </>
                      )}

                      {/* Save and Cancel Actions */}
                      <div className='field is-grouped mt-4' style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSaveChanges} // Directly call the function
                          className="mt-4"
                      >
                          Save Changes
                      </Button>

                      <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => setSelectedConcierges([])}
                          className="mt-4 ml-2"
                      >
                          Cancel
                      </Button>
                      </div>
                  </div>
              ) : (
                  <div className='box'>
                      <p>Please select a room to view available concierge services.</p>
                  </div>
              )}
          </div>
      </div>

      <div className='columns' style={{ minHeight: '100px' }}>
            <div className="column is-3" style={{ backgroundColor: 'white', borderRadius: '10px', height: '100%' }}> 
                <div className='column'>
                    <h1 className='subtitle'>
                        <strong>Room Concierge</strong>
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
                            {ongoingConciergeList.map((concierge) => (
                                <div key={concierge.av_concierge_id} className="column is-12">
                                    <button
                                        className="button is-fullwidth is-blue"
                                      
                                        onClick={() => handleRoomClick(concierge)}
                                    >
                                        Room {concierge.room_number} - {concierge.guest_fname} {concierge.guest_lname}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p>No ongoing concierge services found.</p>
                )}
            </div>

            <Box className="column is-9" sx={{ padding: 2 }}>
              <Paper elevation={3} sx={{ padding: 2 }}>
                  <Typography variant="h6" component="div" sx={{ marginBottom: 2 }}>
                      Room Concierge Detail
                  </Typography>

                  {detailsLoading ? (
                      <Box display="flex" justifyContent="center" alignItems="center" height="100px">
                          <CircularProgress />
                      </Box>
                  ) : selectedConciergeDetails ? (
                    <Box>
                    <Typography variant="body1"><strong>Number of Guests:</strong> {selectedConciergeDetails.av_no_of_guest}</Typography>
                    <Typography variant="body1" sx={{ marginBottom: 2 }}>
                        <strong>Concierge Notes:</strong> {selectedConciergeDetails.av_concierge_notes}
                    </Typography>
                
                    <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Package Name</strong></TableCell>
                                    <TableCell><strong>Price</strong></TableCell>
                                    <TableCell><strong>Quantity</strong></TableCell>
                                    <TableCell><strong>Subtotal</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedConciergeDetails.concierge_items.map((item) => (
                                    <TableRow key={item.concierge_list_id}>
                                        <TableCell>{item.concierge_type}</TableCell>
                                        <TableCell>₱{item.price.toFixed(2)}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>₱{item.subtotal.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                
                    <Typography variant="h6">
                        <strong>Total Cost:</strong> ₱{selectedConciergeDetails.av_total_price.toFixed(2)}
                    </Typography>
                
                    {/* DONE and CANCEL buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button 
                            variant="contained" 
                            color="secondary" 
                            onClick={() => handleCancel(selectedConciergeDetails.av_concierge_id)}
                            sx={{ mr: 2 }}
                        >
                            CANCEL
                        </Button>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => handleComplete(selectedConciergeDetails.av_concierge_id)}
                        >
                            DONE
                        </Button>
                    </Box>
                    </Box>
                  ) : (
                      <Typography variant="body1">Select a room to view details.</Typography>
                  )}
              </Paper>
          </Box>

<AllConciergeRecords open={isModalOpen} onClose={closeModal} />
  

        </div>
    </section>
  );
};

export default AddConcierge;
