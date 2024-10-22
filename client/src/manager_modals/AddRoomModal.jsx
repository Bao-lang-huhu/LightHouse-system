import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './modals_m.css';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg'; 
import SuccessMsg from '../messages/successMsg'; 

const AddRoomModal = ({ isOpen, toggleModal, refreshRoomList }) => {
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
    const [roomNumbers, setRoomNumbers] = useState([]);

    useEffect(() => {
        const fetchRoomNumbers = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/getRoomsAll');
                const existingRoomNumbers = response.data.map(room => room.room_number);
                setRoomNumbers(existingRoomNumbers);
            } catch (error) {
                console.error('Error fetching room numbers:', error);
            }
        };

        fetchRoomNumbers();
    }, []);

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
    
        if (name === 'room_number') {
            // Allow only numeric values
            const numericValue = value.replace(/\D/g, '');
            setRoom((prev) => ({
                ...prev,
                [name]: numericValue,
            }));
    
            // Reset the error for room number when user is typing
            setErroredFields((prev) => ({
                ...prev,
                room_number: false,
            }));
        } else {
            setRoom((prev) => ({
                ...prev,
                [name]: value,
            }));
    
            setErroredFields((prev) => ({
                ...prev,
                [name]: false,
            }));
        }
    };

    useEffect(() => {
        if (isOpen) {
            setRoom((prevRoom) => ({
                ...prevRoom,
                room_pax_max: prevRoom.room_pax_max || 2,
                room_pax_min: prevRoom.room_pax_min || 1, // Set to 1 if not already set
            }));
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        try {
            const requiredFields = {
                room_type_name: room.room_type_name.trim() === '',
                room_number: room.room_number.trim() === '',
                room_description: room.room_description.trim() === '',
                room_rate: room.room_rate === '' || parseFloat(room.room_rate) <= 0,
            };
    
            if (Object.values(requiredFields).some((field) => field)) {
                setErroredFields(requiredFields);
                setError('Please fill out all required fields correctly.');
                return; // Prevent form submission
            }
    
            const response = await axios.get('http://localhost:3001/api/getRoomsAll');
            const existingRoomNumbers = response.data.map(room => room.room_number);
    
            // Check if the current room number already exists
            if (existingRoomNumbers.includes(room.room_number)) {
                setErroredFields((prev) => ({
                    ...prev,
                    room_number: true,
                }));
                setError('The room number is already in use. Please enter a different room number.');
                return; // Prevent form submission
            }
    
            // Clear any previous errors before proceeding
            setError('');
            setSuccess('');
            setErroredFields({});
    
            // Proceed to save the room if there are no errors
            const saveResponse = await axios.post('http://localhost:3001/api/registerRoom', room);
            if (saveResponse.status === 201) {
                setSuccess('Room registered successfully!');
                setError('');
                setErroredFields({});

                refreshRoomList();
    
                setTimeout(() => {
                    handleClose(); // Close the modal after success message
                }, 3000); 
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
                                {erroredFields.room_number && (
                                    <p className="help is-danger">This room number is already in use. Please enter a different room number.</p>
                                )}
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
                                <div className="control is-flex is-align-items-center">
                                    {/* Decrease Button */}
                                    <button
                                        className={`button is-blue mr-2 ${erroredFields.room_pax_min ? 'is-danger' : ''}`}
                                        onClick={() => {
                                            if (room.room_pax_min > 1) {
                                                setRoom((prev) => ({
                                                    ...prev,
                                                    room_pax_min: prev.room_pax_min - 1,
                                                }));
                                            }
                                        }}
                                        disabled={room.room_pax_min <= 1}
                                    >
                                        -
                                    </button>

                                    {/* Display Current PAX Minimum */}
                                    <span className="button is-static">
                                        {room.room_pax_min} Guests
                                    </span>

                                    {/* Increase Button */}
                                    <button
                                        className={`button is-blue ml-2 ${erroredFields.room_pax_min ? 'is-danger' : ''}`}
                                        onClick={() => {
                                            if (room.room_pax_min < 10) {
                                                setRoom((prev) => ({
                                                    ...prev,
                                                    room_pax_min: prev.room_pax_min + 1,
                                                }));
                                            }
                                        }}
                                        disabled={room.room_pax_min >= 10}
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Error Message */}
                                {erroredFields.room_pax_min && <p className="help is-danger">Please enter a valid minimum PAX.</p>}
                            </div>

                            <div className="field">
                                <label className="label">PAX Maximum</label>
                                <div className="control is-flex is-align-items-center">
                                    {/* Decrease Button */}
                                    <button
                                        className={`button is-blue mr-2 ${erroredFields.room_pax_max ? 'is-danger' : ''}`}
                                        onClick={() => {
                                            if (room.room_pax_max > 1) {
                                                setRoom((prev) => ({
                                                    ...prev,
                                                    room_pax_max: prev.room_pax_max - 2,
                                                }));
                                            }
                                        }}
                                        disabled={room.room_pax_max <= 2}
                                    >
                                        -
                                    </button>

                                    {/* Display Current PAX Maximum */}
                                    <span className="button is-static">
                                        {room.room_pax_max} Guests
                                    </span>

                                    {/* Increase Button */}
                                    <button
                                        className={`button is-blue ml-2 ${erroredFields.room_pax_max ? 'is-danger' : ''}`}
                                        onClick={() => {
                                            if (room.room_pax_max < 10) {
                                                setRoom((prev) => ({
                                                    ...prev,
                                                    room_pax_max: prev.room_pax_max + 1,
                                                }));
                                            }
                                        }}
                                        disabled={room.room_pax_max >= 10}
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Error Message */}
                                {erroredFields.room_pax_max && <p className="help is-danger">Please enter a valid maximum PAX.</p>}
                            </div>

                            <div className="field">
                                <label className="label">Extra Bed Maximum</label>
                                <div className="control is-flex is-align-items-center">
                                    {/* Decrease Button */}
                                    <button
                                        className={`button is-blue mr-2 ${erroredFields.extra_bed_max ? 'is-danger' : ''}`}
                                        onClick={() => {
                                            if (room.extra_bed_max > 0) {
                                                setRoom((prev) => ({
                                                    ...prev,
                                                    extra_bed_max: prev.extra_bed_max - 1,
                                                }));
                                            }
                                        }}
                                        disabled={room.extra_bed_max <= 0}
                                    >
                                        -
                                    </button>

                                    {/* Display Current Extra Bed Maximum */}
                                    <span className="button is-static">
                                        {room.extra_bed_max} Beds
                                    </span>

                                    {/* Increase Button */}
                                    <button
                                        className={`button is-blue ml-2 ${erroredFields.extra_bed_max ? 'is-danger' : ''}`}
                                        onClick={() => {
                                            if (room.extra_bed_max < 3) {
                                                setRoom((prev) => ({
                                                    ...prev,
                                                    extra_bed_max: prev.extra_bed_max + 1,
                                                }));
                                            }
                                        }}
                                        disabled={room.extra_bed_max >= 3}
                                    >
                                        +
                                    </button>
                                </div>

                                {erroredFields.extra_bed_max && <p className="help is-danger">Please enter a valid extra bed maximum.</p>}
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
                                    value={room.room_rate}
                                    min="1" // Set the minimum value to 1
                                    onChange={(e) => {
                                        let value = e.target.value;

                                        // Prevent negative input and input starting with '0'
                                        if (value >= 0 && !/^0/.test(value)) {
                                            setRoom((prev) => ({
                                                ...prev,
                                                room_rate: value,
                                            }));
                                        }
                                    }}
                                    onBlur={() => {
                                        // Ensure the value is at least 1
                                        const value = parseFloat(room.room_rate);
                                        if (isNaN(value) || value < 1) {
                                            setRoom((prev) => ({
                                                ...prev,
                                                room_rate: 1,
                                            }));
                                        } else {
                                            setRoom((prev) => ({
                                                ...prev,
                                                room_rate: value,
                                            }));
                                        }
                                    }}
                                    required
                                />
                                {erroredFields.room_rate && (
                                    <p className="help is-danger">Please enter a valid room rate.</p>
                                )}
                            </div>
                        </div>


                            <div className="field">
                                <label className="label">Discount Percentage</label>
                            <div className="control is-flex is-align-items-center">
                                {/* Decrease Button */}
                                <button
                                    className={`button is-blue mr-2 ${erroredFields.room_disc_percentage ? 'is-danger' : ''}`}
                                    onClick={() => {
                                        if (room.room_disc_percentage > 0) {
                                            setRoom((prev) => ({
                                                ...prev,
                                                room_disc_percentage: prev.room_disc_percentage - 1,
                                            }));
                                        }
                                    }}
                                    disabled={room.room_disc_percentage <= 0}
                                >
                                    -
                                </button>

                                {/* Display Current Discount Percentage */}
                                <span className="button is-static">
                                    {room.room_disc_percentage}%
                                </span>

                                {/* Increase Button */}
                                <button
                                    className={`button is-blue ml-2 ${erroredFields.room_disc_percentage ? 'is-danger' : ''}`}
                                    onClick={() => {
                                        if (room.room_disc_percentage < 100) {
                                            setRoom((prev) => ({
                                                ...prev,
                                                room_disc_percentage: prev.room_disc_percentage + 1,
                                            }));
                                        }
                                    }}
                                    disabled={room.room_disc_percentage >= 100}
                                >
                                    +
                                </button>
                            </div>

                            {/* Error Message */}
                            {erroredFields.room_disc_percentage && <p className="help is-danger">Please enter a valid discount percentage.</p>}
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
