import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import axios from 'axios';
import './modals_m.css';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';

const AddRoomVTModal = ({ isOpen, toggleModal, roomId, roomTypeName }) => {
    const [vtName, setVtName] = useState('');
    const [vtDescription, setVtDescription] = useState('');
    const [vtPhoto, setVtPhoto] = useState('');
    const [vtPhotoPreview, setVtPhotoPreview] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (roomTypeName) {
            setVtName(roomTypeName);
        }
    }, [roomTypeName]);

    const handleClose = () => {
        setVtName('');
        setVtDescription('');
        setVtPhoto('');
        setVtPhotoPreview('');
        setError('');
        setSuccess('');
        toggleModal();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVtPhoto(reader.result); // Base64 string
                setVtPhotoPreview(reader.result); // Set preview to Base64 string
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!vtName || !vtPhoto || !vtDescription) {
            setError('All fields are required. Please fill in all the information.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/api/registerRoomVT', {
                room_id: roomId,
                vt_name: vtName,
                vt_description: vtDescription,
                vt_photo_url: vtPhoto,
                vt_status: 'ACTIVE'
            });

            if (response.status === 200) {
                setSuccess('Virtual tour added successfully.');
                setError('');
                handleClose();
            }
        } catch (error) {
            setError('Failed to add virtual tour. Please try again.');
            console.error('Error adding virtual tour:', error);
        }
    };

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={handleClose}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Add Room Virtual Tour</p>
                    <button className="delete" aria-label="close" onClick={handleClose}></button>
                </header>
                <section className="modal-card-body">
                    {error && <ErrorMsg message={error} />}
                    {success && <SuccessMsg message={success} />}
                    <div className="field">
                        <label className="label">Virtual Tour Name</label>
                        <div className="control">
                            <input
                                className="input"
                                type="text"
                                value={vtName}
                                readOnly 
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Virtual Tour Description</label>
                        <div className="control">
                            <textarea
                                className="textarea"
                                value={vtDescription}
                                onChange={(e) => setVtDescription(e.target.value)}
                                required // Ensure the field is required
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Upload 360 or Panorama Photo</label>
                        <div className="control">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                required // Ensure the field is required
                            />
                        </div>
                    </div>

                    {/* Photo Preview */}
                    {vtPhotoPreview && (
                        <div className="field mt-3">
                            <label className="label">Photo Preview</label>
                            <figure className="image is-fullwidth">
                                <img src={vtPhotoPreview} alt="Virtual Tour Preview" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                            </figure>
                        </div>
                    )}
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

export default AddRoomVTModal;
