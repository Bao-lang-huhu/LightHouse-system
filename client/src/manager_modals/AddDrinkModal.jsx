import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './modals_m.css';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg'; 
import SuccessMsg from '../messages/successMsg'; 

const AddDrinkModal = ({ isOpen, toggleModal }) => {
    const [drink, setDrink] = useState({
        bar_category_name: '',
        drink_name: '',
        drink_price: 0,
        drink_status: 'ACTIVE',
        drink_description: '',
        drink_photo: '',
        drink_final_price: 0,
        drink_disc_percentage: 0
    });

    const [drinkPhoto, setDrinkPhoto] = useState(null);
    const [error, setError] = useState(''); 
    const [success, setSuccess] = useState(''); 
    const [erroredFields, setErroredFields] = useState({}); 

    useEffect(() => {
        const calculatedFinalPrice = drink.drink_price * (1 - drink.drink_disc_percentage / 100);
        setDrink((prevDrink) => ({ ...prevDrink, drink_final_price: calculatedFinalPrice }));
    }, [drink.drink_price, drink.drink_disc_percentage]);

    useEffect(() => {
        if (isOpen) {
            setError('');
            setSuccess('');
            setErroredFields({});
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDrink({ ...drink, [name]: parseFloat(value) || value });
        setErroredFields((prev) => ({ ...prev, [name]: false }));
    };

    // Handle photo change
    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDrinkPhoto(reader.result);
                setDrink({ ...drink, drink_photo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        try {
            setError('');
            setSuccess('');
            setErroredFields({});
            const response = await axios.post('https://light-house-system.vercel.app/api/registerDrink', drink);

            if (response.status === 201) {
                setSuccess('Drink registered successfully!'); 
                setError(''); 
                setErroredFields({});

                setTimeout(() => {
                    handleClose(); 
                }, 3000); 
            }
        } catch (error) {
            console.error('Error registering drink:', error.response?.data || error.message);
            setError('Failed to register drink: ' + (error.response?.data?.error || error.message)); 
            setSuccess(''); 

            if (error.response?.data?.erroredFields) {
                const fields = error.response.data.erroredFields.reduce((acc, field) => {
                    acc[field] = true;
                    return acc;
                }, {});
                setErroredFields(fields); 
            }
        }
    };

    const handleClose = () => {
        setDrink({
            bar_category_name: '',
            drink_name: '',
            drink_price: 0,
            drink_status: 'ACTIVE',
            drink_description: '',
            drink_photo: '',
            drink_final_price: 0,
            drink_disc_percentage: 0
        });
        setDrinkPhoto(null);
        setError('');
        setSuccess('');
        setErroredFields({});
        toggleModal(); 
    };

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={handleClose}></div> {/* Close modal on background click */}
            <div className="modal-card custom-modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Add New Drink</p>
                    <button className="delete" aria-label="close" onClick={handleClose}></button> {/* Close modal */}
                </header>
                <section className="modal-card-body">                
                    {error && <ErrorMsg message={error} />}
                    {success && <SuccessMsg message={success} />}
                    <div className='column'></div>
                    <div className="columns">
                        {/* First Column - General Information */}
                        <div className="column is-4">
                            <div className="field">
                                <label className="label">Bar Category</label>
                                <div className="control">
                                    <div className={`select is-fullwidth ${erroredFields.bar_category_name ? 'is-danger' : ''}`}>
                                        <select
                                            name="bar_category_name"
                                            value={drink.bar_category_name}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            <option value="WHISKEY">Whiskey</option>
                                            <option value="WINE">Wine</option>
                                            <option value="BEER">Beer</option>
                                            <option value="COCKTAIL">Cocktail</option>
                                            <option value="NON-ALCOHOLIC">Non-Alcoholic</option>
                                        </select>
                                    </div>
                                    {erroredFields.bar_category_name && <p className="help is-danger">Please select a valid category.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Drink Name</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.drink_name ? 'is-danger' : ''}`} 
                                        type="text"
                                        name="drink_name"
                                        placeholder="Enter drink name"
                                        value={drink.drink_name}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.drink_name && <p className="help is-danger">Please enter a valid drink name.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Drink Status</label>
                                <div className="control">
                                    <div className={`select is-fullwidth ${erroredFields.drink_status ? 'is-danger' : ''}`}>
                                        <select
                                            name="drink_status"
                                            value={drink.drink_status}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                        </select>
                                    </div>
                                    {erroredFields.drink_status && <p className="help is-danger">Please select a valid status.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Second Column - Photo and Description */}
                        <div className="column is-4">
                            <div className="field">
                                <label className="label">Drink Description</label>
                                <div className="control">
                                    <textarea
                                        className={`textarea ${erroredFields.drink_description ? 'is-danger' : ''}`}
                                        name="drink_description"
                                        placeholder="Enter drink description"
                                        value={drink.drink_description}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                    {erroredFields.drink_description && <p className="help is-danger">Please enter a valid description.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Drink Photo</label>
                                <p>Only 3 MB photos in file types JPEG, JPG, and PNG</p>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.drink_photo ? 'is-danger' : ''}`} 
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                    />
                                    {drinkPhoto && (
                                        <figure className="image is-128x128 mt-2">
                                            <img
                                                src={drinkPhoto}
                                                alt="Drink Preview"
                                                style={{
                                                    width: "128px",
                                                    height: "128px",
                                                    borderRadius: "50%"
                                                }}
                                            />
                                        </figure>
                                    )}
                                    {erroredFields.drink_photo && <p className="help is-danger">Please select a valid photo.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Third Column - Pricing Information */}
                        <div className="column is-4">
                            <div className="field">
                                <label className="label">Drink Price</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.drink_price ? 'is-danger' : ''}`}
                                        type="number"
                                        name="drink_price"
                                        placeholder="Enter drink price"
                                        value={drink.drink_price}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.drink_price && <p className="help is-danger">Please enter a valid price.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Discount Percentage</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.drink_disc_percentage ? 'is-danger' : ''}`}
                                        type="number"
                                        name="drink_disc_percentage"
                                        placeholder="Enter discount percentage"
                                        value={drink.drink_disc_percentage}
                                        onChange={handleChange}
                                    />
                                    {erroredFields.drink_disc_percentage && <p className="help is-danger">Please enter a valid discount percentage.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Final Price</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.drink_final_price ? 'is-danger' : ''}`}
                                        type="number"
                                        name="drink_final_price"
                                        placeholder="Enter final price"
                                        value={drink.drink_final_price.toFixed(2)} // Display final price with 2 decimal places
                                        readOnly // Make the field read-only as it is auto-calculated
                                    />
                                    {erroredFields.drink_final_price && <p className="help is-danger">Please enter a valid final price.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="modal-card-foot is-flex is-justify-content-flex-end is-align-items-center">
                    <button className="button is-blue mr-2" onClick={handleSubmit}>Save</button>
                    <button className="button is-red" onClick={handleClose}>Cancel</button> {/* Ensure modal is closed properly */}
                </footer>
            </div>
        </div>
    );
};

export default AddDrinkModal;
