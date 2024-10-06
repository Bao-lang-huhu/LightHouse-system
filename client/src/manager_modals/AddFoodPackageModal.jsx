import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './modals_m.css';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg'; 
import SuccessMsg from '../messages/successMsg'; 

const AddFoodPackageModal = ({ isOpen, toggleModal }) => {
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

    // Reset form and messages when modal opens
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
        setFoodPackage({ ...foodPackage, [name]: parseFloat(value) || value });
        setErroredFields((prev) => ({ ...prev, [name]: false }));
    };

    const handleSubmit = async () => {
        try {
            setError('');
            setSuccess('');
            setErroredFields({});

            const response = await axios.post('https://light-house-system-h74t-server.vercel.app/api/registerFoodPackage', foodPackage);

            if (response.status === 201) {
                setSuccess('Food package registered successfully!');
                setError('');
                setErroredFields({});

                setTimeout(() => {
                    handleClose(); // Close the modal after success message
                }, 3000); // 3 seconds delay to display the success message
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
            <div className="modal-card custom-modal-card">
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
                                <label className="label">Main Dish Limit</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.event_fd_main_dish_lmt ? 'is-danger' : ''}`}
                                        type="number"
                                        name="event_fd_main_dish_lmt"
                                        placeholder="Enter main dish limit"
                                        value={foodPackage.event_fd_main_dish_lmt}
                                        onChange={handleChange}
                                    />
                                    {erroredFields.event_fd_main_dish_lmt && <p className="help is-danger">Please enter a valid limit.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Pasta Limit</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.event_fd_pasta_lmt ? 'is-danger' : ''}`}
                                        type="number"
                                        name="event_fd_pasta_lmt"
                                        placeholder="Enter pasta limit"
                                        value={foodPackage.event_fd_pasta_lmt}
                                        onChange={handleChange}
                                    />
                                    {erroredFields.event_fd_pasta_lmt && <p className="help is-danger">Please enter a valid limit.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Rice Limit</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.event_fd_rice_lmt ? 'is-danger' : ''}`}
                                        type="number"
                                        name="event_fd_rice_lmt"
                                        placeholder="Enter rice limit"
                                        value={foodPackage.event_fd_rice_lmt}
                                        onChange={handleChange}
                                    />
                                    {erroredFields.event_fd_rice_lmt && <p className="help is-danger">Please enter a valid limit.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Second Column - Price and Status */}
                        <div className="column is-6">
                            <div className="field">
                                <label className="label">Dessert Limit</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.event_fd_dessert_lmt ? 'is-danger' : ''}`}
                                        type="number"
                                        name="event_fd_dessert_lmt"
                                        placeholder="Enter dessert limit"
                                        value={foodPackage.event_fd_dessert_lmt}
                                        onChange={handleChange}
                                    />
                                    {erroredFields.event_fd_dessert_lmt && <p className="help is-danger">Please enter a valid limit.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Drink Limit</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.event_fd_drinks_lmt ? 'is-danger' : ''}`}
                                        type="number"
                                        name="event_fd_drinks_lmt"
                                        placeholder="Enter drink limit"
                                        value={foodPackage.event_fd_drinks_lmt}
                                        onChange={handleChange}
                                    />
                                    {erroredFields.event_fd_drinks_lmt && <p className="help is-danger">Please enter a valid limit.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Package Final Price</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.event_fd_pckg_final_price ? 'is-danger' : ''}`}
                                        type="number"
                                        name="event_fd_pckg_final_price"
                                        placeholder="Enter final price"
                                        value={foodPackage.event_fd_pckg_final_price}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.event_fd_pckg_final_price && <p className="help is-danger">Please enter a valid final price.</p>}
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
