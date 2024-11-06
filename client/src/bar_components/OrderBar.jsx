import React, { useState, useEffect } from 'react';  
import 'bulma/css/bulma.min.css';
import '../App.css';
import '../manager_components/components_m.css';
import { Box, Container, Grid, Typography, TextField, Select, MenuItem, InputLabel, FormControl, Avatar, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { IoAddOutline, IoRemoveOutline, IoTrashBinOutline, IoPencil } from 'react-icons/io5';
import ClipLoader from 'react-spinners/ClipLoader';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OrderBar = () => {
  const [drinkItems, setDrinkItems] = useState([]);
  const [filteredDrinkItems, setFilteredDrinkItems] = useState([]);
  const [drinkOrders, setDrinkOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchDrinkItems = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getDrinks'); // Adjust API endpoint
        setDrinkItems(response.data);
        setFilteredDrinkItems(response.data);
      } catch (error) {
        console.error('Error fetching drink items:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchDrinkItems();

    // Check if there are saved orders in localStorage
    const savedOrders = JSON.parse(localStorage.getItem('drinkOrders')) || [];
    setDrinkOrders(savedOrders);
  }, []);

  useEffect(() => {
    const filteredItems = drinkItems.filter(item => {
      const matchesSearchTerm = item.drink_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? item.bar_category_name === selectedCategory : true;
      return matchesSearchTerm && matchesCategory;
    });
    setFilteredDrinkItems(filteredItems);
  }, [searchTerm, selectedCategory, drinkItems]);

  const handleAddDrinkItem = (drinkItem) => {
    const existingOrder = drinkOrders.find(order => order.drink_id === drinkItem.drink_id);
    if (existingOrder) {
      setDrinkOrders(prevOrders => 
        prevOrders.map(order => 
          order.drink_id === drinkItem.drink_id 
            ? { ...order, quantity: order.quantity + 1 }
            : order
        )
      );
    } else {
      setDrinkOrders([...drinkOrders, { ...drinkItem, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (id, increment) => {
    setDrinkOrders((prevItems) =>
      prevItems.map((item) =>
        item.drink_id === id
          ? { ...item, quantity: Math.max(1, item.quantity + increment) }
          : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setDrinkOrders((prevItems) => prevItems.filter((item) => item.drink_id !== id));
  };

  const handleProceedOrder = () => {
    if (drinkOrders.length === 0) {
      // Add a 3-second delay before showing the error message
      setTimeout(() => {
          setShowError(true);
      }, 3000);
      return;
  }
  
    // Save current order and notes to localStorage before proceeding
    localStorage.setItem('drinkOrders', JSON.stringify(drinkOrders));

    navigate('/bar_order/proceed_order', {
      state: {
        drinkOrders,
        total: drinkOrders.reduce((sum, item) => sum + item.drink_price * item.quantity, 0),
      },
    });
  };

  const total = drinkOrders.reduce((sum, item) => sum + item.drink_price * item.quantity, 0);

  return (
    <section className='section-p1'>
      <header>
        {/* Header */}
        <Box component="header" bgcolor="background.paper" py={2}>
          <Container maxWidth="lg">
            <Typography variant="h5" fontWeight="bold">
              Add Order
            </Typography>
          </Container>
        </Box>
      </header>

      
      <section className="section-p1">
        <Grid container spacing={2}>

          {/* Filter Section */}
          <Grid container spacing={2} alignItems="center">
            {/* Filter Label */}
            <Grid item xs={12} md={2}>
              <Typography variant="h6">Filter (Drink)</Typography>
            </Grid>

            {/* Search Field */}
            <Grid item xs={12} md={5}>
              <TextField
                label="Search"
                placeholder="Search for a drink item"
                fullWidth
                margin="normal"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>

            {/* Drink Category Selector */}
            <Grid item xs={12} md={5}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Drink Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">Select drink category</MenuItem>
                  <MenuItem value="WHISKEY">Whiskey</MenuItem>
                  <MenuItem value="COCKTAIL">Cocktail</MenuItem>
                  <MenuItem value="BEER">Beer</MenuItem>
                  <MenuItem value="WINE">Wine</MenuItem>
                  <MenuItem value="NON-ALCOHOLIC">Non-Alcoholic</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Main Content Section */}
          <Grid item xs={12} container spacing={2}>
            {/* Drink Items Section */}
            <Grid item xs={12} md={7}>
              <Typography variant="h6" className='m-2'>Drink Menu</Typography>
              <Grid container spacing={2} style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {loading ? (
                  <Grid item xs={12} style={{ textAlign: 'center' }}>
                    <ClipLoader color="blue" size={50} />
                  </Grid>
                ) : (
                  filteredDrinkItems.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.drink_id}>
                      <Paper elevation={3} style={{ padding: '10px' }}>
                        <Avatar
                          src={item.drink_photo}
                          variant="square"
                          style={{ width: '100%', height: '150px' }}
                          alt={item.drink_name}
                        />
                        <Typography variant="subtitle1">{item.drink_name}</Typography>
                        <Typography variant="body2">₱{item.drink_price.toFixed(2)}</Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          startIcon={<IoAddOutline />}
                          onClick={() => handleAddDrinkItem(item)}
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
                    <strong>Precondition Failed:</strong> No drink items in the order. Please add drink items before proceeding.
                  </Typography>
                </Paper>
              )}

              <TableContainer component={Paper} style={{ marginTop: '10px' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Image</TableCell>
                      <TableCell align="center">Drink Name</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="center">Subtotal</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {drinkOrders.map((item) => (
                      <TableRow key={item.drink_id}>
                        <TableCell align="center">
                          <Avatar src={item.drink_photo || 'https://via.placeholder.com/64'} alt={item.drink_name} />
                        </TableCell>
                        <TableCell align="center">{item.drink_name}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => handleQuantityChange(item.drink_id, -1)}>
                            <IoRemoveOutline />
                          </IconButton>
                          <TextField
                            type="number"
                            value={item.quantity}
                            inputProps={{ readOnly: true, style: { textAlign: 'center' } }}
                            style={{ width: '50px' }}
                          />
                          <IconButton onClick={() => handleQuantityChange(item.drink_id, 1)}>
                            <IoAddOutline />
                          </IconButton>
                        </TableCell>
                        <TableCell align="center">₱{(item.drink_price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<IoTrashBinOutline />}
                            onClick={() => handleRemoveItem(item.drink_id)}
                          >
                          </Button>
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
                onClick={handleProceedOrder}
                style={{ marginTop: '10px' }}
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

export default OrderBar;
