import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import axios from 'axios';
import './modals_m.css';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';
import { ClipLoader } from 'react-spinners';

const EditRoomVTModal = ({ isOpen, toggleModal, roomTypeName }) => {
    const [vtDescription, setVtDescription] = useState('');
    const [vtPhoto, setVtPhoto] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [vtId, setVtId] = useState(null);
    const [loading, setLoading] = useState(false); // Add loading state

    // Fetch the virtual tour details based on roomTypeName when the modal opens
    useEffect(() => {
        const fetchVirtualTour = async () => {
            setLoading(true); // Start loading
            try {
                const response = await axios.get('http://localhost:3001/api/getRoomVirtualTourByTypeName', {
                    params: { vt_name: roomTypeName } // Use roomTypeName for the query
                });

                console.log('Fetched Virtual Tour Data:', response.data); // Log the fetched data

                if (response.data && response.data.length > 0) {
                    const vt = response.data[0]; // Assuming the first entry matches
                    if (vt.vt_status !== 'DELETE') {
                        setVtId(vt.vt_id);
                        setVtDescription(vt.vt_description);
                        setVtPhoto(vt.vt_photo_url);
                    } else {
                        setError('No active virtual tours available for this room type.');
                    }
                } else {
                    setError('No virtual tours available for this room type.');
                }
            } catch (err) {
                setError('Failed to fetch virtual tour.');
                console.error('Error fetching virtual tour:', err);
            } finally {
                setLoading(false); // End loading
            }
        };

        if (isOpen && roomTypeName) {
            fetchVirtualTour();
        }
    }, [isOpen, roomTypeName]);

    // Handle modal close
    const handleClose = () => {
        setVtDescription('');
        setVtPhoto('');
        setVtId(null);
        setError('');
        setSuccess('');
        toggleModal();
    };

    // Convert selected file to Base64
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVtPhoto(reader.result); // Base64 string
            };
            reader.readAsDataURL(file);
        }
    };

// Handle form submission to update the virtual tour
const handleUpdate = async () => {
    if (!roomTypeName) {
        setError('Virtual tour name is required.');
        return;
    }

    setLoading(true); // Start loading while updating
    try {
        const response = await axios.put('http://localhost:3001/api/updateRoomVT', {
            vt_name: roomTypeName, // Use `roomTypeName` instead of `vt_id`
            vt_description: vtDescription,
            vt_photo_base64: vtPhoto,
            vt_status: 'ACTIVE'
        });

        if (response.status === 200) {
            setSuccess('Virtual tour updated successfully.');
            setError('');
            setTimeout(() => {
                handleClose(); 
            }, 2000);
        }
    } catch (error) {
        setError('Failed to update virtual tour. Please try again.');
        console.error('Error updating virtual tour:', error);
    } finally {
        setLoading(false); 
    }
};

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={handleClose}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Edit Virtual Tour</p>
                    <button className="delete" aria-label="close" onClick={handleClose}></button>
                </header>
                <section className="modal-card-body">
                    {loading && <ClipLoader color="#00d1b2" size={50} />} {/* Show loader when loading */}
                    {error && <ErrorMsg message={error} />}
                    {success && <SuccessMsg message={success} />}
                    {!loading && (
                        <>
                            <div className="field">
                                <label className="label">Virtual Tour Name (Room Type)</label>
                                <div className="control">
                                    <input
                                        className="input"
                                        type="text"
                                        value={roomTypeName}
                                        readOnly // Set the roomTypeName as read-only
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
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Upload New Photo (Optional)</label>
                                <div className="control">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                            {vtPhoto && (
                                <div className="field">
                                    <label className="label">Current Virtual Tour Preview</label>
                                    <div className="control">
                                        <img src={vtPhoto} alt="Virtual Tour Preview" style={{ width: '100%', height: 'auto' }} />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-success" onClick={handleUpdate} disabled={loading}>
                        {loading ? <ClipLoader color="#fff" size={15} /> : 'Update Virtual Tour'}
                    </button>
                    <button className="button" onClick={handleClose} disabled={loading}>Cancel</button>
                </footer>
            </div>
        </div>
    );
};

export default EditRoomVTModal;
