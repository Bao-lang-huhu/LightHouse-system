import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_m.css';
import { IoSearchCircle, IoLocationSharp } from 'react-icons/io5';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg'; 
import SuccessMsg from '../messages/successMsg'; 

const ArchVenues = () => {
    const [venues, setVenues] = useState([]); 
    const [selectedVenue, setSelectedVenue] = useState(null); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [error, setError] = useState(''); 
    const [success, setSuccess] = useState(''); 
    const [isArchiving, setIsArchiving] = useState(false); 

        const fetchVenues = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/getVenue'); // Replace with your API endpoint
                setVenues(response.data); 
            } catch (error) {
                console.error('Error fetching venue data:', error);
                setError('Failed to fetch venue data.');
            }
        };

    useEffect(() => {
        fetchVenues();
    }, []);


    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'green'; // Green for active
            case 'INACTIVE':
                return 'red'; // Red for inactive
            default:
                return 'gray'; // Default color if no status matches
        }
    };

    // Handle venue click
    const handleVenueClick = (venue) => {
        setSelectedVenue(venue); // Set the clicked venue as selected
        setError('');
        setSuccess('');
    };

    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setSelectedVenue((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'venue_price' || name === 'event_disc_percentage') && {
                venue_final_price: calculateFinalPrice(
                    name === 'venue_price' ? value : prev.venue_price,
                    name === 'event_disc_percentage' ? value : prev.event_disc_percentage
                )
            }
        }));
    };

    const calculateFinalPrice = (price, discount) => {
        const priceValue = parseFloat(price || 0);
        const discountValue = parseFloat(discount || 0);
        const discountAmount = priceValue * (discountValue / 100);
        return priceValue - discountAmount;
    };

    // Handle archive of venue
    const handleArchive = async () => {
        setIsArchiving(false);
        try {
            setError('');
            setSuccess('');
            const response = await axios.put(`http://localhost:3001/api/updateVenue/${selectedVenue.event_venue_id}`, { venue_status: 'ACTIVE' });

            if (response.status === 200) {
                setSuccess('Venue restored successfully!');
                // Remove from list
                setVenues((prev) =>
                    prev.filter((venue) => venue.event_venue_id !== selectedVenue.event_venue_id)
                );
                setSelectedVenue(null);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to restore venue.');
            }
        } catch (error) {
            console.error('Error restoring venue:', error.message);
            setError('Failed to restore venue.');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Filter venues based on search term and exclude "DELETE" status
    const filteredVenues = venues.filter(
        (venue) =>
            venue.venue_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            venue.venue_status === 'DELETE'
    );

    return (
        <section className='section-p1'>
            <div className="columns" style={{ minHeight: "100vh" }}>
                <div className="column is-3">
                    <div className="column">
                        <div className='columns is-vcentered tablet-column-layout'>
                            <div className='column'>
                                <h1 className='subtitle'>
                                    <strong>Venues</strong>
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

                    {/* Venue List */}
                    <div style={{ marginBottom: "5px" }}>
                        {filteredVenues.map((venue) => (
                            <div
                                key={venue.event_venue_id}
                                className={`staff-space ${selectedVenue && selectedVenue.event_venue_id === venue.event_venue_id ? 'is-active' : ''}`} // Highlight selected venue
                                onClick={() => handleVenueClick(venue)} // Handle venue click
                                style={{ cursor: 'pointer', padding: '1rem', backgroundColor: selectedVenue && selectedVenue.event_venue_id === venue.event_venue_id ? '#e8f4ff' : 'transparent' }} // Add cursor pointer
                            >
                                <div className="columns is-vcentered is-mobile" style={{ paddingLeft: "5px" }}>
                                    <IoLocationSharp style={{ marginRight: '5px', textAlign: 'center' }} />
                                    <div className="column is-flex is-align-items-center">
                                        <h3 style={{ marginRight: "8px" }}>
                                            {venue.venue_name}
                                        </h3>
                                        <div
                                            className="status-circle"
                                            style={{
                                                backgroundColor: getStatusColor(venue.venue_status), 
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
                                <strong>Venue Details</strong>
                            </h1>
                        </div>

                        {error && <ErrorMsg message={error} />}
                        {success && <SuccessMsg message={success} />}

                        {selectedVenue ? (
                            <div className="section-m1">
                                <div className="columns is-vcentered">
                                    {/* First Column */}
                                    <div className="column is-one-half">
                                        <div className="staff-space">
                                            <div className="field">
                                                <label className="label">Venue Name</label>
                                                <div className="control">
                                                    <input
                                                        className="input"
                                                        type="text"
                                                        name="venue_name"
                                                        value={selectedVenue.venue_name}
                                                        onChange={handleDetailChange}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                            <div className="field">
                                                <label className="label">Venue Description</label>
                                                <div className="control">
                                                    <textarea
                                                        className="textarea"
                                                        name="venue_description"
                                                        value={selectedVenue.venue_description}
                                                        onChange={handleDetailChange}
                                                        readOnly
                                                    ></textarea>
                                                </div>
                                            </div>
                                          
                                        </div>
                                    </div>

                                    {/* Second Column */}
                                    <div className="column is-one-half">
                                        <div className="staff-space">
                                            {/* Maximum PAX with - and + Buttons */}
                                            <div className="field">
                                                <label className="label">Maximum PAX</label>
                                                <div className="control is-flex is-align-items-center">
                                                    {/* Decrease Button */}
                                                    <button
                                                        className="button is-blue mr-2"
                                                       
                                                        disabled={selectedVenue.venue_max_pax}
                                                    >
                                                        -
                                                    </button>

                                                    {/* Display Current PAX */}
                                                    <span className="button is-static">
                                                        {selectedVenue.venue_max_pax} guests
                                                    </span>

                                                    {/* Increase Button */}
                                                    <button
                                                        className="button is-blue ml-2"
                                                       
                                                        disabled={selectedVenue.venue_max_pax}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Venue Price */}
                                    <div className="field">
                                        <label className="label">Venue Price</label>
                                        <div className="control">
                                            <input
                                                className="input"
                                                type="text" 
                                                name="venue_price"
                                                value={selectedVenue.venue_price}
                                                readOnly
                                            />
                                        </div>
                                    </div>


                                            {/* Discount Percentage */}
                                            <div className="field">
                                                <label className="label">Discount Percentage</label>
                                                <div className="control is-flex is-align-items-center">
                                                    {/* Decrease Button */}
                                                    <button
                                                        className="button is-blue mr-2"
                                                      
                                                        disabled={selectedVenue.event_disc_percentage}
                                                    >
                                                        -
                                                    </button>

                                                    {/* Display Current Discount */}
                                                    <span className="button is-static">
                                                        {selectedVenue.event_disc_percentage}%
                                                    </span>

                                                    {/* Increase Button */}
                                                    <button
                                                        className="button is-blue ml-2"
                                                       
                                                        disabled={selectedVenue.event_disc_percentage}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Final Price */}
                                            <div className="field">
                                                <label className="label">Final Price</label>
                                                <div className="control">
                                                    <input
                                                        className="input"
                                                        type="number"
                                                        name="venue_final_price"
                                                        value={selectedVenue.venue_final_price.toFixed(2)}
                                                        readOnly
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
                                                    <p>Are you sure you want to restore this venue?</p>
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
                                <p>No venue selected. Click on a venue to view details.</p>
                            </div>
                        )}
                    </main>
                </div>
         </div>
        </section>
    );
};

export default ArchVenues;