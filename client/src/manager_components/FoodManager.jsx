import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_m.css';
import { IoAdd, IoFastFoodOutline, IoSearchCircle } from 'react-icons/io5';
import AddFoodModal from '../manager_modals/AddFoodModal';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';
import axios from 'axios';

const FoodManager = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [foods, setFoods] = useState([]); // State to store food items
    const [selectedFood, setSelectedFood] = useState(null); // State to manage selected food
    const [searchTerm, setSearchTerm] = useState(''); // State to handle search term
    const [foodPhoto, setFoodPhoto] = useState(null);
    const [foodPhotoPreview, setFoodPhotoPreview] = useState(null); 
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isArchiving, setIsArchiving] = useState(false); 

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFoodPhoto(reader.result); // Update photo state
                setFoodPhotoPreview(reader.result); // Update photo preview state
                setSelectedFood((prev) => ({ ...prev, food_photo: reader.result })); // Update selected food object
            };
            reader.readAsDataURL(file); // Convert image to base64
        }
    };

    const calculateFinalPrice = (price, discount) => {
        const discountAmount = (price * discount) / 100;
        return price - discountAmount;
    };

    // Fetch food data on component mount
        const fetchFoods = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/getFoodItems'); // Replace with your API endpoint
                setFoods(response.data.filter(food => food.food_status !== 'DELETE')); // Set the fetched food data to state, excluding inactive
            } catch (error) {
                console.error('Error fetching food data:', error);
            }
        };

        const refreshFoodList = () => {
            fetchFoods(); 
        };
    
        useEffect(() => {
            fetchFoods();
        }, []);

      
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    // Get status color based on food status
    const getStatusColor = (status) => {
        return status === 'ACTIVE' ? 'green' : 'red';
    };

    const handleFoodClick = (food) => {
        // Reset all states related to food details
        setFoodPhoto(null);
        setFoodPhotoPreview(null);
        setSelectedFood({ ...food }); // Set the clicked food as selected
        setError(''); // Clear error
        setSuccess(''); // Clear success
    };

    // Handle input change in the detail view
    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setSelectedFood((prev) => {
            const updatedFood = { ...prev, [name]: value };

            if (name === 'food_price' || name === 'food_disc_percentage') {
                updatedFood.food_final_price = calculateFinalPrice(
                    parseFloat(updatedFood.food_price) || 0,
                    parseFloat(updatedFood.food_disc_percentage) || 0
                );
            }

            return updatedFood;
        });
    };

    // Handle save changes
    const handleSaveChanges = async () => {
        try {
            setError('');
            setSuccess('');

            const response = await axios.put(`http://localhost:3001/api/updateFoodItem/${selectedFood.food_id}`, selectedFood);

            if (response.status === 200) {
                setSuccess('Food item updated successfully!');
                setError('');

                // Update the food list with the new data
                setFoods((prevFoods) =>
                    prevFoods.map((food) =>
                        food.food_id === selectedFood.food_id ? { ...food, ...selectedFood } : food
                    )
                );

                setTimeout(() => {
                    setSuccess('');
                }, 3000);
            }
        } catch (error) {
            console.error('Error updating food item:', error.response?.data || error.message);
            setError('Failed to update food item: ' + (error.response?.data?.error || error.message));
            setSuccess('');
        }
    };

    // Handle archiving a food item
    const handleArchive = async () => {
        setIsArchiving(false); // Hide the confirmation dialog

        try {
            setError('');
            setSuccess('');

            const response = await axios.put(
                `http://localhost:3001/api/updateFoodItem/${selectedFood.food_id}`,
                {
                    food_id: selectedFood.food_id,
                    food_status: 'DELETE' 
                }
            );

            if (response.status === 200) {
                setSuccess('Food item archived successfully!');
                setError('');

                // Remove the archived food from the list
                setFoods((prevFoods) => prevFoods.filter((food) => food.food_id !== selectedFood.food_id));
                setSelectedFood(null);

                setTimeout(() => {
                    setSuccess('');
                }, 3000);
            }
        } catch (error) {
            console.error('Error archiving food item:', error.response?.data || error.message);
            setError('Failed to archive food item: ' + (error.response?.data?.error || error.message));
            setSuccess('');
        }
    };

    // Filter food items based on search term
    const filteredFoods = foods.filter((food) =>
        food.food_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section className='section-p1'>
            <div className="columns" style={{ minHeight: "100vh" }}>
                <div className="column is-3">
                    <div className="column">
                        <div className='columns is-vcentered tablet-column-layout'>
                            <div className='column'>
                                <h1 className='subtitle'>
                                    <strong>Food Menu</strong>
                                </h1>
                            </div>
                            <div className='column is-narrow'>
                                <button className='button is-blue' onClick={toggleModal}>
                                    <IoAdd style={{ marginRight: '5px' }} /> Add
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="column is-hidden-tablet-only custom-hide-tablet is-fullwidth" style={{ padding: '0', margin: '0' }}>
                        <div className="field has-addons is-flex is-flex-direction-row is-fullwidth-mobile">
                            <div className="control is-expanded is-fullwidth">
                                <input
                                    className="input is-fullwidth-mobile"
                                    type="text"
                                    style={{ margin: '0' }}
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)} // Update search term
                                />
                            </div>
                            <div className="control is-fullwidth">
                                <button className="button is-blue is-fullwidth-mobile" style={{ height: '100%' }}>
                                    <IoSearchCircle className="is-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Food List */}
                    <div style={{ marginBottom: "5px" }}>
                        {filteredFoods.map((food) => (
                            <div
                                key={food.food_id}
                                className={`staff-space ${selectedFood && selectedFood.food_id === food.food_id ? 'is-active' : ''}`} // Highlight selected food
                                onClick={() => handleFoodClick(food)} // Handle food item click
                                style={{
                                    cursor: 'pointer',
                                    padding: '1rem',
                                    backgroundColor: selectedFood?.food_id === food.food_id ? '#e8f4ff' : 'transparent'
                                }}
                            >
                                <div className="columns is-vcentered is-mobile" style={{ paddingLeft: "5px" }}>
                                    <IoFastFoodOutline style={{ marginRight: '5px', textAlign: 'center' }} />
                                    <div className="column is-flex is-align-items-center">
                                        <h3 style={{ marginRight: "8px" }}>{food.food_name}</h3>
                                        <div
                                            className="status-circle"
                                            style={{
                                                backgroundColor: getStatusColor(food.food_status), // Color based on status
                                                borderRadius: '50%',
                                                width: '10px',
                                                height: '10px'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="column" style={{ backgroundColor: "white" }}>
                    <main className="section-p1">
                        <div className="columns">
                            <h1 className="subtitle">
                                <strong>Food Details</strong>
                            </h1>
                        </div>

                        {error && <ErrorMsg message={error} />}
                        {success && <SuccessMsg message={success} />}

                        {selectedFood ? (
                            <div>
                                <div className="columns is-vcentered">
                                    {/* First Column - Food Information */}
                                    <div className="column is-one-half">
                                        <div className="staff-space">
                                            <div className="field">
                                                <label className="label">Food Name</label>
                                                <div className="control">
                                                    <input
                                                        className="input"
                                                        type="text"
                                                        name="food_name"
                                                        value={selectedFood.food_name}
                                                        onChange={handleDetailChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="field">
                                                <label className="label">Food Category</label>
                                                <div className="control">
                                                    <div className="select is-fullwidth">
                                                        <select
                                                            name="food_category_name"
                                                            value={selectedFood.food_category_name}
                                                            onChange={handleDetailChange}
                                                        >
                                                            <option value="CHICKEN">CHICKEN</option>
                                                            <option value="BEEF">BEEF</option>
                                                            <option value="BURGER">BURGER</option>
                                                            <option value="SALAD">SALAD</option>
                                                            <option value="PASTA">PASTA</option>
                                                            <option value="PORK">PORK</option>
                                                            <option value="BREAKFAST">BREAKFAST</option>
                                                            <option value="MEAL">MEAL</option>
                                                            <option value="DESSERT">DESSERT</option>
                                                            <option value="DRINK">DRINK (EVENT)</option>
                                                            <option value="MAIN">MAIN (EVENT)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="field">
                                                <label className="label">Event Category</label>
                                                <div className="control">
                                                    <div className="select is-fullwidth">
                                                        <select
                                                            name="food_service_category"
                                                            value={selectedFood.food_service_category}
                                                            onChange={handleDetailChange}
                                                        >
                                                            <option value="EVENT">EVENT</option>
                                                            <option value="BOTH">BOTH</option>
                                                            <option value="RESTAURANT">RESTAURANT</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Second Column - Photo */}
                                    <div className="column is-one-half">
                                        <div className="staff-space">
                                            {foodPhotoPreview ? (
                                                <img
                                                    src={foodPhotoPreview}
                                                    alt={selectedFood.food_name}
                                                    style={{ width: '150px', height: '150px', borderRadius: '8px' }}
                                                />
                                            ) : selectedFood.food_photo && (
                                                <img
                                                    src={selectedFood.food_photo}
                                                    alt={selectedFood.food_name}
                                                    style={{ width: '150px', height: '150px', borderRadius: '8px' }}
                                                />
                                            )}
                                           
                                            <div className='field'>
                                                <label className="label">Food Photo</label>
                                                <p>Only 3 MB photos in file types JPEG, JPG, and PNG</p>
                                                <div className="control">
                                                    <input className="input" type="file" accept="image/*" onChange={handlePhotoChange} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Separator Line */}
                                <hr />

                                <div className="columns">
                                    <div className="column">
                                        <div className="columns">
                                            <h1 className="subtitle">
                                                <strong>Food Information</strong>
                                            </h1>
                                        </div>
                                        <div className="columns is-multiline">

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Food Description</label>
                                                    <div className="control">
                                                        <textarea
                                                            className="textarea"
                                                            name="food_description"
                                                            value={selectedFood.food_description}
                                                            onChange={handleDetailChange}
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6"> 
                                                <div className="field">
                                                    <label className="label">Food Final Price</label>
                                                    <div className="control">
                                                        <input
                                                            className="input"
                                                            type="number"
                                                            name="food_final_price"
                                                            readOnly
                                                            value={selectedFood.food_final_price}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Food Price</label>
                                                    <div className="control">
                                                        <input
                                                            className={`input`}
                                                            type="number"
                                                            name="food_price"
                                                            value={selectedFood.food_price}
                                                            min="1" // Set the minimum value to 1
                                                            onChange={(e) => {
                                                                let value = e.target.value;

                                                                // Prevent negative input and input starting with '0'
                                                                if (value >= 0 && !/^0/.test(value)) {
                                                                    setSelectedFood((prev) => {
                                                                        const newFoodPrice = parseFloat(value);
                                                                        const newFinalPrice = calculateFinalPrice(newFoodPrice, prev.food_disc_percentage);
                                                                        return {
                                                                            ...prev,
                                                                            food_price: newFoodPrice,
                                                                            food_final_price: newFinalPrice,
                                                                        };
                                                                    });
                                                                }
                                                            }}
                                                            onBlur={() => {
                                                                // Ensure the value is at least 1
                                                                const value = parseFloat(selectedFood.food_price);
                                                                if (isNaN(value) || value < 1) {
                                                                    setSelectedFood((prev) => {
                                                                        const newFinalPrice = calculateFinalPrice(1, prev.food_disc_percentage);
                                                                        return {
                                                                            ...prev,
                                                                            food_price: 1,
                                                                            food_final_price: newFinalPrice,
                                                                        };
                                                                    });
                                                                } else {
                                                                    setSelectedFood((prev) => {
                                                                        const newFinalPrice = calculateFinalPrice(value, prev.food_disc_percentage);
                                                                        return {
                                                                            ...prev,
                                                                            food_price: value,
                                                                            food_final_price: newFinalPrice,
                                                                        };
                                                                    });
                                                                }
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Food Discount Percentage</label>
                                                    <div className="control is-flex is-align-items-center">
                                                        {/* Decrease Button */}
                                                        <button
                                                            className="button is-blue mr-2"
                                                            onClick={() => {
                                                                if (selectedFood.food_disc_percentage > 0) {
                                                                    setSelectedFood((prev) => {
                                                                        const newDiscount = prev.food_disc_percentage - 1;
                                                                        const newFinalPrice = calculateFinalPrice(prev.food_price, newDiscount);
                                                                        return {
                                                                            ...prev,
                                                                            food_disc_percentage: newDiscount,
                                                                            food_final_price: newFinalPrice,
                                                                        };
                                                                    });
                                                                }
                                                            }}
                                                            disabled={selectedFood.food_disc_percentage <= 0}
                                                        >
                                                            -
                                                        </button>

                                                        {/* Display Current Discount Percentage */}
                                                        <span className="button is-static">
                                                            {selectedFood.food_disc_percentage}%
                                                        </span>

                                                        {/* Increase Button */}
                                                        <button
                                                            className="button is-blue ml-2"
                                                            onClick={() => {
                                                                if (selectedFood.food_disc_percentage < 100) {
                                                                    setSelectedFood((prev) => {
                                                                        const newDiscount = prev.food_disc_percentage + 1;
                                                                        const newFinalPrice = calculateFinalPrice(prev.food_price, newDiscount);
                                                                        return {
                                                                            ...prev,
                                                                            food_disc_percentage: newDiscount,
                                                                            food_final_price: newFinalPrice,
                                                                        };
                                                                    });
                                                                }
                                                            }}
                                                            disabled={selectedFood.food_disc_percentage >= 100}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Status</label>
                                                    <div className="control">
                                                        <div className="select is-fullwidth">
                                                            <select
                                                                name="food_status"
                                                                value={selectedFood.food_status}
                                                                onChange={handleDetailChange}
                                                            >
                                                                <option value="ACTIVE">ACTIVE</option>
                                                                <option value="INACTIVE">INACTIVE</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="columns">
                                            <div className="column is-12 is-left">
                                                <button className="button is-blue" onClick={handleSaveChanges}>Save Changes</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                 {/* Separator Line */}
                                    <hr />
                                    <div className="columns">
                                        <div className="column">
                                            <div className="columns">
                                                <h1 className="subtitle">
                                                    <strong>Archive Data</strong>
                                                </h1>
                                            </div>
                                            <div className="columns is-multiline is-mobile">
                                                <div className="column">
                                                    <p>To ensure data integrity and maintain a clear historical record, all food items that are no longer active shall be archived. Archiving involves securely storing all associated data, including food information and history, in a read-only format. Archiving does not delete the food item or its data but instead preserves it in its current state, safeguarding the integrity of the information while freeing up active management resources.</p>
                                                </div>
                                                <div className="column is-12 is-left">
                                                    <button className="button is-red" onClick={() => setIsArchiving(true)}>Archive</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confirmation Modal for Archiving */}
                                    {isArchiving && (
                                        <div className="modal is-active">
                                            <div className="modal-background" onClick={() => setIsArchiving(false)}></div>
                                            <div className="modal-content">
                                                <div className="box">
                                                    <p>Are you sure you want to archive this food item?</p>
                                                    <div className="buttons is-right">
                                                        <button className="button is-danger" onClick={handleArchive}>Yes</button>
                                                        <button className="button" onClick={() => setIsArchiving(false)}>No</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="modal-close is-large" aria-label="close" onClick={() => setIsArchiving(false)}></button>
                                        </div>
                                    )}
                                    {/* Separator Line */}
                                    <hr />
                                </div>
                        ) : (
                            <div>
                                <p>No food item selected. Click on a food item to view details.</p>
                            </div>
                        )}
                    </main>
                </div>

                <AddFoodModal isOpen={isModalOpen} toggleModal={toggleModal} refreshFoodList = {refreshFoodList}/>
            </div>
        </section>
    );
};

export default FoodManager;
