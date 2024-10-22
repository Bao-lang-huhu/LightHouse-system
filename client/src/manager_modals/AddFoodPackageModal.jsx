import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './modals_m.css';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg'; 
import SuccessMsg from '../messages/successMsg'; 

const AddFoodPackageModal = ({ isOpen, toggleModal, refreshPackagesList }) => {
    const [foodPackage, setFoodPackage] = useState({
        event_fd_pckg_name: '',
        event_fd_pckg_final_price: 0,
        event_fd_main_dish_lmt: 0,
        event_fd_pasta_lmt: 0,
        event_fd_rice_lmt: 0,
        event_fd_dessert_lmt: 0,
        event_fd_drinks_lmt: 0,
        event_fd_status: 'ACTIVE',
    });

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
        setFoodPackage({
            event_fd_pckg_name: '',
            event_fd_pckg_final_price: 0,
            event_fd_main_dish_lmt: 0,
            event_fd_pasta_lmt: 0,
            event_fd_rice_lmt: 0,
            event_fd_dessert_lmt: 0,
            event_fd_drinks_lmt: 0,
            event_fd_status: 'ACTIVE',
        });
        setError('');
        setSuccess('');
        setErroredFields({});
        toggleModal();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Implement similar behavior for price (editable, no symbols, no negatives, and starting from 1)
        if (name === 'event_fd_pckg_final_price') {
            if (/^\d*$/.test(value) && !/^0/.test(value)) { // Only allow digits, no symbols, and no leading 0s
                setFoodPackage({ ...foodPackage, [name]: parseFloat(value) || value });
            }
        } else {
            setFoodPackage({ ...foodPackage, [name]: parseFloat(value) || value });
        }

        setErroredFields((prev) => ({ ...prev, [name]: false }));
    };

    const handleSubmit = async () => {
        // Ensure package name and final price are required before allowing submission
        if (!foodPackage.event_fd_pckg_name.trim()) {
            setErroredFields((prev) => ({ ...prev, event_fd_pckg_name: true }));
            setError('Please enter a valid package name.');
            return;
        }

        if (!foodPackage.event_fd_pckg_final_price || parseFloat(foodPackage.event_fd_pckg_final_price) < 1) {
            setErroredFields((prev) => ({ ...prev, event_fd_pckg_final_price: true }));
            setError('Please enter a valid package final price.');
            return;
        }

        try {
            setError('');
            setSuccess('');
            setErroredFields({});

            const response = await axios.post('http://localhost:3001/api/registerFoodPackage', foodPackage);

            if (response.status === 201) {
                setSuccess('Food package registered successfully!');
                setError('');
                setErroredFields({});

                refreshPackagesList();

                setTimeout(() => {
                    handleClose(); // Close the modal after success message
                }, 3000);
            }
        } catch (error) {
            console.error('Error registering food package:', error.response?.data || error.message);
            setError('Failed to register food package: ' + (error.response?.data?.error || error.message));
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
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Add New Food Package</p>
                    <button className="delete" aria-label="close" onClick={handleClose}></button>
                </header>
                <section className="modal-card-body">
                    {error && <ErrorMsg message={error} />}
                    {success && <SuccessMsg message={success} />}
                    <div className="columns">
                        {/* First Column - Package Details */}
                        <div className="column is-6">
                            <div className="field">
                                <label className="label">Package Name</label>
                                    <div className="control">
                                        <input
                                            className={`input ${erroredFields.event_fd_pckg_name ? 'is-danger' : ''}`}
                                            type="text"
                                            name="event_fd_pckg_name"
                                            placeholder="Enter package name"
                                            value={foodPackage.event_fd_pckg_name}
                                            onChange={handleChange}
                                            required
                                        />
                                        {erroredFields.event_fd_pckg_name && <p className="help is-danger">Please enter a valid package name.</p>}
                                    </div>
                                </div>
                                
                                <div className="field">
                                    <label className="label">Package Final Price</label>
                                    <div className="control">
                                        <input
                                            className={`input ${erroredFields.event_fd_pckg_final_price ? 'is-danger' : ''}`}
                                            type="text" // Use text to handle better input control
                                            name="event_fd_pckg_final_price"
                                            placeholder="Enter final price"
                                            value={foodPackage.event_fd_pckg_final_price}
                                            onChange={handleChange}
                                            onBlur={() => {
                                                // Ensure the value is at least 1 when the user leaves the input field
                                                const value = parseFloat(foodPackage.event_fd_pckg_final_price);
                                                if (isNaN(value) || value < 1) {
                                                    setFoodPackage((prev) => ({
                                                        ...prev,
                                                        event_fd_pckg_final_price: 1,
                                                    }));
                                                }
                                            }}
                                            required
                                        />
                                        {erroredFields.event_fd_pckg_final_price && <p className="help is-danger">Please enter a valid final price.</p>}
                                    </div>
                                </div>

                        </div>

                        {/* Second Column - Price and Status */}
                        <div className="column is-6">
                            {/* Main Dish Limit */}
                            <div className="field">
                                <label className="label">Main Dish Limit</label>
                                <div className="control is-flex is-align-items-center">
                                    {/* Decrease Button */}
                                    <button
                                        className={`button is-blue mr-2 ${erroredFields.event_fd_main_dish_lmt ? 'is-danger' : ''}`}
                                        onClick={() => {
                                            if (foodPackage.event_fd_main_dish_lmt > 0) {
                                                setFoodPackage((prev) => ({
                                                    ...prev,
                                                    event_fd_main_dish_lmt: prev.event_fd_main_dish_lmt - 1,
                                                }));
                                            }
                                        }}
                                        disabled={foodPackage.event_fd_main_dish_lmt <= 0}
                                    >
                                        -
                                    </button>

                                    {/* Display Current Limit */}
                                    <span className="button is-static">
                                        {foodPackage.event_fd_main_dish_lmt}
                                    </span>

                                    {/* Increase Button */}
                                    <button
                                        className={`button is-blue ml-2 ${erroredFields.event_fd_main_dish_lmt ? 'is-danger' : ''}`}
                                        onClick={() => {
                                            if (foodPackage.event_fd_main_dish_lmt < 5) {
                                                setFoodPackage((prev) => ({
                                                    ...prev,
                                                    event_fd_main_dish_lmt: prev.event_fd_main_dish_lmt + 1,
                                                }));
                                            }
                                        }}
                                        disabled={foodPackage.event_fd_main_dish_lmt >= 5}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Pasta Limit */}
                            <div className="field">
                                <label className="label">Pasta Limit</label>
                                <div className="control is-flex is-align-items-center">
                                    <button
                                        className="button is-blue mr-2"
                                        onClick={() => {
                                            if (foodPackage.event_fd_pasta_lmt > 0) {
                                                setFoodPackage((prev) => ({
                                                    ...prev,
                                                    event_fd_pasta_lmt: prev.event_fd_pasta_lmt - 1,
                                                }));
                                            }
                                        }}
                                        disabled={foodPackage.event_fd_pasta_lmt <= 0}
                                    >
                                        -
                                    </button>

                                    <span className="button is-static">
                                        {foodPackage.event_fd_pasta_lmt}
                                    </span>

                                    <button
                                        className="button is-blue ml-2"
                                        onClick={() => {
                                            if (foodPackage.event_fd_pasta_lmt < 5) {
                                                setFoodPackage((prev) => ({
                                                    ...prev,
                                                    event_fd_pasta_lmt: prev.event_fd_pasta_lmt + 1,
                                                }));
                                            }
                                        }}
                                        disabled={foodPackage.event_fd_pasta_lmt >= 5}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Rice Limit */}
                            <div className="field">
                                <label className="label">Rice Limit</label>
                                <div className="control is-flex is-align-items-center">
                                    <button
                                        className="button is-blue mr-2"
                                        onClick={() => {
                                            if (foodPackage.event_fd_rice_lmt > 0) {
                                                setFoodPackage((prev) => ({
                                                    ...prev,
                                                    event_fd_rice_lmt: prev.event_fd_rice_lmt - 1,
                                                }));
                                            }
                                        }}
                                        disabled={foodPackage.event_fd_rice_lmt <= 0}
                                    >
                                        -
                                    </button>

                                    <span className="button is-static">
                                        {foodPackage.event_fd_rice_lmt}
                                    </span>

                                    <button
                                        className="button is-blue ml-2"
                                        onClick={() => {
                                            if (foodPackage.event_fd_rice_lmt < 5) {
                                                setFoodPackage((prev) => ({
                                                    ...prev,
                                                    event_fd_rice_lmt: prev.event_fd_rice_lmt + 1,
                                                }));
                                            }
                                        }}
                                        disabled={foodPackage.event_fd_rice_lmt >= 5}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Dessert Limit */}
                            <div className="field">
                                <label className="label">Dessert Limit</label>
                                <div className="control is-flex is-align-items-center">
                                    <button
                                        className="button is-blue mr-2"
                                        onClick={() => {
                                            if (foodPackage.event_fd_dessert_lmt > 0) {
                                                setFoodPackage((prev) => ({
                                                    ...prev,
                                                    event_fd_dessert_lmt: prev.event_fd_dessert_lmt - 1,
                                                }));
                                            }
                                        }}
                                        disabled={foodPackage.event_fd_dessert_lmt <= 0}
                                    >
                                        -
                                    </button>

                                    <span className="button is-static">
                                        {foodPackage.event_fd_dessert_lmt}
                                    </span>

                                    <button
                                        className="button is-blue ml-2"
                                        onClick={() => {
                                            if (foodPackage.event_fd_dessert_lmt < 5) {
                                                setFoodPackage((prev) => ({
                                                    ...prev,
                                                    event_fd_dessert_lmt: prev.event_fd_dessert_lmt + 1,
                                                }));
                                            }
                                        }}
                                        disabled={foodPackage.event_fd_dessert_lmt >= 5}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Drink Limit */}
                            <div className="field">
                                <label className="label">Drink Limit</label>
                                <div className="control is-flex is-align-items-center">
                                    <button
                                        className="button is-blue mr-2"
                                        onClick={() => {
                                            if (foodPackage.event_fd_drinks_lmt > 0) {
                                                setFoodPackage((prev) => ({
                                                    ...prev,
                                                    event_fd_drinks_lmt: prev.event_fd_drinks_lmt - 1,
                                                }));
                                            }
                                        }}
                                        disabled={foodPackage.event_fd_drinks_lmt <= 0}
                                    >
                                        -
                                    </button>

                                    <span className="button is-static">
                                        {foodPackage.event_fd_drinks_lmt}
                                    </span>

                                    <button
                                        className="button is-blue ml-2"
                                        onClick={() => {
                                            if (foodPackage.event_fd_drinks_lmt < 5) {
                                                setFoodPackage((prev) => ({
                                                    ...prev,
                                                    event_fd_drinks_lmt: prev.event_fd_drinks_lmt + 1,
                                                }));
                                            }
                                        }}
                                        disabled={foodPackage.event_fd_drinks_lmt >= 5}
                                    >
                                        +
                                    </button>
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

export default AddFoodPackageModal;
