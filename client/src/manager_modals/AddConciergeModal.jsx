import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './modals_m.css';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';

const AddConciergeModal = ({ isOpen, toggleModal, refreshConciergeList }) => {
    const [concierge, setConcierge] = useState({
        concierge_type: '',
        concierge_description: '',
        concierge_supplier: '',
        concierge_phone_no: '',
        concierge_duration: 1,
        concierge_start_time: '',
        concierge_end_time: '',
        concierge_type_price: 0,
        concierge_status: 'ACTIVE'
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
        setConcierge({
            concierge_type: '',
            concierge_description: '',
            concierge_supplier: '',
            concierge_phone_no: '',
            concierge_duration: '',
            concierge_start_time: '',
            concierge_end_time: '',
            concierge_type_price: 0,
            concierge_status: 'ACTIVE'
        });
        setError('');
        setSuccess('');
        setErroredFields({});
        toggleModal(); // Close the modal
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConcierge({ ...concierge, [name]: value });
        setErroredFields((prev) => ({ ...prev, [name]: false })); // Remove errored field highlight
    };

    const handleSubmit = async () => {
        try {
            setError('');
            setSuccess('');
            setErroredFields({});
    
            // Validate required fields
            let hasError = false;
            const newErroredFields = {};
    
            if (!concierge.concierge_type || concierge.concierge_type.trim() === '') {
                newErroredFields.concierge_type = true;
                hasError = true;
            }
    
            if (!concierge.concierge_description || concierge.concierge_description.trim() === '') {
                newErroredFields.concierge_description = true;
                hasError = true;
            }
    
            if (!concierge.concierge_supplier || concierge.concierge_supplier.trim() === '') {
                newErroredFields.concierge_supplier = true;
                hasError = true;
            }
    
            if (!concierge.concierge_phone_no || concierge.concierge_phone_no.trim() === '') {
                newErroredFields.concierge_phone_no = true;
                hasError = true;
            }
    
            if (!concierge.concierge_duration || parseInt(concierge.concierge_duration, 10) < 1) {
                newErroredFields.concierge_duration = true;
                hasError = true;
            }
    
            if (!concierge.concierge_start_time) {
                newErroredFields.concierge_start_time = true;
                hasError = true;
            }
    
            if (!concierge.concierge_end_time) {
                newErroredFields.concierge_end_time = true;
                hasError = true;
            }
    
            if (!concierge.concierge_type_price || parseFloat(concierge.concierge_type_price) < 1) {
                newErroredFields.concierge_type_price = true;
                hasError = true;
            }
    
            if (hasError) {
                setErroredFields(newErroredFields);
                setError('Please fill in all required fields.');
                return;
            }
    
            // Proceed with API request if all validations pass
            const response = await axios.post('http://localhost:3001/api/registerConcierge', concierge);
    
            if (response.status === 201) {
                setSuccess('Concierge registered successfully!');
                setError('');
                setErroredFields({});

                refreshConciergeList();
    
                // Reset the form after a successful registration
                setTimeout(() => {
                    handleClose(); // Close the modal after success message
                }, 3000); // 3 seconds delay to display the success message
            }
        } catch (error) {
            console.error('Error registering concierge:', error.response?.data || error.message);
            setError('Failed to register concierge: ' + (error.response?.data?.error || error.message));
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
                    <p className="modal-card-title">Add New Concierge</p>
                    <button className="delete" aria-label="close" onClick={handleClose}></button>
                </header>
                <section className="modal-card-body">
                    {error && <ErrorMsg message={error} />}
                    {success && <SuccessMsg message={success} />}
                    <div className="columns is-multiline">
                        {/* First Column - Type and Description */}
                        <div className="column is-4">
                            <div className="field">
                                <label className="label">Concierge Type</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.concierge_type ? 'is-danger' : ''}`}
                                        type="text"
                                        name="concierge_type"
                                        placeholder="Enter concierge type"
                                        value={concierge.concierge_type}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.concierge_type && <p className="help is-danger">Please enter a valid concierge type.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Concierge Description</label>
                                <div className="control">
                                    <textarea
                                        className={`textarea ${erroredFields.concierge_description ? 'is-danger' : ''}`}
                                        name="concierge_description"
                                        placeholder="Enter concierge description"
                                        value={concierge.concierge_description}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                    {erroredFields.concierge_description && <p className="help is-danger">Please enter a valid description.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Second Column - Supplier and Phone Number */}
                        <div className="column is-4">
                            <div className="field">
                                <label className="label">Concierge Supplier</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.concierge_supplier ? 'is-danger' : ''}`}
                                        type="text"
                                        name="concierge_supplier"
                                        placeholder="Enter supplier name"
                                        value={concierge.concierge_supplier}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            // Allow only letters and spaces, remove everything else
                                            const cleanedValue = value.replace(/[^a-zA-Z\s]/g, '');

                                            // Update state with cleaned value
                                            setConcierge((prev) => ({
                                                ...prev,
                                                concierge_supplier: cleanedValue,
                                            }));
                                        }}
                                        required
                                    />
                                    {erroredFields.concierge_supplier && (
                                        <p className="help is-danger">Please enter a valid supplier name.</p>
                                    )}
                                </div>
                            </div>


                            <div className="field">
                                <label className="label">Supplier Phone Number</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.concierge_phone_no ? 'is-danger' : ''}`}
                                        type="text"
                                        name="concierge_phone_no"
                                        placeholder="Enter supplier contact number"
                                        value={concierge.concierge_phone_no}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            // Allow only digits (0-9), remove everything else
                                            const cleanedValue = value.replace(/[^0-9]/g, '');

                                            // Update state with cleaned value
                                            setConcierge((prev) => ({
                                                ...prev,
                                                concierge_phone_no: cleanedValue,
                                            }));
                                        }}
                                        required
                                    />
                                    {erroredFields.concierge_phone_no && (
                                        <p className="help is-danger">Please enter a valid contact number.</p>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Third Column - Time, Price, and Duration */}
                        <div className="column is-4">
                            <div className="field">
                                <label className="label">Start Time</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.concierge_start_time ? 'is-danger' : ''}`}
                                        type="time"
                                        name="concierge_start_time"
                                        value={concierge.concierge_start_time}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.concierge_start_time && <p className="help is-danger">Please enter a valid start time.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">End Time</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.concierge_end_time ? 'is-danger' : ''}`}
                                        type="time"
                                        name="concierge_end_time"
                                        value={concierge.concierge_end_time}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.concierge_end_time && <p className="help is-danger">Please enter a valid end time.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Concierge Price</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.concierge_type_price ? 'is-danger' : ''}`}
                                        type="number"
                                        name="concierge_type_price"
                                        placeholder="Enter price"
                                        value={concierge.concierge_type_price}
                                        min="1" // Set the minimum value to 1
                                        onChange={(e) => {
                                            let value = e.target.value;

                                            // Prevent negative input and input starting with '0'
                                            if (value >= 0 && !/^0/.test(value)) {
                                                setConcierge((prev) => ({
                                                    ...prev,
                                                    concierge_type_price: parseFloat(value),
                                                }));
                                            }
                                        }}
                                        onBlur={() => {
                                            // Ensure the value is at least 1
                                            const value = parseFloat(concierge.concierge_type_price);
                                            if (isNaN(value) || value < 1) {
                                                setConcierge((prev) => ({
                                                    ...prev,
                                                    concierge_type_price: 1,
                                                }));
                                            } else {
                                                setConcierge((prev) => ({
                                                    ...prev,
                                                    concierge_type_price: value,
                                                }));
                                            }
                                        }}
                                        required
                                    />
                                    {erroredFields.concierge_type_price && (
                                        <p className="help is-danger">Please enter a valid price.</p>
                                    )}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Concierge Duration</label>
                                <div className="control is-flex is-align-items-center">
                                    {/* Decrease Button */}
                                    <button
                                        className={`button is-blue mr-2 ${erroredFields.concierge_duration ? 'is-danger' : ''}`}
                                        onClick={() => {
                                            if (concierge.concierge_duration > 1) {
                                                setConcierge((prev) => ({
                                                    ...prev,
                                                    concierge_duration: prev.concierge_duration - 1,
                                                }));
                                            }
                                        }}
                                        disabled={concierge.concierge_duration <= 1}
                                    >
                                        -
                                    </button>

                                    {/* Display Current Duration */}
                                    <span className="button is-static">
                                        {concierge.concierge_duration} {concierge.concierge_duration === 1 ? 'hour' : 'hours'}
                                    </span>

                                    {/* Increase Button */}
                                    <button
                                        className={`button is-blue ml-2 ${erroredFields.concierge_duration ? 'is-danger' : ''}`}
                                        onClick={() => {
                                            if (concierge.concierge_duration < 24) {
                                                setConcierge((prev) => ({
                                                    ...prev,
                                                    concierge_duration: prev.concierge_duration + 1,
                                                }));
                                            }
                                        }}
                                        disabled={concierge.concierge_duration >= 24}
                                    >
                                        +
                                    </button>

                                    {erroredFields.concierge_duration && (
                                        <p className="help is-danger">Please enter a valid duration.</p>
                                    )}
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

export default AddConciergeModal;
