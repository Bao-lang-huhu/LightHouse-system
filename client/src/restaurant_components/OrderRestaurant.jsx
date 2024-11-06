import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_r.css';
import { Grid, TextField, Box,Button, Container, Select, MenuItem, IconButton, Avatar, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputLabel, FormControl } from '@mui/material';
import { IoRemoveOutline, IoAddOutline, IoTrashBinOutline, IoPencil } from 'react-icons/io5';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

const OrderRestaurant = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  const [foodOrders, setFoodOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [showError, setShowError] = useState(false); 
  const navigate = useNavigate(); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFoodItems = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getFoodItems');
        const nonEventFoodItems = response.data.filter(item => item.food_service_category !== 'EVENT');
    
        setFoodItems(nonEventFoodItems);
        setFilteredFoodItems(nonEventFoodItems);
      } catch (error) {
        console.error('Error fetching food items:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchFoodItems();

    // Check if there are saved orders in localStorage
    const savedOrders = JSON.parse(localStorage.getItem('foodOrders')) || [];
    const savedNotes = localStorage.getItem('notes') || '';
    setFoodOrders(savedOrders);
    setNotes(savedNotes);
  }, []);

  useEffect(() => {
    const filteredItems = foodItems.filter(item => {
      const matchesSearchTerm = item.food_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? item.food_category_name === selectedCategory : true;
      return matchesSearchTerm && matchesCategory;
    });
    setFilteredFoodItems(filteredItems);
  }, [searchTerm, selectedCategory, foodItems]);

  const handleAddFoodItem = (foodItem) => {
    const existingOrder = foodOrders.find(order => order.food_id === foodItem.food_id);
    if (existingOrder) {
      setFoodOrders(prevOrders => 
        prevOrders.map(order => 
          order.food_id === foodItem.food_id 
            ? { ...order, quantity: order.quantity + 1 }
            : order
        )
      );
    } else {
      setFoodOrders([...foodOrders, { ...foodItem, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (id, increment) => {
    setFoodOrders((prevItems) =>
      prevItems.map((item) =>
        item.food_id === id
          ? { ...item, quantity: Math.max(1, item.quantity + increment) }
          : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setFoodOrders((prevItems) => prevItems.filter((item) => item.food_id !== id));
  };

  const handleProceedOrder = () => {
    if (foodOrders.length === 0) {
      setTimeout(() => {
        setShowError(true);
    }, 3000);
      return;
    }

    // Save current order and notes to localStorage before proceeding
    localStorage.setItem('foodOrders', JSON.stringify(foodOrders));
    localStorage.setItem('notes', notes);

    navigate('/restaurant_order/proceed_order', {
      state: {
        foodOrders,
        notes,
        total: foodOrders.reduce((sum, item) => sum + item.food_price * item.quantity, 0),
      },
    });
  };

  const total = foodOrders.reduce((sum, item) => sum + item.food_price * item.quantity, 0);

  return (
    <section className='section-p1'>
       <Box component="header" bgcolor="background.paper" py={2}>
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="flex-start">
          <Typography variant="h5" fontWeight="bold">
            Add Order
          </Typography>
        </Box>
      </Container>
    </Box>

      <section className="section-p1">
      <Grid container spacing={2}>

      {/* Filter Section */}
      <Grid container spacing={2} alignItems="center">
      {/* Filter Label */}
      <Grid item xs={12} md={2}>
        <Typography variant="h6">Filter (Food)</Typography>
      </Grid>
      
      {/* Search Field */}
      <Grid item xs={12} md={5}>
        <TextField
          label="Search"
          placeholder="Search for a food item"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Grid>

      {/* Food Category Selector */}
      <Grid item xs={12} md={5}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Food Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">Select food category</MenuItem>
            <MenuItem value="CHICKEN">CHICKEN</MenuItem>
            <MenuItem value="BEEF">BEEF</MenuItem>
            <MenuItem value="BURGER">BURGER</MenuItem>
            <MenuItem value="SALAD">SALAD</MenuItem>
            <MenuItem value="PASTA">PASTA</MenuItem>
            <MenuItem value="PORK">PORK</MenuItem>
            <MenuItem value="BREAKFAST">BREAKFAST</MenuItem>
            <MenuItem value="MEAL">MEAL</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>

      {/* Main Content Section */}
      <Grid item xs={12} container spacing={2}>
        {/* Food Items Section */}
        <Grid item xs={12} md={7}>
          <Typography variant="h6" className='m-2'>Food Menu</Typography>
          <Grid container spacing={2} style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {loading ? (
              <Grid item xs={12} style={{ textAlign: 'center' }}>
                <ClipLoader color="blue" size={50} />
              </Grid>
            ) : (
              filteredFoodItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.food_id}>
                  <Paper elevation={3} style={{ padding: '10px' }}>
                    <Avatar
                      src={item.food_photo}
                      variant="square"
                      style={{ width: '100%', height: '150px' }}
                      alt={item.food_name}
                    />
                    <Typography variant="subtitle1">{item.food_name}</Typography>
                    <Typography variant="body2">₱{item.food_price.toFixed(2)}</Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<IoAddOutline />}
                      onClick={() => handleAddFoodItem(item)}
                    >
                      Add
                    </Button>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        </Grid>

        {/* Order Summary Section */}
        <Grid item xs={12} md={5}>
          <Typography variant="h6">Order</Typography>
          {showError && (
            <Paper elevation={3} style={{ padding: '10px', backgroundColor: '#f8d7da' }}>
              <Typography variant="body2" color="error">
                <strong>Precondition Failed:</strong> No food items in the order. Please add food items before proceeding.
              </Typography>
            </Paper>
          )}
          
          <TableContainer component={Paper} style={{ marginTop: '10px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Image</TableCell>
                  <TableCell align="center">Food Name</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="center">Subtotal</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {foodOrders.map((item) => (
                  <TableRow key={item.food_id}>
                    <TableCell align="center">
                      <Avatar src={item.food_photo || 'https://via.placeholder.com/64'} alt={item.food_name} />
                    </TableCell>
                    <TableCell align="center">{item.food_name}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleQuantityChange(item.food_id, -1)}>
                        <IoRemoveOutline />
                      </IconButton>
                      <TextField
                        type="number"
                        value={item.quantity}
                        inputProps={{ readOnly: true, style: { textAlign: 'center' } }}
                        style={{ width: '50px' }}
                      />
                      <IconButton onClick={() => handleQuantityChange(item.food_id, 1)}>
                        <IoAddOutline />
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">₱{(item.food_price * item.quantity).toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        color="primary" // Use primary to start with, but override colors
                        fullWidth
                        style={{ 
                          backgroundColor: '#fff', // Set to white or an inverted color
                          color: '#1976d2', // Primary blue from Material-UI, adjust as needed
                          marginTop: '10px' 
                        }}
                        startIcon={<IoTrashBinOutline />}
                        onClick={() => handleRemoveItem(item.food_id)}
                      ></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" style={{ marginTop: '10px' }}>
            Total: ₱{total.toFixed(2)}
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<IoPencil />}
            onClick={() => setShowNotes(!showNotes)}
            style={{ marginTop: '10px' }}
          >
            {showNotes ? 'Hide Notes' : 'Add Notes'}
          </Button>
          
          {showNotes && (
            <TextField
              multiline
              rows={4}
              variant="outlined"
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter your notes here..."
              style={{ marginTop: '10px' }}
            />
          )}
          
          <Button 
            variant="contained"
            color="primary" // Use primary to start with, but override colors
            fullWidth
            onClick={handleProceedOrder}
            style={{ 
              backgroundColor: '#fff', // Set to white or an inverted color
              color: '#1976d2', // Primary blue from Material-UI, adjust as needed
              marginTop: '10px' 
            }}
          >
            Proceed Order
          </Button>

        </Grid>
      </Grid>
    </Grid>
      </section>
    </section>
  );
};

export default OrderRestaurant;
