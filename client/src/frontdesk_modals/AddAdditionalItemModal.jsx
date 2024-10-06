import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';

const AddAdditionalItemModal = ({ isOpen, toggleModal }) => {
    const [checkIns, setCheckIns] = useState([]); // To store check-in data with guest names
    const [filteredCheckIns, setFilteredCheckIns] = useState([]); // For filtered check-ins based on search
    const [searchTerm, setSearchTerm] = useState(''); // For search input
    const [selectedCheckIn, setSelectedCheckIn] = useState(null); // To store selected check-in
    const [itemName, setItemName] = useState(''); // Item name
    const [borrowedDateTime, setBorrowedDateTime] = useState(''); // Borrowed date and time
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchCheckIns = async () => {
            try {
                const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getcheckInGuests');
                setCheckIns(response.data);
            } catch (error) {
                console.error('Error fetching check-in data with guests:', error);
                setError('Failed to fetch check-in data.');
                setTimeout(() => setError(''), 3000);
            }
        };

        fetchCheckIns();
    }, []);

    useEffect(() => {
        // Filter check-ins based on search term
        setFilteredCheckIns(
            checkIns.filter(checkIn =>
                checkIn.guest_name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, checkIns]);

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (!selectedCheckIn) {
            setError('Please select a guest.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        try {
            const payload = {
                check_in_id: selectedCheckIn.check_in_id,
                add_item_name: itemName,
                add_item_borrowed_date: borrowedDateTime,
                add_item_status: 'BORROWED'
            };

            const response = await axios.post('https://light-house-system-h74t-server.vercel.app/api/registerAdditionalItem', payload);

            if (response.status === 201) {
                setSuccess('Additional item registered successfully!');
                setTimeout(() => {
                    setSuccess('');
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
            <div className="modal-card custom-modal-card">
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
                                        <label className="label">Search Guest Name</label>
                                        <div className="control">
                                            <input
                                                className="input"
                                                type="text"
                                                placeholder="Enter guest name"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="dropdown is-active">
                                            <div className="dropdown-menu">
                                                <div className="dropdown-content">
                                                    {filteredCheckIns.map((checkIn) => (
                                                        <a
                                                            key={checkIn.check_in_id}
                                                            className="dropdown-item"
                                                            onClick={() => setSelectedCheckIn(checkIn)}
                                                        >
                                                            {checkIn.guest_name}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Selected Check-In</label>
                                        <div className="control">
                                            <input
                                                className="input"
                                                type="text"
                                                placeholder="Selected check-in"
                                                value={selectedCheckIn ? selectedCheckIn.guest_name : ''}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Item Name</label>
                                        <div className="control">
                                            <input
                                                className="input"
                                                type="text"
                                                placeholder="Enter item name"
                                                value={itemName}
                                                onChange={(e) => setItemName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Borrowed Date and Time</label>
                                        <div className="control">
                                            <input
                                                className="input"
                                                type="datetime-local"
                                                placeholder="Select date and time"
                                                value={borrowedDateTime}
                                                onChange={(e) => setBorrowedDateTime(e.target.value)}
                                            />
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
