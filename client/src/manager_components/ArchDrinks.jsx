import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_m.css';
import { IoSearchCircle, IoWine } from 'react-icons/io5';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg'; // Import Error Message Component
import SuccessMsg from '../messages/successMsg'; // Import Success Message Component

const ArchDrinks = () => {
    const [drinks, setDrinks] = useState([]); 
    const [selectedDrink, setSelectedDrink] = useState(null); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [drinkPhoto, setDrinkPhoto] = useState(null);
    const [drinkPhotoPreview, setDrinkPhotoPreview] = useState(null); 
    const [error, setError] = useState(''); 
    const [success, setSuccess] = useState(''); 
    const [isArchiving, setIsArchiving] = useState(false);

        const fetchDrinks = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/getDrinks');
                setDrinks(response.data.filter(drink => drink.drink_status === 'DELETE'));
            } catch (error) {
                console.error('Error fetching drink data:', error);
            }
        };
    
        useEffect(() => {
            fetchDrinks();
        }, []);


    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'green';
            case 'INACTIVE':
                return 'red';
            default:
                return 'gray';
        }
    };

    const handleDrinkClick = (drink) => {
        setDrinkPhoto(null);
        setDrinkPhotoPreview(null);
        setSelectedDrink({ ...drink });
        setError(''); 
        setSuccess(''); 
    };

      // Function to calculate the final price based on price and discount percentage
      const calculateFinalPrice = (price, discount) => {
        const discountAmount = price * (discount / 100);
        return price - discountAmount;
    };

        // Handle input change in the detail view
     const handleDetailChange = (e) => {
            const { name, value } = e.target;
            setSelectedDrink((prev) => {
                const updatedDrink = { ...prev, [name]: value };
    
                // Update the final price whenever price or discount percentage changes
                if (name === 'drink_price' || name === 'drink_disc_percentage') {
                    updatedDrink.drink_final_price = calculateFinalPrice(
                        parseFloat(updatedDrink.drink_price) || 0,
                        parseFloat(updatedDrink.drink_disc_percentage) || 0
                    );
                }
    
                return updatedDrink;
            });
        };

    const handleArchive = async () => {
        setIsArchiving(false);

        try {
            setError(''); 
            setSuccess(''); 

            const response = await axios.put(
                `http://localhost:3001/api/updateDrink/${selectedDrink.drink_id}`,
                { drink_status: 'ACTIVE' } 
            );

            if (response.status === 200) {
                setSuccess('Drink restored successfully!');
                setError(''); 

                setDrinks(prevDrinks => prevDrinks.filter(drink => drink.drink_id !== selectedDrink.drink_id));
                setSelectedDrink(null);

                setTimeout(() => {
                    setSuccess(''); 
                }, 3000);
            }
        } catch (error) {
            console.error('Error archiving drink:', error.response?.data || error.message);
            setError('Failed to archive drink: ' + (error.response?.data?.error || error.message));
            setSuccess(''); 
        }
    };

    const filteredDrinks = drinks.filter(drink =>
        drink && drink.drink_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        drink.drink_status === 'DELETE'
    );


    return (
        <section className='section-p1'>
            <div className="columns" style={{ minHeight: "100vh" }}>
                <div className="column is-3">
                    <div className="column">
                        <div className='columns is-vcentered tablet-column-layout'>
                            <div className='column'>
                                <h1 className='subtitle'>
                                    <strong>Drinks</strong>
                                </h1>
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
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                            <div className="control is-fullwidth">
                                <button className="button is-blue is-fullwidth-mobile" style={{ height: '100%' }}>
                                    <IoSearchCircle className="is-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: "5px" }}>
                        {filteredDrinks.map((drink) => (
                            drink && (
                                <div
                                    key={drink.drink_id}
                                    className={`staff-space ${selectedDrink && selectedDrink.drink_id === drink.drink_id ? 'is-active' : ''}`}
                                    onClick={() => handleDrinkClick(drink)} 
                                    style={{
                                        cursor: 'pointer',
                                        padding: '1rem',
                                        backgroundColor: selectedDrink && selectedDrink.drink_id === drink.drink_id ? '#e8f4ff' : 'transparent'
                                    }}
                                >
                                    <div className="columns is-vcentered is-mobile" style={{ paddingLeft: "5px" }}>
                                        <IoWine style={{ marginRight: '5px', textAlign: 'center' }} />
                                        <div className="column is-flex is-align-items-center">
                                            <h3 style={{ marginRight: "8px" }}>
                                                {drink.drink_name}
                                            </h3>
                                            <div
                                                className="status-circle"
                                                style={{
                                                    backgroundColor: getStatusColor(drink.drink_status), 
                                                    borderRadius: '50%',
                                                    width: '10px',
                                                    height: '10px'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                <div className="column" style={{ backgroundColor: "white" }}>
                    <main className="section-p1">
                        <div className="columns">
                            <h1 className="subtitle">
                                <strong>Drink Details</strong>
                            </h1>
                        </div>

                        {error && <ErrorMsg message={error} />} 
                        {success && <SuccessMsg message={success} />} 

                        {selectedDrink ? (
                            <div className="section-m1">
                                <div className="columns is-vcentered">
                                    <div className="column is-one-half">
                                        <div className="staff-space">
                                            <div className="field">
                                                <label className="label">Drink Name</label>
                                                <div className="control">
                                                    <input
                                                        className="input"
                                                        type="text"
                                                        name="drink_name"
                                                        readOnly
                                                        value={selectedDrink.drink_name}
                                                        onChange={handleDetailChange}
                                                    />
                                                </div>
                                            </div>
                
                                            <div className="field">
                                            <label className="label">Drink Category</label>
                                            <div className="control">
                                            <input
                                                className="input"
                                                type="text"
                                                name="bar_category_name"
                                                value={selectedDrink.bar_category_name}
                                                onChange={handleDetailChange}
                                                readOnly
                                             />
                                               

                                            </div>
                                        </div>
                                        </div>
                                    </div>

                                    <div className="column is-one-half">
                                        <div className="staff-space">
                                        {drinkPhotoPreview ? (
                                                <img
                                                    src={drinkPhotoPreview}
                                                    alt={selectedDrink.drink_name}
                                                    style={{ width: '150px', height: '150px', borderRadius: '8px' }}
                                                />
                                            ) : selectedDrink.drink_photo && (
                                                <img
                                                    src={selectedDrink.drink_photo}
                                                    alt={selectedDrink.drink_name}
                                                    style={{ width: '150px', height: '150px', borderRadius: '8px' }}
                                                />
                                            )}
                                           
                                            <div className='field'>
                                                <label className="label">Drink Photo</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                <div className="columns">
                                    <div className="column">
                                        <div className="columns">
                                            <h1 className="subtitle">
                                                <strong>Drink Information</strong>
                                            </h1>
                                        </div>
                                        <div className="columns is-multiline">
                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Drink Description</label>
                                                    <div className="control">
                                                        <textarea
                                                            className="textarea"
                                                            name="drink_description"
                                                            value={selectedDrink.drink_description}
                                                            onChange={handleDetailChange}
                                                            readOnly
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Drink Final Price</label>
                                                    <div className="control">
                                                        <input
                                                            className="input"
                                                            type="number"
                                                            name="drink_final_price"
                                                            readOnly
                                                            value={selectedDrink.drink_final_price}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Drink Price</label>
                                                    <div className="control">
                                                        <input
                                                            className={`input`}
                                                            type="number"
                                                            name="drink_price"
                                                            value={selectedDrink.drink_price}
                                                            min="1" // Set the minimum value to 1
                                                            readOnly
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Drink Discount Percentage</label>
                                                    <div className="control is-flex is-align-items-center">
                                                        {/* Decrease Button */}
                                                        <button
                                                            className="button is-blue mr-2"
                                                            
                                                            disabled={selectedDrink.drink_disc_percentage}
                                                        >
                                                            -
                                                        </button>

                                                        {/* Display Current Discount Percentage */}
                                                        <span className="button is-static">
                                                            {selectedDrink.drink_disc_percentage}%
                                                        </span>

                                                        {/* Increase Button */}
                                                        <button
                                                            className="button is-blue ml-2"
                                                            
                                                            disabled={selectedDrink.drink_disc_percentage}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="columns">
                                    <div className="column">
                                        <div className="columns">
                                            <h1 className="subtitle">
                                                <strong>Restore Data</strong>
                                            </h1>
                                        </div>
                                        <div className="columns is-multiline is-mobile">
                                            <div className="column">
                                                <p>To ensure data integrity and maintain a clear historical record, all drink data that is no longer active shall be archived. Archiving involves securely storing all associated data, including drink information and history, in a read-only format. Archiving does not delete the drink or its data but instead preserves it in its current state, safeguarding the integrity of the information while freeing up active drink management resources.</p>
                                            </div>
                                            <div className="column is-12 is-left">
                                                <button className="button is-blue" onClick={() => setIsArchiving(true)}>Restore</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isArchiving && (
                                    <div className="modal is-active">
                                        <div className="modal-background" onClick={() => setIsArchiving(false)}></div>
                                        <div className="modal-content">
                                            <div className="box">
                                                <p>Are you sure you want to restore this drink?</p>
                                                <div className="buttons is-right">
                                                    <button className="button is-blue" onClick={handleArchive}>Yes</button>
                                                    <button className="button" onClick={() => setIsArchiving(false)}>No</button>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="modal-close is-large" aria-label="close" onClick={() => setIsArchiving(false)}></button>
                                    </div>
                                )}
                                <hr />
                            </div>
                        ) : (
                            <div>
                                <p>No drink selected. Click on a drink to view details.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </section>
    );
};

export default ArchDrinks;