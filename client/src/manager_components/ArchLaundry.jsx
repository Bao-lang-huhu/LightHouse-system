import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_m.css';
import { IoSearchCircle, IoShirtOutline } from 'react-icons/io5';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg'; // Import Error Message Component
import SuccessMsg from '../messages/successMsg'; // Import Success Message Component

const ArchLaundry = () => {
    const [laundryList, setLaundryList] = useState([]); // State to store laundry data
    const [selectedLaundry, setSelectedLaundry] = useState(null); // State for the selected laundry
    const [searchTerm, setSearchTerm] = useState(''); // State for search term
    const [error, setError] = useState(''); // State for error messages
    const [success, setSuccess] = useState(''); // State for success messages
    const [isArchiving, setIsArchiving] = useState(false); // State for archive confirmation

        const fetchLaundry = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/getLaundry'); // Replace with your API endpoint
                setLaundryList(response.data); // Set the fetched laundry data to state
            } catch (error) {
                console.error('Error fetching laundry data:', error);
                setError('Failed to fetch laundry data.');
            }
        };

    useEffect(() => {
        fetchLaundry();
    }, []);


    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'green'; // Green for active
            case 'INACTIVE':
                return 'red'; // Red for inactive
            case 'DELETE':
                return 'gray'; // Gray for deleted
            default:
                return 'gray'; // Default color if no status matches
        }
    };

    // Handle laundry click
    const handleLaundryClick = (laundry) => {
        setSelectedLaundry(laundry); // Set the clicked laundry as selected
        setError('');
        setSuccess('');
    };

    // Handle input change in the detail view
    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setSelectedLaundry((prev) => ({ ...prev, [name]: value }));
    };


    // Handle archive of laundry
    const handleArchive = async () => {
        setIsArchiving(false);
        try {
            setError('');
            setSuccess('');
            const response = await axios.put(`http://localhost:3001/api/updateLaundry/${selectedLaundry.laundry_id}`, { laundry_status: 'ACTIVE' });
            
            if (response.status === 200) {
                setSuccess('Laundry item restored successfully!');
                setError('');

                setLaundryList(prevLaundry => prevLaundry.filter(laundry => laundry.laundry_id !== selectedLaundry.laundry_id));
                setSelectedLaundry(null);
                
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to restore laundry.');
            }
        } catch (error) {
            console.error('Error archiving laundry:', error.message);
            setError('Failed to archive laundry.');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Filter laundry based on search term and exclude "DELETE" status
    const filteredLaundry = laundryList.filter(
        (laundry) =>
            laundry.laundry_item.toLowerCase().includes(searchTerm.toLowerCase()) &&
            laundry.laundry_status === 'DELETE'
    );

    return (
        <section className='section-p1'>
            <div className="columns" style={{ minHeight: "100vh" }}>
                <div className="column is-3">
                    <div className="column">
                        <div className='columns is-vcentered tablet-column-layout'>
                            <div className='column'>
                                <h1 className='subtitle'>
                                    <strong>Laundry</strong>
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

                    {/* Laundry List */}
                    <div style={{ marginBottom: "5px" }}>
                        {filteredLaundry.map((laundry) => (
                            <div
                                key={laundry.laundry_id}
                                className={`staff-space ${selectedLaundry && selectedLaundry.laundry_id === laundry.laundry_id ? 'is-active' : ''}`} // Highlight selected laundry
                                onClick={() => handleLaundryClick(laundry)} // Handle laundry click
                                style={{ cursor: 'pointer',  padding: '1rem', backgroundColor: selectedLaundry?.laundry_id === laundry.laundry_id ? '#e8f4ff' : 'transparent' 
                                }} // Add cursor pointer
                            >
                                <div className="columns is-vcentered is-mobile" style={{ paddingLeft: "5px" }}>
                                    <IoShirtOutline style={{ marginRight: '5px', textAlign: 'center' }} />
                                    <div className="column is-flex is-align-items-center">
                                        <h3 style={{ marginRight: "8px" }}>
                                            {laundry.laundry_item}
                                        </h3>
                                        <div
                                            className="status-circle"
                                            style={{
                                                backgroundColor: getStatusColor(laundry.laundry_status), // Color based on status
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
                                <strong>Laundry Details</strong>
                            </h1>
                        </div>

                        {error && <ErrorMsg message={error} />}
                        {success && <SuccessMsg message={success} />}

                        {selectedLaundry ? (
                            <div className="section-m1">
                                <div className="columns is-vcentered">
                                    {/* First Column */}
                                    <div className="column is-one-half">
                                        <div className="staff-space">
                                            <div className="field">
                                                <label className="label">Laundry Item</label>
                                                <div className="control">
                                                    <input
                                                        className="input"
                                                        type="text"
                                                        name="laundry_item"
                                                        value={selectedLaundry.laundry_item}
                                                        onChange={handleDetailChange}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>

                                        <div className="field">
                                            <label className="label">Laundry Price</label>
                                            <div className="control">
                                                <input
                                                    className="input"
                                                    type="text" 
                                                    name="laundry_ironing_price"
                                                    value={selectedLaundry.laundry_ironing_price}
                                                    readOnly
                                                    required
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
                                {/* Confirmation Modal for Archiving */}
                                {isArchiving && (
                                    <div className="modal is-active">
                                        <div className="modal-background" onClick={() => setIsArchiving(false)}></div>
                                        <div className="modal-content">
                                            <div className="box">
                                                <p>Are you sure you want to restore this laundry item?</p>
                                                <div className="buttons is-right">
                                                    <button className="button is-blue" onClick={handleArchive}>Yes</button>
                                                    <button className="button" onClick={() => setIsArchiving(false)}>No</button>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="modal-close is-large" aria-label="close" onClick={() => setIsArchiving(false)}></button>
                                    </div>
                                )}
                                {/* Separator Line */}
                                <hr />
                            </div>

                        ) : (
                            <div>
                                <p>No laundry item selected. Click on a laundry item to view details.</p>
                            </div>
                        )}
                    </main>
                </div>
          </div>
        </section>
    );
};

export default ArchLaundry;
