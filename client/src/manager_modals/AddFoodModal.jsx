import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './modals_m.css';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';

const AddFoodModal = ({ isOpen, toggleModal }) => {
    const [food, setFood] = useState({
        food_category_name: '',
        food_name: '',
        food_price: 0,
        food_status: 'ACTIVE',
        food_description: '',
        food_photo: '', // Base64 photo will be stored here
        food_final_price: 0,
        food_disc_percentage: 0,
        food_service_category: ''
    });

    const [foodPhoto, setFoodPhoto] = useState(null); // For image preview
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [erroredFields, setErroredFields] = useState({});

    useEffect(() => {
        if (isOpen) {
            setError('');
            setSuccess('');
            setErroredFields({});
        }
    }, [isOpen]);

    const handleClose = () => {
        setFood({
            food_category_name: '',
            food_name: '',
            food_price: 0,
            food_status: 'ACTIVE',
            food_description: '',
            food_photo: '',
            food_final_price: 0,
            food_disc_percentage: 0,
            food_service_category: ''
        });
        setFoodPhoto(null);
        setError('');
        setSuccess('');
        setErroredFields({});
        toggleModal(); // Close the modal
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFood({ ...food, [name]: value });

        setErroredFields((prev) => ({ ...prev, [name]: false }));

        if (name === 'food_price' || name === 'food_disc_percentage') {
            const price = name === 'food_price' ? parseFloat(value) : food.food_price;
            const discount = name === 'food_disc_percentage' ? parseFloat(value) : food.food_disc_percentage;
            const finalPrice = price - (price * (discount / 100));
            setFood({ ...food, [name]: value, food_final_price: finalPrice.toFixed(2) });
        }
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
    
        if (file) {
            // Check file type
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                setError('Please upload a valid image file (PNG, JPEG, JPG).');
                return;
            }
    
            // Check file size (max 3 MB)
            const maxSize = 3 * 1024 * 1024; // 3 MB in bytes
            if (file.size > maxSize) {
                setError('File size should not exceed 5 MB.');
                return;
            }
    
            // If valid, read the file as a base64 string
            const reader = new FileReader();
            reader.onloadend = () => {
                setFoodPhoto(reader.result);
                setFood({ ...food, food_photo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };
    

    const handleSubmit = async () => {
        try {
            setError('');
            setSuccess('');
            setErroredFields({});

            if (!food.food_photo) {
                setError('Please upload a food photo.');
                return;
            }

            const response = await axios.post('https://light-house-system.vercel.app/api/registerFoodItem', food);

            if (response.status === 201) {
                setSuccess('Food item registered successfully!');
                setError('');
                setErroredFields({});

                setTimeout(() => {
                    handleClose(); // Close the modal after success message
                }, 3000);
            }
        } catch (error) {
            console.error('Error registering food item:', error.response?.data || error.message);

            setError('Failed to register food item: ' + (error.response?.data?.error || error.message));
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

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={handleClose}></div>
            <div className="modal-card custom-modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Add New Food</p>
                    <button className="delete" aria-label="close" onClick={handleClose}></button>
                </header>
                <section className="modal-card-body">
                    {error && <ErrorMsg message={error} />}
                    {success && <SuccessMsg message={success} />}
                    <div className="columns">
                        {/* First Column: Food Basic Info */}
                        <div className="column is-4">
                            <div className="field">
                                <label className="label">Food Name</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.food_name ? 'is-danger' : ''}`}
                                        type="text"
                                        name="food_name"
                                        placeholder="Enter food name"
                                        value={food.food_name}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.food_name && <p className="help is-danger">Please enter a valid food name.</p>}
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Food Category</label>
                                <div className="control">
                                    <div className={`select is-fullwidth ${erroredFields.food_category_name ? 'is-danger' : ''}`}>
                                        <select
                                            name="food_category_name"
                                            value={food.food_category_name}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Food Category</option>
                                            <option value="CHICKEN">Chicken</option>
                                            <option value="BEEF">Beef</option>
                                            <option value="BURGER">Burger</option>
                                            <option value="SALAD">Salad</option>
                                            <option value="PASTA">Pasta</option>
                                            <option value="PORK">Pork</option>
                                            <option value="BREAKFAST">Breakfast</option>
                                            <option value="MEAL">Meal</option>
                                        </select>
                                    </div>
                                    {erroredFields.food_category_name && <p className="help is-danger">Please select a valid food category.</p>}
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Service Category</label>
                                <div className="control">
                                    <div className={`select is-fullwidth ${erroredFields.food_service_category ? 'is-danger' : ''}`}>
                                        <select
                                            name="food_service_category"
                                            value={food.food_service_category}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Service Category</option>
                                            <option value="EVENT">Event</option>
                                            <option value="RESTAURANT">Restaurant</option>
                                            <option value="BOTH">Both</option>
                                        </select>
                                    </div>
                                    {erroredFields.food_service_category && <p className="help is-danger">Please select a valid service category.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Second Column: Photo and Description */}
                        <div className="column is-4">
                            {foodPhoto && (
                                <div className="field">
                                    <figure className="image is-128x128">
                                        <img
                                            src={foodPhoto}
                                            alt="Food Preview"
                                            style={{
                                                width: "128px",
                                                height: "128px",
                                                borderRadius: "8px"
                                            }}
                                        />
                                    </figure>
                                </div>
                            )}
                            <div className="field">
                                <label className="label">Food Photo</label>
                                <p>Only 3 MB photos in file types JPEG, JPG, and PNG</p>
                                <div className="control">
                                    <input
                                        className="input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                    />
                                </div>
                            </div>
                            
                            <div className="field">
                                <label className="label">Food Description</label>
                                <div className="control">
                                    <textarea
                                        className={`textarea ${erroredFields.food_description ? 'is-danger' : ''}`}
                                        name="food_description"
                                        placeholder="Enter food description"
                                        value={food.food_description}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                    {erroredFields.food_description && <p className="help is-danger">Please enter a valid food description.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Third Column: Pricing Information */}
                        <div className="column is-4">
                            <div className="field">
                                <label className="label">Food Price</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.food_price ? 'is-danger' : ''}`}
                                        type="number"
                                        name="food_price"
                                        placeholder="Enter food price"
                                        value={food.food_price}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.food_price && <p className="help is-danger">Please enter a valid food price.</p>}
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Discount Percentage</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.food_disc_percentage ? 'is-danger' : ''}`}
                                        type="number"
                                        name="food_disc_percentage"
                                        placeholder="Enter discount percentage"
                                        value={food.food_disc_percentage}
                                        onChange={handleChange}
                                    />
                                    {erroredFields.food_disc_percentage && <p className="help is-danger">Please enter a valid discount percentage.</p>}
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Final Price</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.food_final_price ? 'is-danger' : ''}`}
                                        type="number"
                                        name="food_final_price"
                                        placeholder="Enter final price"
                                        value={food.food_final_price}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.food_final_price && <p className="help is-danger">Please enter a valid final price.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="modal-card-foot is-flex is-justify-content-flex-end is-align-items-center">
                    <button className="button is-blue mr-2" onClick={handleSubmit}>Save</button>
                    <button className="button is-red" onClick={handleClose}>Cancel</button>
                </footer>
            </div>
        </div>
    );
};

export default AddFoodModal;
