import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './modals_m.css';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg'; 
import SuccessMsg from '../messages/successMsg'; 

const AddRoomModal = ({ isOpen, toggleModal }) => {
    const [room, setRoom] = useState({
        room_number:'',
        room_type_name: '',
        room_description: '',
        room_pax_min: 0,
        room_pax_max: 0,
        extra_bed_max: 0,
        room_rate: 0,
        room_disc_percentage: 0,
        room_final_rate: 0,
        room_status: 'AVAILABLE', 
        room_breakfast_availability: 'NOT AVAILABLE', 
        driveLink: ''
    });

    const [roomPhoto, setRoomPhoto] = useState(null); 
    const [error, setError] = useState(''); 
    const [success, setSuccess] = useState(''); 
    const [erroredFields, setErroredFields] = useState({}); 

    useEffect(() => {
        const calculatedFinalRate = room.room_rate * (1 - room.room_disc_percentage / 100);
        setRoom((prevRoom) => ({ ...prevRoom, room_final_rate: calculatedFinalRate }));
    }, [room.room_rate, room.room_disc_percentage]);

    // Clear error and success messages when modal opens
    useEffect(() => {
        if (isOpen) {
            setError('');
            setSuccess('');
            setErroredFields({});
        }
    }, [isOpen]);

    const handleClose = () => {
        setRoom({
            room_number:'',
            room_type_name: '',
            room_description: '',
            room_pax_min: 0,
            room_pax_max: 0,
            extra_bed_max: 0,
            room_rate: 0,
            room_disc_percentage: 0,
            room_final_rate: 0,
            room_status: 'AVAILABLE', 
            room_breakfast_availability: 'NOT AVAILABLE', 
            driveLink: ''
        });
        setRoomPhoto(null);
        setError('');
        setSuccess('');
        setErroredFields({});
        toggleModal(); // Close the modal
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoom({ ...room, [name]: parseFloat(value) || value });
        setErroredFields((prev) => ({ ...prev, [name]: false }));
    };

    const handleSubmit = async () => {
        try {
            setError('');
            setSuccess('');
            setErroredFields({});
            
            const response = await axios.post('https://light-house-system.vercel.app/api/registerRoom', room);
            if (response.status === 201) {
                setSuccess('Room registered successfully!'); 
                setError(''); 
                setErroredFields({}); 

                setTimeout(() => {
                    handleClose(); // Close the modal after success message
                }, 3000); // 3 seconds delay to display the success message
            }
        } catch (error) {
            console.error('Error registering room:', error.response?.data || error.message);
            setError('Failed to register room: ' + (error.response?.data?.error || error.message)); 
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
            <div className="modal-background" onClick={handleClose}></div> {/* Close modal on background click */}
            <div className="modal-card custom-modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Add New Room</p>
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
                                <label className="label">Room Type</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.room_type_name ? 'is-danger' : ''}`} 
                                        type="text"
                                        name="room_type_name"
                                        placeholder="Enter room type"
                                        value={room.room_type_name}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.room_type_name && <p className="help is-danger">Please enter a valid room type.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Room Number</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.room_number ? 'is-danger' : ''}`} 
                                        type="text"
                                        name="room_number"
                                        placeholder="Enter room number"
                                        value={room.room_number}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.room_number && <p className="help is-danger">Please enter a valid room type.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Room Description</label>
                                <div className="control">
                                    <textarea
                                        className={`textarea ${erroredFields.room_description ? 'is-danger' : ''}`}
                                        name="room_description"
                                        placeholder="Enter room description"
                                        value={room.room_description}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                    {erroredFields.room_description && <p className="help is-danger">Please enter a valid room description.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Second Column - PAX and Bed Information */}
                        <div className="column is-4">
                            <div className="field">
                                <label className="label">PAX Minimum</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.room_pax_min ? 'is-danger' : ''}`}
                                        type="number"
                                        name="room_pax_min"
                                        min="1"
                                        value={room.room_pax_min}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.room_pax_min && <p className="help is-danger">Please enter a valid minimum PAX.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">PAX Maximum</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.room_pax_max ? 'is-danger' : ''}`}
                                        type="number"
                                        name="room_pax_max"
                                        min="1"
                                        value={room.room_pax_max}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.room_pax_max && <p className="help is-danger">Please enter a valid maximum PAX.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Extra Bed Maximum</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.extra_bed_max ? 'is-danger' : ''}`}
                                        type="number"
                                        name="extra_bed_max"
                                        min="0"
                                        value={room.extra_bed_max}
                                        onChange={handleChange}
                                    />
                                    {erroredFields.extra_bed_max && <p className="help is-danger">Please enter a valid extra bed maximum.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Room Breakfast Availability</label>
                                <div className="control">
                                    <div className={`select is-fullwidth ${erroredFields.room_breakfast_availability ? 'is-danger' : ''}`}>
                                        <select
                                            name="room_breakfast_availability"
                                            value={room.room_breakfast_availability}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="AVAILABLE">Available</option>
                                            <option value="NOT AVAILABLE">Not Available</option>
                                        </select>
                                    </div>
                                    {erroredFields.room_breakfast_availability && <p className="help is-danger">Please select a valid breakfast availability.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Third Column - Rate and Discount Information */}
                        <div className="column is-4">
                            <div className="field">
                                <label className="label">Room Rate</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.room_rate ? 'is-danger' : ''}`}
                                        type="number"
                                        name="room_rate"
                                        placeholder="Enter room rate"
                                        value={room.room_rate}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.room_rate && <p className="help is-danger">Please enter a valid room rate.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Discount Percentage</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.room_disc_percentage ? 'is-danger' : ''}`}
                                        type="number"
                                        name="room_disc_percentage"
                                        placeholder="Enter discount percentage"
                                        value={room.room_disc_percentage}
                                        onChange={handleChange}
                                    />
                                    {erroredFields.room_disc_percentage && <p className="help is-danger">Please enter a valid discount percentage.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Final Rate</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.room_final_rate ? 'is-danger' : ''}`}
                                        type="number"
                                        name="room_final_rate"
                                        placeholder="Enter final rate"
                                        value={room.room_final_rate.toFixed(2)} // Display final rate with 2 decimal places
                                        readOnly // Make the field read-only as it is auto-calculated
                                    />
                                    {erroredFields.room_final_rate && <p className="help is-danger">Please enter a valid final rate.</p>}
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

export default AddRoomModal;
