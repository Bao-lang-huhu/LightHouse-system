import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import axios from 'axios';
import './modals_m.css';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';

const AddRoomPhotos = ({ isOpen, toggleModal, roomId }) => {
    const [photoDetails, setPhotoDetails] = useState([{ room_slot: '', room_photo_url: '' }]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Log the roomId prop to verify it's being passed correctly
    useEffect(() => {
        console.log("Received roomId in AddRoomPhotos Modal:", roomId);
    }, [roomId]);

    // Handle the addition of new photo fields
    const addPhotoField = () => {
        setPhotoDetails([...photoDetails, { room_slot: '', room_photo_url: '' }]);
    };

    // Handle the removal of a photo field
    const removePhotoField = (index) => {
        const newPhotoDetails = [...photoDetails];
        newPhotoDetails.splice(index, 1);
        setPhotoDetails(newPhotoDetails);
    };

    // Handle input change for photo details
    const handleInputChange = (index, event) => {
        const { name, value } = event.target;
        const newPhotoDetails = [...photoDetails];
        newPhotoDetails[index][name] = value;
        setPhotoDetails(newPhotoDetails);
    };

    // Handle modal close
    const handleClose = () => {
        setPhotoDetails([{ room_slot: '', room_photo_url: '' }]);
        setError('');
        setSuccess('');
        toggleModal();
    };

    // Handle form submission
    const handleSubmit = async () => {
        setError('');
        setSuccess('');
        
        // Validate that all fields are filled out
        for (let i = 0; i < photoDetails.length; i++) {
            if (!photoDetails[i].room_slot || !photoDetails[i].room_photo_url) {
                setError('Please fill out all fields before submitting.');
                return;
            }
        }

        try {
            const response = await axios.post('https://light-house-system.vercel.app/api/registerRoomPhotos', {
                room_id: roomId, // Pass the current room ID
                photos: photoDetails, // Send all photo details
            });

            if (response.status === 201) {
                setSuccess('Room photos added successfully!');
                setError('');

                // Reset the form after success
                setPhotoDetails([{ room_slot: '', room_photo_url: '' }]);
                setTimeout(() => {
                    setSuccess('');
                    handleClose(); // Close the modal after a short delay
                }, 3000);
            }
        } catch (error) {
            console.error('Error adding room photos:', error.response?.data || error.message);
            setError('Failed to add room photos: ' + (error.response?.data?.error || error.message));
            setSuccess('');
        }
    };

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={handleClose}></div>
            <div className="modal-card custom-modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Add New Room Photos</p>
                    <button className="delete" aria-label="close" onClick={handleClose}></button>
                </header>
                <section className="modal-card-body">
                    {error && <ErrorMsg message={error} />}
                    {success && <SuccessMsg message={success} />}
                    {photoDetails.map((photo, index) => (
                        <div className="columns" key={index}>
                            <div className="column is-5">
                                <div className="field">
                                    <label className="label">Room Slot</label>
                                    <div className="control">
                                        <div className="select is-fullwidth">
                                            <select
                                                name="room_slot"
                                                value={photo.room_slot}
                                                onChange={(e) => handleInputChange(index, e)}
                                            >
                                                <option value="">Select Room Slot</option>
                                                <option value="MAIN">Main</option>
                                                <option value="EXTRA">Extra</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="column is-5">
                                <div className="field">
                                    <label className="label">Room Photo URL</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            name="room_photo_url"
                                            value={photo.room_photo_url}
                                            onChange={(e) => handleInputChange(index, e)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="column is-2 is-flex is-align-items-center">
                                <button className="button is-danger is-fullwidth" onClick={() => removePhotoField(index)}>
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                    <button className="button is-blue is-fullwidth mt-2" onClick={addPhotoField}>
                        Add Another Photo
                    </button>
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

export default AddRoomPhotos;
