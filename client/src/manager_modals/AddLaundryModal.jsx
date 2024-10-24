import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import axios from 'axios';
import './modals_m.css';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';

const AddLaundryModal = ({ isOpen, toggleModal, refreshLaundryList }) => {
    const [laundry, setLaundry] = useState({
        laundry_item: '',
        laundry_ironing_price: '',
        laundry_status: 'ACTIVE',
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
        setLaundry({
            laundry_item: '',
            laundry_ironing_price: '',
            laundry_status: 'ACTIVE',
        });
        setError('');
        setSuccess('');
        setErroredFields({});
        toggleModal(); // Close the modal
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // For the ironing price, apply custom validation to allow only numbers
        if (name === 'laundry_ironing_price') {
            if (/^\d*$/.test(value) && !/^0/.test(value)) { // Allow only digits, no leading zeros
                setLaundry({ ...laundry, [name]: value });
            }
        } else {
            setLaundry({ ...laundry, [name]: value });
        }

        // Remove the errored field once the user starts typing again
        setErroredFields((prev) => ({ ...prev, [name]: false }));
    };

    const handleSubmit = async () => {
        try {
            setError('');
            setSuccess('');
            setErroredFields({});

            // Validate all required fields before submission
            const newErroredFields = {};
            if (!laundry.laundry_item.trim()) {
                newErroredFields.laundry_item = true;
            }
            if (!laundry.laundry_ironing_price || parseInt(laundry.laundry_ironing_price, 10) < 1) {
                newErroredFields.laundry_ironing_price = true;
            }

            // If there are validation errors, show them and stop submission
            if (Object.keys(newErroredFields).length > 0) {
                setErroredFields(newErroredFields);
                return;
            }

            const response = await axios.post('http://localhost:3001/api/registerLaundry', laundry);

            if (response.status === 201) {
                setSuccess('Laundry item registered successfully!');
                setError('');
                setErroredFields({});

                refreshLaundryList();

                setTimeout(() => {
                    handleClose(); // Close the modal after success message
                }, 3000); // 3 seconds delay to display the success message
            }
        } catch (error) {
            console.error('Error registering laundry item:', error.response?.data || error.message);

            setError('Failed to register laundry item: ' + (error.response?.data?.error || error.message));
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
                    <p className="modal-card-title">Add New Laundry Item</p>
                    <button className="delete" aria-label="close" onClick={handleClose}></button>
                </header>
                <section className="modal-card-body">
                    {error && <ErrorMsg message={error} />}
                    {success && <SuccessMsg message={success} />}
                    <div className="columns">
                        <div className="column is-half">
                            <div className="field">
                                <label className="label">Laundry Item</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.laundry_item ? 'is-danger' : ''}`}
                                        type="text"
                                        name="laundry_item"
                                        placeholder="Enter laundry item name"
                                        value={laundry.laundry_item}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.laundry_item && <p className="help is-danger">Please enter a valid laundry item.</p>}
                                </div>
                            </div>
                        </div>

                        <div className="column is-half">
                            <div className="field">
                                <label className="label">Ironing Price</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.laundry_ironing_price ? 'is-danger' : ''}`}
                                        type="text" // Using text to control custom validation
                                        name="laundry_ironing_price"
                                        placeholder="Enter ironing price"
                                        value={laundry.laundry_ironing_price}
                                        onChange={handleChange}
                                    />
                                    {erroredFields.laundry_ironing_price && (
                                        <p className="help is-danger">Please enter a valid ironing price.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="modal-card-foot is-flex is-justify-content-flex-end is-align-items-center">
                    <button className="button is-blue mr-2" onClick={handleSubmit}>
                        Save
                    </button>
                    <button className="button is-red" onClick={handleClose}>
                        Cancel
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AddLaundryModal;
