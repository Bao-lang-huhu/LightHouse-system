import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_m.css';
import { IoPerson, IoSearchCircle,  } from 'react-icons/io5';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';
import axios from 'axios';

const ArchAccounts = () => {
    const [staffPhoto, setStaffPhoto] = useState(null);
    const [staffPhotoPreview, setStaffPhotoPreview] = useState(null); 
    const [staffList, setStaffList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isArchiving, setIsArchiving] = useState(false); 

    // Define the function to fetch staff data
    const fetchStaffData = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/getStaffs');
            setStaffList(response.data.filter(staff => staff.staff_status === 'DELETE'));
        } catch (error) {
            console.error('Error fetching staff data:', error);
        }
    };

    useEffect(() => {
        fetchStaffData();
    }, []);

    const handleStaffClick = (staff) => {
        setStaffPhoto(null);
        setStaffPhotoPreview(null);
        setSelectedStaff({
            staff_id: staff.staff_id || '',
            staff_fname: staff.staff_fname || '',
            staff_lname: staff.staff_lname || '',
            staff_username: staff.staff_username || '',
            staff_email: staff.staff_email || '',
            staff_phone_no: staff.staff_phone_no || '',
            staff_gender: staff.staff_gender || '',
            shift_start_time: staff.shift_start_time || '',
            shift_end_time: staff.shift_end_time || '',
            staff_hire_date: staff.staff_hire_date || '',
            staff_photo: staff.staff_photo || '',
            staff_acc_role: staff.staff_acc_role || '',
            staff_status: staff.staff_status || ''
        });
        setError('');
        setSuccess('');
    };
    
    

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'green'; // Green for active
            case 'INACTIVE':
                return 'red'; // Red for inactive
            case 'ON_LEAVE':
                return 'yellow';
            default:
                return 'gray'; 
        }
    };

    const formatAccountRole = (role) => {
        switch (role) {
            case 'manager':
                return 'Manager';
            case 'barDesk':
                return 'Bar';
            case 'frontDesk':
                return 'Front';
            case 'restaurantDesk':
                return 'Restaurant';
            default:
                return role; 
        }
    };

    const handleArchive = async () => {
        setIsArchiving(false); 

        try {
            setError('');
            setSuccess('');

            const response = await axios.put(
                `http://localhost:3001/api/updateStaff/${selectedStaff.staff_id}`, 
                {
                    staff_id: selectedStaff.staff_id, 
                    staff_status: 'ACTIVE'         
                }
            );

            if (response.status === 200) {
                setSuccess('Staff restored successfully!');
                setError('');

                setStaffList(prevStaffList => prevStaffList.filter(staff => staff.staff_id !== selectedStaff.staff_id));
                setSelectedStaff(null);

                setTimeout(() => {
                    setSuccess('');
                }, 3000);
            }
        } catch (error) {
            console.error('Error archiving staff:', error.response?.data || error.message);
            setError('Failed to archive staff: ' + (error.response?.data?.error || error.message));
            setSuccess('');
        }
    };

    return (
        <section className='section-p1'>
            <div className="columns" style={{ minHeight: "100vh" }}>
                <div className="column is-3">
                    <div className="column">
                        <div className='columns is-vcentered tablet-column-layout'>
                            <div className='column'>
                                <h1 className='subtitle'>
                                    <strong>Staffs</strong>
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

                    {/* Staff List */}
                    <div style={{ marginBottom: "5px" }}>
                        {staffList
                            .filter(staff =>
                                staff.staff_fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                staff.staff_lname.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((staff) => (
                                <div 
                                    className="staff-space" 
                                    key={staff.staff_id} 
                                    onClick={() => handleStaffClick(staff)} // Handle staff click
                                    style={{
                                        cursor: 'pointer', padding: '1rem',
                                        backgroundColor: selectedStaff?.staff_id === staff.staff_id ? '#e8f4ff' : 'transparent' 
                                    }}
                                >
                                    <div className="columns is-vcentered is-mobile" style={{ paddingLeft: "5px" }}>
                                        <IoPerson style={{ marginRight: '5px', textAlign: 'center' }} />
                                        <div className="column is-flex is-align-items-center">
                                            <h3 style={{ marginRight: "8px" }}>
                                                {formatAccountRole(staff.staff_acc_role)} - {staff.staff_fname} {staff.staff_lname}
                                            </h3>
                                            <div
                                                className="status-circle"
                                                style={{
                                                    backgroundColor: getStatusColor (staff.staff_status), 
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
                                <strong>Staff Details</strong>
                            </h1>
                        </div>

                        {error && <ErrorMsg message={error} />}
                        {success && <SuccessMsg message={success} />}

                        {selectedStaff ? (
                            <div>
                                <div className="columns is-vcentered">
                                    {/* First Column for Photo */}
                                    <div className="column is-narrow">
                                        <div className="column is-one-half">
                                            <div className="staff-space">
                                                {staffPhotoPreview ? (
                                                    <img
                                                        src={staffPhotoPreview}
                                                        alt={selectedStaff.staff_lname && selectedStaff.staff_fname}
                                                        style={{ width: '150px', height: '150px', borderRadius: '8px' }}
                                                    />
                                                ) : selectedStaff.staff_photo && (
                                                    <img
                                                        src={selectedStaff.staff_photo}
                                                        alt={selectedStaff.staff_lname}
                                                        style={{ width: '150px', height: '150px', borderRadius: '8px' }}
                                                    />
                                                )}
                                                <div className='field'>
                                                <label className="label">Staff Photo</label>
                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                    {/* Second Column for Details */}
                                    <div className="column is-one-half">
                                        <div className="columns is-multiline is-mobile">
                                            <div className="staff-space">
                                                <div className="control-form">
                                                    <label className="label">Staff ID</label>
                                                    <p className='ml-2'>{selectedStaff.staff_id}</p>
                                                </div>
                                                <div className="control-form">
                                                    <label className="label">Name</label>
                                                    <p className='ml-2'>{selectedStaff.staff_fname} {selectedStaff.staff_lname}</p>
                                                </div>
                                                <div className="control-form">
                                                    <label className="label">Email</label>
                                                    <p className='ml-2'>{selectedStaff.staff_email}</p>
                                                </div>
                                                <div className="control-form">
                                                    <label className="label">Gender</label>
                                                    <p className='ml-2'>{selectedStaff.staff_gender}</p>
                                                </div >
                                                <div className="control-form">
                                                    <label className="label">Contact Number</label>
                                                    <p className='ml-2'
                                                    >{selectedStaff.staff_phone_no}</p>
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
                                                <strong>Employee Information</strong>
                                            </h1>
                                        </div>
                                        <div className="columns is-multiline">
                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Hire Date</label>
                                                    <div className="control">
                                                        <input 
                                                            className="input" 
                                                            type="date" 
                                                            readOnly
                                                            value={selectedStaff.staff_hire_date || ''} 
                                                            onChange={(e) => setSelectedStaff({...selectedStaff, staff_hire_date: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Account Role</label>
                                                    <div className="control">
                                                      
                                                        <input 
                                                            className="input" 
                                                            type="text" 
                                                            readOnly
                                                            value={selectedStaff?.staff_acc_role || ''} // Use selectedStaff state
                                                                onChange={(e) => setSelectedStaff({ 
                                                                    ...selectedStaff, 
                                                                    staff_acc_role: e.target.value 
                                                                })} 
                                                        />
                                                    
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <label className="label">Shift Time</label>
                                                <div className="columns">
                                                    <div className="column is-6">
                                                        <input 
                                                            className="input" 
                                                            type="time" 
                                                            readOnly
                                                            value={selectedStaff.shift_start_time || ''} 
                                                            onChange={(e) => setSelectedStaff({...selectedStaff, shift_start_time: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="column is-6">
                                                        <input 
                                                            className="input" 
                                                            type="time" 
                                                            readOnly
                                                            value={selectedStaff.shift_end_time || ''} 
                                                            onChange={(e) => setSelectedStaff({...selectedStaff, shift_end_time: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Username</label>
                                                    <div className="control">
                                                        <input 
                                                            className="input" 
                                                            type="text" 
                                                            readOnly
                                                            value={selectedStaff.staff_username || ''} 
                                                            onChange={(e) => setSelectedStaff({...selectedStaff, staff_username: e.target.value})}
                                                        />
                                                    </div>
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
                                            <p>To ensure continuity and accurate data management, previously archived data can be restored when necessary. Restoring data involves reactivating the associated information so it can be accessed and managed as active data. This process ensures that all historical data is preserved and remains intact, enabling seamless reintegration into the system. Restoration allows the data to be utilized for future operations, monitoring, and reporting while maintaining the integrity of the original information.</p>                                            </div>
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
                                                <p>Are you sure you want to restore this staff?</p>
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
                            <p>No staff selected. Please click on a staff name to view details.</p>
                        )}
                    </main>
                </div> 
            </div>
        </section>
    );
};

export default ArchAccounts;
