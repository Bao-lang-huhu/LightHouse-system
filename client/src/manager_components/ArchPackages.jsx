import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_m.css';
import { IoSearchCircle, IoFastFoodOutline } from 'react-icons/io5';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg'; 
import SuccessMsg from '../messages/successMsg'; 

const ArchPackages = () => {
    const [foodPackages, setFoodPackages] = useState([]); // State to store food packages data
    const [selectedPackage, setSelectedPackage] = useState(null); // State for the selected food package
    const [searchTerm, setSearchTerm] = useState(''); // State for search term
    const [error, setError] = useState(''); // State for error messages
    const [success, setSuccess] = useState(''); // State for success messages
    const [isArchiving, setIsArchiving] = useState(false); // State for archive confirmation

    // Fetch food packages data on component mount
        const fetchFoodPackages = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/getFoodPackage'); // Replace with your API endpoint
                setFoodPackages(response.data); // Set the fetched food packages data to state
            } catch (error) {
                console.error('Error fetching food packages:', error);
                setError('Failed to fetch food packages data.');
            }
        };

    useEffect(() => {
        fetchFoodPackages();
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

    // Handle food package click
    const handlePackageClick = (foodPackage) => {
        setSelectedPackage(foodPackage); // Set the clicked food package as selected
        setError('');
        setSuccess('');
    };

    // Handle input change in the detail view
    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setSelectedPackage((prev) => ({ ...prev, [name]: value }));
    };


    // Handle archive of food package
    const handleArchive = async () => {
        setIsArchiving(false);
        try {
            setError('');
            setSuccess('');
            const response = await axios.put(`http://localhost:3001/api/updateFoodPackage/${selectedPackage.event_fd_pckg_id}`, 
                { event_fd_status: 'ACTIVE' });

            if (response.status === 200) {
                setSuccess('Food package restored successfully!');
                // Remove from list
                setFoodPackages((prev) =>
                    prev.map((pkg) =>
                        pkg.event_fd_pckg_id === selectedPackage.event_fd_pckg_id
                            ? { ...pkg, event_fd_status: 'ACTIVE' } 
                            : pkg
                    )
                );
                setSelectedPackage(null);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to restore food package.');
            }
        } catch (error) {
            setError('Failed to restoring food package.');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Filter food packages based on search term and exclude "DELETE" status
    const filteredPackages = foodPackages.filter(
        (pkg) =>
            pkg.event_fd_pckg_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            pkg.event_fd_status === 'DELETE'
    );

    return (
        <section className='section-p1'>
            <div className="columns" style={{ minHeight: "100vh" }}>
                <div className="column is-3">
                    <div className="column">
                        <div className='columns is-vcentered tablet-column-layout'>
                            <div className='column'>
                                <h1 className='subtitle'>
                                    <strong>Food Packages</strong>
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

                    {/* Food Package List */}
                    <div style={{ marginBottom: "5px" }}>
                        {filteredPackages.map((pkg) => (
                            <div
                                key={pkg.event_fd_pckg_id}
                                className={`staff-space ${selectedPackage && selectedPackage.event_fd_pckg_id === pkg.event_fd_pckg_id ? 'is-active' : ''}`} // Highlight selected food package
                                onClick={() => handlePackageClick(pkg)} // Handle food package click
                                style={{ cursor: 'pointer', padding: '1rem', backgroundColor: selectedPackage && selectedPackage.event_fd_pckg_id === pkg.event_fd_pckg_id ? '#e8f4ff' : 'transparent' }} // Add cursor pointer
                            >
                                <div className="columns is-vcentered is-mobile" style={{ paddingLeft: "5px" }}>
                                    <IoFastFoodOutline style={{ marginRight: '5px', textAlign: 'center' }} />
                                    <div className="column is-flex is-align-items-center">
                                        <h3 style={{ marginRight: "8px" }}>
                                            {pkg.event_fd_pckg_name}
                                        </h3>
                                        <div
                                            className="status-circle"
                                            style={{
                                                backgroundColor: getStatusColor(pkg.event_fd_status), 
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
                                <strong>Food Package Details</strong>
                            </h1>
                        </div>

                        {error && <ErrorMsg message={error} />}
                        {success && <SuccessMsg message={success} />}

                        {selectedPackage ? (
                            <div className="section-m1">
                                <div className="columns is-vcentered">
                                    {/* First Column */}
                                    <div className="column is-one-half">
                                        <div className="staff-space">
                                            <div className="field">
                                                <label className="label">Package Name</label>
                                                <div className="control">
                                                    <input
                                                        className="input"
                                                        type="text"
                                                        name="event_fd_pckg_name"
                                                        readOnly
                                                        value={selectedPackage.event_fd_pckg_name}
                                                        onChange={handleDetailChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Second Column */}
                                    <div className="column is-one-half">
                                        <div className="staff-space">
                                            <div className="field">
                                                <label className="label">Package Final Price</label>
                                                <div className="control">
                                                    <input
                                                        className="input"
                                                        type="text" // Use text to handle better input control
                                                        name="event_fd_pckg_final_price"
                                                        value={selectedPackage.event_fd_pckg_final_price}
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
                                                <strong>Food Package Information</strong>
                                            </h1>
                                        </div>
                                        <div className='columns is-multiline'>
                                            {/* Main Dish Limit */}
                                            <div className='column is-6'>
                                                <div className="field">
                                                    <label className="label">Main Dish Limit</label>
                                                    <div className="control is-flex is-align-items-center">
                                                        {/* Decrease Button */}
                                                        <button
                                                            className="button is-blue mr-2"
                                                            
                                                            disabled={selectedPackage.event_fd_main_dish_lmt}
                                                        >
                                                            -
                                                        </button>

                                                        {/* Display Current Limit */}
                                                        <span className="button is-static">
                                                            {selectedPackage.event_fd_main_dish_lmt}
                                                        </span>

                                                        {/* Increase Button */}
                                                        <button
                                                            className="button is-blue ml-2"
                                                            
                                                            disabled={selectedPackage.event_fd_main_dish_lmt }
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pasta Limit */}
                                            <div className='column is-6'>
                                                <div className="field">
                                                    <label className="label">Pasta Limit</label>
                                                    <div className="control is-flex is-align-items-center">
                                                        {/* Decrease Button */}
                                                        <button
                                                            className="button is-blue mr-2"
                                                            
                                                            disabled={selectedPackage.event_fd_pasta_lmt }
                                                        >
                                                            -
                                                        </button>

                                                        {/* Display Current Limit */}
                                                        <span className="button is-static">
                                                            {selectedPackage.event_fd_pasta_lmt}
                                                        </span>

                                                        {/* Increase Button */}
                                                        <button
                                                            className="button is-blue ml-2"
                                                            
                                                            disabled={selectedPackage.event_fd_pasta_lmt }
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="columns is-multiline">
                                            {/* Rice Limit */}
                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Rice Limit</label>
                                                    <div className="control is-flex is-align-items-center">
                                                        <button className="button is-blue mr-2" 
                                                           
                                                            disabled={selectedPackage.event_fd_rice_lmt }
                                                        >
                                                            -
                                                        </button>
                                                        <span className="button is-static">
                                                            {selectedPackage.event_fd_rice_lmt}
                                                        </span>
                                                        <button className="button is-blue ml-2" 
                                                            
                                                            disabled={selectedPackage.event_fd_rice_lmt}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dessert Limit */}
                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Dessert Limit</label>
                                                    <div className="control is-flex is-align-items-center">
                                                        <button className="button is-blue mr-2"
                                                            
                                                            disabled={selectedPackage.event_fd_dessert_lmt}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="button is-static">
                                                            {selectedPackage.event_fd_dessert_lmt}
                                                        </span>
                                                        <button className="button is-blue ml-2"
                                                           
                                                            disabled={selectedPackage.event_fd_dessert_lmt}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Drink Limit */}
                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Drink Limit</label>
                                                    <div className="control is-flex is-align-items-center">
                                                        <button className="button is-blue mr-2"
                                                           
                                                            disabled={selectedPackage.event_fd_drinks_lmt }
                                                        >
                                                            -
                                                        </button>
                                                        <span className="button is-static">
                                                            {selectedPackage.event_fd_drinks_lmt}
                                                        </span>
                                                        <button className="button is-blue ml-2"
                                                            
                                                            disabled={selectedPackage.event_fd_drinks_lmt }
                                                        >
                                                            +
                                                        </button>
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
                                {/* Confirmation Modal for Archiving */}
                                {isArchiving && (
                                    <div className="modal is-active">
                                        <div className="modal-background" onClick={() => setIsArchiving(false)}></div>
                                        <div className="modal-content">
                                            <div className="box">
                                                <p>Are you sure you want to restore this food package?</p>
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
                                <p>No food package selected. Click on a package to view details.</p>
                            </div>
                        )}
                    </main>
                </div>
         </div>
        </section>
    );
};

export default ArchPackages;
