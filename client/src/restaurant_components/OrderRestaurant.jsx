import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_r.css';
import { IconButton, TextField } from '@mui/material';
import { IoRemoveOutline, IoAddOutline, IoTrashBinOutline, IoPencil } from 'react-icons/io5';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import Avatar from '@mui/material/Avatar';

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
        const response = await axios.get('http://localhost:3001/api/getFoodItems');
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
      <header>
        <div className='container-white-space'>
          <div className="column is-multiline is-mobile">
            <h1 className="subtitle">
              <strong>Add Order</strong>
            </h1>
          </div>
          <div className="columns">
            <div className="column is-4">
              <h1 className="subtitle">Filter (Food)</h1>
              <div className="field">
                <label className="label">Search</label>
                <div className="control">
                  <input 
                    className="input" 
                    type="text" 
                    placeholder="Search for a food item"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Food Category</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">Select food category</option>
                      <option value="CHICKEN">CHICKEN</option>
                      <option value="BEEF">BEEF</option>
                      <option value="BURGER">BURGER</option>
                      <option value="SALAD">SALAD</option>
                      <option value="PASTA">PASTA</option>
                      <option value="PORK">PORK</option>
                      <option value="BREAKFAST">BREAKFAST</option>
                      <option value="MEAL">MEAL</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="column is-8">
              <h1 className="subtitle">Food Menu</h1>
              <div className="columns is-multiline" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                {loading ? (
                  // Show ClipLoader when loading
                  <div className="has-text-centered" style={{ width: '100%' }}>
                    <ClipLoader color="blue" size={50} />
                  </div>
                ) : (
                  // Render food items once loaded
                  filteredFoodItems.map((item) => (
                    <div className="column is-fullwidth-mobile is-8-tablet is-4-desktop" key={item.food_id}>
                      <div className="box">
                        <div className="card-image">
                          <figure className="image is-4by3" style={{ width: "100%", height: '30%' }}>
                            <img src={item.food_photo} alt={item.food_name} />
                          </figure>
                        </div>
                        <div className="card-content">
                          <p className="title is-6">{item.food_name}</p>
                          <p className="subtitle is-7">₱{item.food_price.toFixed(2)}</p>
                          <button
                            className="button is-small is-blue is-fullwidth"
                            onClick={() => handleAddFoodItem(item)}
                          >
                            <IoAddOutline /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="section-p1">
        <div className='container-white-space'>
          <div className="column is-multiline is-mobile">
            <h1 className="subtitle">
              <strong>Order</strong>
            </h1>
          </div>
          {/* Display error message if showError is true */}
          {showError && (
            <div className="notification is-danger">
              <button className="delete" onClick={() => setShowError(false)}></button>
              <strong>Precondition Failed:</strong> No food items in the order. Please add food items before proceeding.
            </div>
          )}
          <div className='columns'>
            <div className='column is-8'>
              <div className="table-container">
                <table className="table is-fullwidth is-striped is-hoverable">
                  <thead>
                    <tr>
                      <th className="has-text-centered">Image</th>
                      <th className="has-text-centered">Food Name</th>
                      <th className="has-text-centered">Quantity</th>
                      <th className="has-text-centered">Subtotal</th>
                      <th className="has-text-centered">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {foodOrders.map((item) => (
                      <tr key={item.food_id}>
                        <td>
                        <Avatar
                          src={item.food_photo || 'https://via.placeholder.com/64'}
                          alt={item.food_name}
                          style={{
                            width: 64,
                            height: 64,
                            margin: 'auto',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                          imgProps={{ style: { objectFit: 'cover' } }}
                        />
                        </td>
                        <td>{item.food_name}</td>
                        <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                          <div className='button-gap-mui'>
                            <IconButton className='button is-blue' onClick={() => handleQuantityChange(item.food_id, -1)}>
                              <IoRemoveOutline />
                            </IconButton>
                                <TextField 
                                  type="number"  
                                  value={item.quantity}
                                  InputProps={{
                                    readOnly: true,
                                    style: { textAlign: 'center' }
                                  }} 
                                  style={{ width: '60px' }} 
                                />
                            <IconButton className='button is-blue' onClick={() => handleQuantityChange(item.food_id, 1)} >
                              <IoAddOutline />
                            </IconButton>
                          </div>
                        </td>
                        <td>₱{(item.food_price * item.quantity).toFixed(2)}</td>
                        <td>
                          <button
                            className="button is-small is-red"
                            onClick={() => handleRemoveItem(item.food_id)}
                          >
                            <IoTrashBinOutline style={{ margin: '0 1rem 0 0' }} /> Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className='column is-4'>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className='title is-6'>Total: ₱{total.toFixed(2)}</p>
                <button className="button is-blue" onClick={() => setShowNotes(!showNotes)}>
                  <IoPencil style={{ margin: '0 5px' }} /> {showNotes ? 'Hide Notes' : 'Add Notes'}
                </button>
              </div>
              {showNotes && (
                <div style={{ marginTop: '1rem' }}>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter your notes here..."
                    className='textarea-appear'
                  />
                </div>
              )}
              <button className="button is-dark-blue is-fullwidth" style={{ marginTop: '1rem' }} onClick={handleProceedOrder}>
                Proceed Order
              </button>
            </div>
          </div>

        </div>
      </section>
    </section>
  );
};

export default OrderRestaurant;
