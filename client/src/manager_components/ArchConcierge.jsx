import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_m.css';
import {IoSearchCircle, IoWalk } from 'react-icons/io5';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg'; // Import Error Message Component
import SuccessMsg from '../messages/successMsg'; // Import Success Message Component

const ArchConcierge = () => {
    const [conciergeList, setConciergeList] = useState([]); 
    const [selectedConcierge, setSelectedConcierge] = useState(null); // State for the selected concierge
    const [searchTerm, setSearchTerm] = useState(''); 
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isArchiving, setIsArchiving] = useState(false);

    // Fetch concierge data on component mount
    
        const fetchConciergeData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/getConcierge'); // Replace with your API endpoint
                setConciergeList(response.data); // Set the fetched concierge data to state
            } catch (error) {
                console.error('Error fetching concierge data:', error);
                setError('Failed to fetch concierge data.');
                setTimeout(() => setError(''), 3000); // Clear error message after timeout
            }
        };

        const refreshConciergeList = () => {
            fetchConciergeData(); 
        };
    
        useEffect(() => {
            fetchConciergeData();
        }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'green';
            case 'INACTIVE':
                return 'red';
            default:
                return 'gray';
        }
    };

    // Handle concierge click
    const handleConciergeClick = (concierge) => {
        setSelectedConcierge(concierge); // Set the clicked concierge as selected
        setError('');
        setSuccess('');
    };

    // Handle input change in the detail view
    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setSelectedConcierge((prev) => ({ ...prev, [name]: value }));
    };


    // Handle archive of concierge
    const handleArchive = async () => {
        setIsArchiving(false);
        try {
            setError('');
            setSuccess('');
    
            // Log the selected concierge to ensure it has the concierge_id
            console.log('Selected Concierge for Archiving:', selectedConcierge);

            const response = await axios.put(
                `http://localhost:3001/api/updateConcierge/${selectedConcierge.concierge_id}`,
                { concierge_status: 'ACTIVE' } 
            );
    
            if (response.status === 200) {
                setSuccess('Concierge restored successfully!');
                // Update local state with DELETE status
                setConciergeList((prev) =>
                    prev.map((concierge) =>
                        concierge.concierge_id === selectedConcierge.concierge_id 
                            ? { ...concierge, concierge_status: 'ACTIVE' } 
                            : concierge
                    )
                );
                setSelectedConcierge(null); // Deselect after archiving
                setTimeout(() => setSuccess(''), 3000);
            } else {
                console.error('Unexpected response:', response);
                setError('Failed to restore concierge.');
            }
        } catch (error) {
            console.error('Error archiving concierge:', error.response?.data || error.message);
            setError('Failed to archive concierge.');
            setTimeout(() => setError(''), 3000);
        }
    };
    
    
    // Filter concierge based on search term and exclude "DELETE" status
    const filteredConcierge = conciergeList.filter(
        (concierge) =>
            concierge.concierge_type.toLowerCase().includes(searchTerm.toLowerCase()) &&
            concierge.concierge_status === 'DELETE'
    );

    return (
        <section className='section-p1'>
            <div className="columns" style={{ minHeight: "100vh" }}>
                <div className="column is-3">
                    <div className="column">
                        <div className='columns is-vcentered tablet-column-layout'>
                            <div className='column'>
                                <h1 className='subtitle'>
                                    <strong>Concierge</strong>
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="column is-hidden-tablet-only custom-hide-tablet is-fullwidth" style={{ padding: '0', margin: '0' }}>
                        <div className="field has-addons is-flex is-flex-direction-row is-fullwidth-mobile">
                            <div className="control is-expanded is-fullwidth">
                                <input
                                    className="input is-fullwidth-mobile"
                                    type="text"
                                    style={{ margin: '0' }}
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)} // Update search term
                                />
                            </div>
                            <div className="control is-fullwidth">
                                <button className="button is-blue is-fullwidth-mobile" style={{ height: '100%' }}>
                                    <IoSearchCircle className="is-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Concierge List */}
                    <div style={{ marginBottom: "5px" }}>
                        {filteredConcierge.map((concierge) => (
                            <div
                                key={concierge.concierge_id}
                                className={`staff-space ${selectedConcierge && selectedConcierge.concierge_id === concierge.concierge_id ? 'is-active' : ''}`} // Highlight selected concierge
                                onClick={() => handleConciergeClick(concierge)} // Handle concierge click
                                style={{
                                    cursor: 'pointer',
                                    padding: '1rem',
                                    backgroundColor: selectedConcierge && selectedConcierge.concierge_id === concierge.concierge_id ? '#e8f4ff' : 'transparent'
                                }} // Add cursor pointer and highlight style
                            >
                                <div className="columns is-vcentered is-mobile" style={{ paddingLeft: "5px" }}>
                                    <IoWalk style={{ marginRight: '5px', textAlign: 'center' }} />
                                    <div className="column is-flex is-align-items-center">
                                        <h3 style={{ marginRight: "8px" }}>
                                            {concierge.concierge_type}
                                        </h3>
                                        <div
                                            className="status-circle"
                                            style={{
                                                backgroundColor: getStatusColor(concierge.concierge_status), // Color based on status
                                                borderRadius: '50%',
                                                width: '10px',
                                                height: '10px'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="column" style={{ backgroundColor: "white" }}>
                    <main className="section-p1">
                        <div className="columns">
                            <h1 className="subtitle">
                                <strong>Concierge Details</strong>
                            </h1>
                        </div>

                        {error && <ErrorMsg message={error} />} 
                        {success && <SuccessMsg message={success} />} 

                        {selectedConcierge ? (
                            <div>
                                <div className="columns is-vcentered">
                                    {/* First Column */}
                                    <div className="column">
                                        <div className="staff-space">
                                            <div className="field">
                                                <label className="label">Concierge Type</label>
                                                <div className="control">
                                                    <input
                                                        className="input"
                                                        type="text"
                                                        name="concierge_type"
                                                        value={selectedConcierge.concierge_type}
                                                        readOnly
                                                        onChange={handleDetailChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="field">
                                                <label className="label">Concierge Supplier</label>
                                                <div className="control">
                                                    <input
                                                        className="input"
                                                        type="text"
                                                        name="concierge_supplier"
                                                        value={selectedConcierge.concierge_supplier}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>


                                            <div className="field">
                                                <label className="label">Concierge Supplier Contact Number</label>
                                                <div className="control">
                                                    <input
                                                        className="input"
                                                        type="text"
                                                        name="concierge_phone_no"
                                                        readOnly
                                                        value={selectedConcierge.concierge_phone_no}
                                                       
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                {/* Separator Line */}
                                <hr />

                                <div className="columns">
                                    <div className="column">
                                        <div className="columns">
                                            <h1 className="subtitle">
                                                <strong>Concierge Information</strong>
                                            </h1>
                                        </div>
                                        <div className="columns is-multiline">
                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Concierge Description</label>
                                                    <div className="control">
                                                        <textarea
                                                            className="textarea"
                                                            name="concierge_description"
                                                            readOnly
                                                            value={selectedConcierge.concierge_description}
                                                            onChange={handleDetailChange}
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <label className="label">Concierge Time (Start - End)</label>
                                                <div className="columns">
                                                    <div className="column is-6">
                                                        <input
                                                            className="input"
                                                            type="time"
                                                            name="concierge_start_time"
                                                            value={selectedConcierge.concierge_start_time}
                                                            readOnly
                                                            onChange={handleDetailChange}
                                                        />
                                                    </div>
                                                    <div className="column is-6">
                                                        <input
                                                            className="input"
                                                            type="time"
                                                            name="concierge_end_time"
                                                            readOnly
                                                            value={selectedConcierge.concierge_end_time}
                                                            onChange={handleDetailChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Concierge Duration</label>
                                                    <div className="control is-flex is-align-items-center">
                                                        {/* Decrease Button */}
                                                        <button
                                                            className="button is-blue mr-2"
                                                            
                                                            disabled={selectedConcierge.concierge_duration }
                                                        >
                                                            -
                                                        </button>

                                                        {/* Display Current Duration */}
                                                        <span className="button is-static">
                                                            {selectedConcierge.concierge_duration} {selectedConcierge.concierge_duration === 1 ? 'hour' : 'hours'}
                                                        </span>

                                                        {/* Increase Button */}
                                                        <button
                                                            className="button is-blue ml-2"
                                                            disabled={selectedConcierge.concierge_duration}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Concierge Final Price</label>
                                                    <div className="control">
                                                        <input
                                                            className={`input`}
                                                            type="number"
                                                            name="concierge_type_price"
                                                            value={selectedConcierge.concierge_type_price}
                                                            min="1" // Set the minimum value to 1
                                                            readOnly
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr />

                                <div className="columns">
                                    <div className="column">
                                        <div className="columns">
                                            <h1 className="subtitle">
                                                <strong>Restore Data</strong>
                                            </h1>
                                        </div>
                                        <div className="columns is-multiline is-mobile">
                                            <div className="column">
                                            <p>To ensure continuity and accurate data management, previously archived data can be restored when necessary. Restoring data involves reactivating the associated information so it can be accessed and managed as active data. This process ensures that all historical data is preserved and remains intact, enabling seamless reintegration into the system. Restoration allows the data to be utilized for future operations, monitoring, and reporting while maintaining the integrity of the original information.</p>                                           
                                            </div>
                                            <div className="column is-12 is-left">
                                                <button className="button is-blue" onClick={() => setIsArchiving(true)}>Restore</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {isArchiving && (
                                    <div className="modal is-active">
                                        <div className="modal-background" onClick={() => setIsArchiving(false)}></div>
                                        <div className="modal-content">
                                            <div className="box">
                                                <p>Are you sure you want to restore this concierge?</p>
                                                <div className="buttons is-right">
                                                    <button className="button is-blue" onClick={handleArchive}>Yes</button>
                                                    <button className="button" onClick={() => setIsArchiving(false)}>No</button>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="modal-close is-large" aria-label="close" onClick={() => setIsArchiving(false)}></button>
                                    </div>
                                )}
                                <hr />
                            </div>
                        ) : (
                            <div>
                                <p>No concierge selected. Click on a concierge to view details.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </section>
    );
};

export default ArchConcierge;
