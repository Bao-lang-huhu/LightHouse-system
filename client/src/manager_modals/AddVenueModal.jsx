import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './modals_m.css';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg'; 
import SuccessMsg from '../messages/successMsg'; 

const AddVenueModal = ({ isOpen, toggleModal }) => {
    const [venue, setVenue] = useState({
        venue_name: '',
        venue_description: '',
        venue_status: 'ACTIVE',
        venue_price: 0,
        venue_final_price: 0,
        event_disc_percentage: 0,
        venue_max_pax: 0
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [erroredFields, setErroredFields] = useState({});

    // Automatically calculate final price based on price and discount percentage
    useEffect(() => {
        const calculatedFinalPrice = venue.venue_price * (1 - venue.event_disc_percentage / 100);
        setVenue((prevVenue) => ({ ...prevVenue, venue_final_price: calculatedFinalPrice.toFixed(2) }));
    }, [venue.venue_price, venue.event_disc_percentage]);

    useEffect(() => {
        if (isOpen) {
            setError('');
            setSuccess('');
            setErroredFields({});
        }
    }, [isOpen]);

    const handleClose = () => {
        setVenue({
            venue_name: '',
            venue_description: '',
            venue_status: 'ACTIVE',
            venue_price: 0,
            venue_final_price: 0,
            event_disc_percentage: 0,
            venue_max_pax: 0
        });
        setError('');
        setSuccess('');
        setErroredFields({});
        toggleModal(); // Close the modal
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVenue({ ...venue, [name]: parseFloat(value) || value });
        setErroredFields((prev) => ({ ...prev, [name]: false }));
    };

    const handleSubmit = async () => {
        try {
            setError('');
            setSuccess('');
            setErroredFields({});

            const response = await axios.post('https://light-house-system-h74t-server.vercel.app/api/registerVenue', venue);
            if (response.status === 201) {
                setSuccess('Venue registered successfully!'); 
                setError(''); 
                setErroredFields({});

                setTimeout(() => {
                    handleClose(); // Close the modal after success message
                }, 3000); // 3 seconds delay to display the success message
            }
        } catch (error) {
            console.error('Error registering venue:', error.response?.data || error.message);
            setError('Failed to register venue: ' + (error.response?.data?.error || error.message)); 
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
                    <p className="modal-card-title">Add New Venue</p>
                    <button className="delete" aria-label="close" onClick={handleClose}></button>
                </header>
                <section className="modal-card-body">
                    {error && <ErrorMsg message={error} />}
                    {success && <SuccessMsg message={success} />}
                    <div className="columns">
                        {/* First Column */}
                        <div className="column is-6">
                            <div className="field">
                                <label className="label">Venue Name</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.venue_name ? 'is-danger' : ''}`} 
                                        type="text"
                                        name="venue_name"
                                        placeholder="Enter venue name"
                                        value={venue.venue_name}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.venue_name && <p className="help is-danger">Please enter a valid venue name.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Venue Description</label>
                                <div className="control">
                                    <textarea
                                        className={`textarea ${erroredFields.venue_description ? 'is-danger' : ''}`}
                                        name="venue_description"
                                        placeholder="Enter venue description"
                                        value={venue.venue_description}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                    {erroredFields.venue_description && <p className="help is-danger">Please enter a valid venue description.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Maximum PAX</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.venue_max_pax ? 'is-danger' : ''}`}
                                        type="number"
                                        name="venue_max_pax"
                                        min="1"
                                        placeholder="Enter maximum PAX"
                                        value={venue.venue_max_pax}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.venue_max_pax && <p className="help is-danger">Please enter a valid maximum PAX.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Second Column */}
                        <div className="column is-6">
                            <div className="field">
                                <label className="label">Venue Price</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.venue_price ? 'is-danger' : ''}`}
                                        type="number"
                                        name="venue_price"
                                        placeholder="Enter venue price"
                                        value={venue.venue_price}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.venue_price && <p className="help is-danger">Please enter a valid venue price.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Discount Percentage</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.event_disc_percentage ? 'is-danger' : ''}`}
                                        type="number"
                                        name="event_disc_percentage"
                                        placeholder="Enter discount percentage"
                                        value={venue.event_disc_percentage}
                                        onChange={handleChange}
                                    />
                                    {erroredFields.event_disc_percentage && <p className="help is-danger">Please enter a valid discount percentage.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Final Price</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.venue_final_price ? 'is-danger' : ''}`}
                                        type="number"
                                        name="venue_final_price"
                                        placeholder="Final price"
                                        value={venue.venue_final_price}
                                        readOnly
                                    />
                                    {erroredFields.venue_final_price && <p className="help is-danger">Please enter a valid final price.</p>}
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

export default AddVenueModal;
