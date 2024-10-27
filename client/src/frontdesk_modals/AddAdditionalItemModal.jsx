import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';

const AddAdditionalItemModal = ({ isOpen, toggleModal, refreshAddAdditionalItemList }) => {
    const [checkIns, setCheckIns] = useState([]); // To store check-in data with guest names
    const [selectedCheckIn, setSelectedCheckIn] = useState(null); // To store selected check-in
    const [itemName, setItemName] = useState(''); // Item name
    const [customItemName, setCustomItemName] = useState(''); // Custom item name for 'OTHER'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchCheckIns = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/getCheckedInGuests');
                setCheckIns(response.data);
            } catch (error) {
                console.error('Error fetching check-in data with guests:', error);
                setError('Failed to fetch check-in data.');
                setTimeout(() => setError(''), 3000);
            }
        };

        fetchCheckIns();
    }, []);

    const handleSubmit = async () => {
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
                check_in_id: selectedCheckIn.check_in_id,
                add_item_name: finalItemName,
                add_item_borrowed_date: new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }), // Set current time in Philippine timezone
                add_item_status: 'BORROWED'
            };

            const response = await axios.post('http://localhost:3001/api/registerAdditionalItem', payload);

            if (response.status === 201) {
                setSuccess('Additional item registered successfully!');
                setTimeout(() => {
                    setSuccess('');

                    refreshAddAdditionalItemList();

                    toggleModal();
                }, 3000);
            }
        } catch (error) {
            setError('Failed to register additional item. ' + (error.response?.data?.error || error.message));
            setTimeout(() => setError(''), 3000);
        }
    };

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={toggleModal}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Add Additional Item</p>
                    <button className="delete" aria-label="close" onClick={toggleModal}></button>
                </header>
                <section className="modal-card-body">
                    {error && <ErrorMsg message={error} />}
                    {success && <SuccessMsg message={success} />}
                    <div className="columns">
                        <div className="column is-12">
                            <div className="columns is-multiline">

                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Check-In Guest</label>
                                        <div className="control">
                                            <div className="select is-fullwidth">
                                                <select
                                                    value={selectedCheckIn ? selectedCheckIn.check_in_id : ''}
                                                    onChange={(e) => {
                                                        const checkIn = checkIns.find(c => c.check_in_id === e.target.value);
                                                        setSelectedCheckIn(checkIn);
                                                    }}
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

                            </div>
                        </div>
                    </div>
                </section>

                <footer className="modal-card-foot is-flex is-justify-content-flex-end is-align-items-center">
                    <button className="button is-blue mr-2" onClick={handleSubmit}>Save</button>
                    <button className="button is-red" onClick={toggleModal}>Cancel</button>
                </footer>
            </div>
        </div>
    );
};

export default AddAdditionalItemModal;
