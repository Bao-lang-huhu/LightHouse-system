import React, { useState, useEffect } from 'react'; 
import 'bulma/css/bulma.min.css';
import '../App.css';
import '../manager_components/components_m.css';
import { IconButton, TextField } from '@mui/material';
import { IoRemoveOutline, IoAddOutline, IoTrashBinOutline } from 'react-icons/io5';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const OrderBar = () => {
  const [drinkItems, setDrinkItems] = useState([]);
  const [filteredDrinkItems, setFilteredDrinkItems] = useState([]);
  const [drinkOrders, setDrinkOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchDrinkItems = async () => {
      try {
        const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getDrinks'); // Adjust API endpoint
        setDrinkItems(response.data);
        setFilteredDrinkItems(response.data);
      } catch (error) {
        console.error('Error fetching drink items:', error);
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
      // Show error message if no drink items are in the order
      setShowError(true);
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
        <div className='container-white-space'>
          <div className="column is-multiline is-mobile">
            <h1 className="subtitle">
              <strong>Add Drink Order</strong>
            </h1>
          </div>
          <div className="columns">
            <div className="column is-4">
              <h1 className="subtitle">Filter (Drink)</h1>
              <div className="field">
                <label className="label">Search</label>
                <div className="control">
                  <input 
                    className="input" 
                    type="text" 
                    placeholder="Search for a drink item"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Drink Category</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}>
                      <option value="">Select drink category</option>
                      <option value="WHISKEY">Whiskey</option>
                      <option value="COCKTAIL">Cocktail</option>
                      <option value="BEER">Beer</option>
                      <option value="WINE">Wine</option>
                      <option value="NON-ALCOHOLIC">Non-Alcoholic</option>

                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="column is-8">
              <h1 className="subtitle">Drink Menu</h1>
              <div className="columns is-multiline" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                {filteredDrinkItems.map((item) => (
                  <div className="column is-fullwidth-mobile is-8-tablet is-4-desktop" key={item.drink_id}>
                    <div className="box">
                      <div className="card-image">
                        <figure className="image is-4by3" style={{ width: "100%", height: '30%' }}>
                          <img src={item.drink_photo} alt={item.drink_name} />
                        </figure>
                      </div>
                      <div className="card-content">
                        <p className="title is-6">{item.drink_name}</p>
                        <p className="subtitle is-7">₱{item.drink_price.toFixed(2)}</p>
                        <button 
                          className="button is-small is-blue is-fullwidth" 
                          onClick={() => handleAddDrinkItem(item)}
                        >
                          <IoAddOutline /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
          {showError && (
            <div className="notification is-danger">
              <button className="delete" onClick={() => setShowError(false)}></button>
              <strong>Precondition Failed:</strong> No drink items in the order. Please add drink items before proceeding.
            </div>
          )}
          <div className='columns'>
            <div className='column is-8'>
              <div className="table-container">
                <table className="table is-fullwidth is-striped is-hoverable">
                  <thead>
                    <tr>
                      <th className="has-text-centered">Image</th>
                      <th className="has-text-centered">Drink Name</th>
                      <th className="has-text-centered">Quantity</th>
                      <th className="has-text-centered">Subtotal</th>
                      <th className="has-text-centered">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {drinkOrders.map((item) => (
                      <tr key={item.drink_id}>
                        <td>
                          <figure className="image is-64x64">
                            <img src={item.drink_photo} alt={item.drink_name} />
                          </figure>
                        </td>
                        <td>{item.drink_name}</td>
                        <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                          <div className='button-gap-mui'>
                            <IconButton className='button is-blue' onClick={() => handleQuantityChange(item.drink_id, -1)}>
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
                            <IconButton className='button is-blue' onClick={() => handleQuantityChange(item.drink_id, 1)} >
                              <IoAddOutline />
                            </IconButton>
                          </div>
                        </td>
                        <td>₱{(item.drink_price * item.quantity).toFixed(2)}</td>
                        <td>
                          <button
                            className="button is-small is-red"
                            onClick={() => handleRemoveItem(item.drink_id)}
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
              </div>
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

export default OrderBar;
