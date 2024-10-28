import React, { useState, useEffect } from 'react'; 
import 'bulma/css/bulma.min.css';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';

const EditAdditionalItemModal = ({ isOpen, onClose, addItemId, refreshAddAdditionalItemList }) => {
    const [checkIns, setCheckIns] = useState([]); 
    const [selectedCheckIn, setSelectedCheckIn] = useState('');
    const [itemName, setItemName] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [customItemName, setCustomItemName] = useState(''); // Custom item name for 'OTHER'


    useEffect(() => {
        const fetchCheckIns = async () => {
            try {
                const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getCheckedInGuests');
                setCheckIns(response.data);
            } catch (error) {
                console.error('Error fetching check-in data:', error);
                setError('Failed to fetch check-in data.');
                setTimeout(() => setError(''), 3000);
            }
        };

        // Fetch check-ins only when the modal is open
        if (isOpen) {
            fetchCheckIns();
        }
    }, [isOpen]);

    

    useEffect(() => {
        const fetchAdditionalItem = async () => {
            if (addItemId) {
                try {
                    const response = await axios.get(`https://light-house-system-h74t-server.vercel.app/api/getAdditionalItemsById/${addItemId}`);
                    const itemData = response.data;
                    setSelectedCheckIn(itemData.check_in_id || '');
                    setItemName(itemData.add_item_name || '');
                    setStatus(itemData.add_item_status || '');
                } catch (error) {
                    console.error('Error fetching additional item:', error);
                    setError('Failed to fetch item details.');
                }
            }
        };

        if (isOpen && addItemId) {
            fetchAdditionalItem();
        }
    }, [addItemId, isOpen]);

    const handleSaveChanges = async () => {
        console.log("Saving changes for item ID:", addItemId); // Log for addItemId
        setError('');
        setSuccess('');
    
        if (!selectedCheckIn) {
            setError('Please select a guest.');
            setTimeout(() => setError(''), 3000);
            return;
        }
    
        const finalItemName = itemName === 'OTHER' ? customItemName : itemName;
        if (!finalItemName) {
            setError('Please specify the item name.');
            setTimeout(() => setError(''), 3000);
            return;
        }
    
        try {
            const payload = {
                check_in_id: selectedCheckIn,
                add_item_name: finalItemName,
                add_item_status: status
            };
    
            const response = await axios.put(`https://light-house-system-h74t-server.vercel.app/api/editAdditionalItem/${addItemId}`, payload);
    
            if (response.status === 200) {
                setSuccess('Changes saved successfully!');
                setTimeout(() => {
                    setSuccess('');
                    refreshAddAdditionalItemList();
                    onClose(); 
                }, 3000);
            }
        } catch (error) {
            console.error("Error saving changes:", error); // Log error details
            setError('Failed to save changes. ' + (error.response?.data?.error || error.message));
            setTimeout(() => setError(''), 3000);
        }
    };
    
    // Reset states when modal closes
    const resetModalState = () => {
        setSelectedCheckIn('');
        setItemName('');
        setStatus('');
        setError('');
        setSuccess('');
    };

    // Use onClose to reset and close the modal
    const handleClose = () => {
        resetModalState();
        onClose();
    };

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={handleClose}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Edit Additional Item</p>
                    <button className="delete" aria-label="close" onClick={handleClose}></button>
                </header>
                <section className="modal-card-body">
                    {error && <ErrorMsg message={error} />}
                    {success && <SuccessMsg message={success} />}
                    <div className="columns">
                        <div className="column is-12">
                            <div className="columns is-multiline">
                                {/* Check-In Guest Dropdown */}
                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Check-In Guest</label>
                                        <div className="control">
                                            <div className="select is-fullwidth">
                                                <select
                                                    value={selectedCheckIn}
                                                    onChange={(e) => setSelectedCheckIn(e.target.value)}
                                                >
                                                    <option value="" disabled>Select a guest</option>
                                                    {checkIns.map((checkIn, index) => (
                                                        <option key={index} value={checkIn.check_in_id}>
                                                            {checkIn.guest_fname} {checkIn.guest_lname} - Room {checkIn.room_number}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Item Name Input */}
                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Item Name</label>
                                        <div className="control">
                                            <div className="select is-fullwidth">
                                                <select
                                                    value={itemName}
                                                    onChange={(e) => setItemName(e.target.value)}
                                                >
                                                    <option value="" disabled>Select item</option>
                                                    <option value="Blower">Blower</option>
                                                    <option value="Hair Straightener">Hair Straightener</option>
                                                    <option value="Towel">Towel</option>
                                                    <option value="Pillow">Pillow</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            {itemName === 'Other' && (
                                                <input
                                                    className="input mt-2"
                                                    type="text"
                                                    placeholder="Specify other item"
                                                    value={customItemName}
                                                    onChange={(e) => setCustomItemName(e.target.value)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Dropdown */}
                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Status</label>
                                        <div className="control">
                                            <p><strong>{status}</strong></p>
                                           
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="modal-card-foot is-flex is-justify-content-flex-end is-align-items-center">
                    <button className="button is-blue mr-2" onClick={handleSaveChanges}>Save Changes</button>
                    <button className="button is-red" onClick={handleClose}>Cancel</button>
                </footer>
            </div>
        </div>
    );
};

export default EditAdditionalItemModal;
