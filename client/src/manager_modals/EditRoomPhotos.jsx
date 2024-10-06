import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';
import { IoPencil, IoTrashBinOutline } from 'react-icons/io5';

const EditRoomPhotos = ({ isOpen, toggleModal, roomId }) => {
    const [photoDetails, setPhotoDetails] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmArchive, setConfirmArchive] = useState({ show: false, index: null }); // Track confirmation modal

    // Fetch the room photos when the modal opens
    useEffect(() => {
        const fetchRoomPhotos = async () => {
            try {
                const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getRoomPhotos', {
                    params: { roomId } // Fetch photos for the specific roomId
                });

                if (response.data.length === 0) {
                    setError('No photos available for this room.');
                } else {
                    // Filter out photos with slot set to "ARCHIVE"
                    const activePhotos = response.data.filter(photo => photo.room_slot !== 'ARCHIVE');
                    setPhotoDetails(activePhotos); // Set the filtered photos into state
                }
            } catch (err) {
                setError('Failed to fetch room photos.');
            }
        };

        if (isOpen && roomId) {
            fetchRoomPhotos();
        }
    }, [isOpen, roomId]);

    // Handle input change for photo details
    const handleInputChange = (index, event) => {
        const { name, value } = event.target;
        const updatedPhotos = [...photoDetails];
        updatedPhotos[index][name] = value;
        setPhotoDetails(updatedPhotos);
    };

    // Handle updating a single photo
    const handleUpdatePhoto = async (index) => {
        const photo = photoDetails[index];
        try {
            const response = await axios.put(`https://light-house-system-h74t-server.vercel.app/api/updateRoomPhoto`, {
                room_photo_id: photo.room_photo_id,
                room_slot: photo.room_slot,
                room_photo_url: photo.room_photo_url,
            });

            if (response.status === 200) {
                setSuccess(`Photo ${index + 1} updated successfully!`);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to update photo.');
            }
        } catch (err) {
            setError('Failed to update photo.');
        }
    };

    // Open the confirmation modal for archiving
    const openArchiveConfirmation = (index) => {
        setConfirmArchive({ show: true, index });
    };

    // Handle archiving a photo (setting the slot to "ARCHIVE")
    const handleArchivePhoto = async () => {
        const index = confirmArchive.index;
        const photo = photoDetails[index];
        try {
            const response = await axios.put(`https://light-house-system-h74t-server.vercel.app/api/updateRoomPhoto`, {
                room_photo_id: photo.room_photo_id,
                room_slot: 'ARCHIVE', // Set slot to "ARCHIVE"
            });

            if (response.status === 200) {
                setSuccess(`Photo ${index + 1} archived successfully!`);
                // Remove the photo from the list
                setPhotoDetails(photoDetails.filter((_, i) => i !== index));
                setConfirmArchive({ show: false, index: null });
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to archive photo.');
            }
        } catch (err) {
            setError('Failed to archive photo.');
        }
    };

    // Handle closing the modal
    const handleClose = () => {
        setPhotoDetails([]);
        setError('');
        setSuccess('');
        toggleModal();
    };

    return (
        <>
            <div className={`modal ${isOpen ? 'is-active' : ''}`}>
                <div className="modal-background" onClick={handleClose}></div>
                <div className="modal-card custom-modal-card">
                    <header className="modal-card-head">
                        <p className="modal-card-title">Edit Room Photos</p>
                        <button className="delete" aria-label="close" onClick={handleClose}></button>
                    </header>
                    <section className="modal-card-body">
                        {error && <ErrorMsg message={error} />}
                        {success && <SuccessMsg message={success} />}

                        {/* If no photos, display a message */}
                        {photoDetails.length === 0 ? (
                            <p>No photos available for this room.</p>
                        ) : (
                            photoDetails.map((photo, index) => (
                                <div className="columns" key={photo.room_photo_id}>
                                    {/* Smaller column for slot details */}
                                    <div className="column is-2">
                                        <div className="field">
                                            <label className="label">Room Slot</label>
                                            <div className="control">
                                                <div className="select is-fullwidth">
                                                    <select
                                                        name="room_slot"
                                                        value={photo.room_slot}
                                                        onChange={(e) => handleInputChange(index, e)}
                                                    >
                                                        <option value="MAIN">Main</option>
                                                        <option value="EXTRA">Extra</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Larger column for photo review */}
                                    <div className="column is-8">
                                        <div className="field">
                                            <label className="label">Room Photo URL</label>
                                            <div className="control">
                                                <input
                                                    className="input"
                                                    type="text"
                                                    name="room_photo_url"
                                                    placeholder="Enter room photo URL"
                                                    value={photo.room_photo_url}
                                                    onChange={(e) => handleInputChange(index, e)}
                                                />
                                            </div>
                                            {photo.room_photo_url && (
                                                <figure className="image is-256x256 mt-2">
                                                    <img src={photo.room_photo_url} alt="Room" />
                                                </figure>
                                            )}
                                        </div>
                                    </div>

                                    {/* Column for action buttons */}
                                    <div className="column is-2">
                                        <button
                                            className="button is-dark-blue is-medium mb-2"
                                            onClick={() => handleUpdatePhoto(index)}
                                        ><IoPencil className='mr-1'/>
                                            Update
                                        </button>

                                        <button
                                            className="button is-red is-medium mb-2"
                                            onClick={() => openArchiveConfirmation(index)}
                                        ><IoTrashBinOutline className='mr-1'/>
                                            Archive
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                    <footer className="modal-card-foot">
                        <button className="button is-blue" onClick={handleClose}>
                            Close
                        </button>
                    </footer>
                </div>
            </div>

            {/* Confirmation Modal for Archiving */}
            {confirmArchive.show && (
                <div className={`modal is-active`}>
                    <div className="modal-background" onClick={() => setConfirmArchive({ show: false, index: null })}></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">Confirm Archive</p>
                            <button className="delete" aria-label="close" onClick={() => setConfirmArchive({ show: false, index: null })}></button>
                        </header>
                        <section className="modal-card-body">
                            <p>Are you sure you want to archive this photo?</p>
                        </section>
                        <footer className="modal-card-foot">
                            <button className="button is-danger" onClick={handleArchivePhoto}>Yes, Archive</button>
                            <button className="button" onClick={() => setConfirmArchive({ show: false, index: null })}>Cancel</button>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
};

export default EditRoomPhotos;
