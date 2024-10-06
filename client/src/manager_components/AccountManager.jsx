import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_m.css';
import { IoAdd, IoPerson, IoSearchCircle } from 'react-icons/io5';
import AddStaffModal from '../manager_modals/AddStaffModal';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';
import axios from 'axios';

const AccountManager = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [staffPhoto, setStaffPhoto] = useState(null);
    const [staffPhotoPreview, setStaffPhotoPreview] = useState(null); 
    const [staffList, setStaffList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isArchiving, setIsArchiving] = useState(false); // State to manage the archiving confirmation

    useEffect(() => {
        const fetchStaffData = async () => {
            try {
                const response = await axios.get('https://light-house-system.vercel.app/api/getStaffs');
                setStaffList(response.data.filter(staff => staff.staff_status !== 'DELETE'));
            } catch (error) {
                console.error('Error fetching staff data:', error);
            }
        };

        fetchStaffData();
    }, []);

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileType = file.type.toLowerCase();
            const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            const maxSizeInMB = 3; 
    
            if (!validImageTypes.includes(fileType)) {
                setError('Only JPEG, JPG, and PNG files are allowed.');
                setStaffPhoto(null); 
                setStaffPhotoPreview(null);
                return;
            }
    
            if (file.size / (1024 * 1024) > maxSizeInMB) {
                setError('File size exceeds 3 MB. Please upload a smaller file.');
                setStaffPhoto(null);
                setStaffPhotoPreview(null);
                return; 
            }
    
            const reader = new FileReader();
            reader.onloadend = () => {
                setStaffPhoto(reader.result); 
                setStaffPhotoPreview(reader.result); 
                setSelectedStaff((prev) => ({ ...prev, staff_photo: reader.result }));
                setError(''); 
            };
            reader.readAsDataURL(file); 
        }
    };
    
    const handleSaveChanges = async () => {
        try {
            setError('');
            setSuccess('');
    
            const requiredFields = ['staff_fname', 'staff_lname', 'staff_username', 'staff_email', 'staff_phone_no', 'staff_acc_role', 'staff_status'];
            for (const field of requiredFields) {
                if (!selectedStaff[field] || selectedStaff[field].trim() === '') {
                    setError(`Please fill in the ${field.replace('staff_', '').replace('_', ' ')} field.`);
                    return; 
                }
            }
    
            const updatedStaff = {
                ...selectedStaff,
                staff_fname: selectedStaff.staff_fname || '',
                staff_lname: selectedStaff.staff_lname || '',
                staff_username: selectedStaff.staff_username || '',
                staff_email: selectedStaff.staff_email || '',
                staff_phone_no: selectedStaff.staff_phone_no || '',
                staff_gender: selectedStaff.staff_gender || '',
                shift_start_time: selectedStaff.shift_start_time || '',
                shift_end_time: selectedStaff.shift_end_time || '',
                staff_hire_date: selectedStaff.staff_hire_date || '',
                staff_photo: selectedStaff.staff_photo || '',
                staff_acc_role: selectedStaff.staff_acc_role || '',
                staff_status: selectedStaff.staff_status || ''
            };
    
            const response = await axios.put(`https://light-house-system.vercel.app/api/updateStaff/${selectedStaff.staff_id}`, updatedStaff);
    
            if (response.status === 200) {
                setSuccess('Staff details updated successfully!');
                setError('');
    
                setStaffList(prevStaffList =>
                    prevStaffList.map(staff =>
                        staff.staff_id === selectedStaff.staff_id ? { ...staff, ...updatedStaff } : staff
                    )
                );
    
                setTimeout(() => {
                    setSuccess('');
                }, 3000);
            }
        } catch (error) {
            console.error('Error updating staff:', error.response?.data || error.message);
            setError('Failed to update staff: ' + (error.response?.data?.error || error.message));
            setSuccess('');
        }
    };
    
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleStaffClick = (staff) => {
        setStaffPhoto(null);
        setStaffPhotoPreview(null);
        // Check and set all fields to avoid undefined
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
    
    const handleChangePassword = async () => {
        if (newPassword.trim() === '') {
            setError('New password cannot be empty.');
            return;
        }
    
        try {
            setError('');
            setSuccess('');
    
            const response = await axios.put(
                `https://light-house-system.vercel.app/api/updateStaff/${selectedStaff.staff_id}`, 
                { 
                    staff_password: newPassword
                }
            );
    
            if (response.status === 200) {
                setSuccess('Password updated successfully!');
                setError('');
                setNewPassword('');
    
                setTimeout(() => {
                    setSuccess('');
                }, 3000);
            }
        } catch (error) {
            console.error('Error changing password:', error.response?.data || error.message);
            setError('Failed to change password: ' + (error.response?.data?.error || error.message));
            setSuccess('');
        }
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
                return 'gray'; // Default color if no status matches
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
                return role; // Default to the original role if no match
        }
    };

    const handleArchive = async () => {
        setIsArchiving(false); // Hide the confirmation dialog

        try {
            setError('');
            setSuccess('');

            const response = await axios.put(
                `https://light-house-system.vercel.app/api/updateStaff/${selectedStaff.staff_id}`, 
                {
                    staff_id: selectedStaff.staff_id, 
                    staff_status: 'DELETE'         
                }
            );

            if (response.status === 200) {
                setSuccess('Staff archived successfully!');
                setError('');

                // Remove the archived staff from the list
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
                            <div className='column is-narrow'>
                                <button className='button is-blue' onClick={toggleModal}>
                                    <IoAdd style={{ marginRight: '5px' }} /> Add
                                </button>
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
                                                <p>Only 3 MB photos in file types JPEG, JPG, and PNG</p>
                                                    <div className="control">
                                                        <input
                                                            className="input"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handlePhotoChange}
                                                        />
                                                    </div>
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
                                                    <p>{selectedStaff.staff_id}</p>
                                                </div>
                                                <div className="control-form">
                                                    <label className="label">Name</label>
                                                    <p>{selectedStaff.staff_fname} {selectedStaff.staff_lname}</p>
                                                </div>
                                                <div className="control-form">
                                                    <label className="label">Email</label>
                                                    <p>{selectedStaff.staff_email}</p>
                                                </div>
                                                <div className="control-form">
                                                    <label className="label">Gender</label>
                                                    <p>{selectedStaff.staff_gender}</p>
                                                </div>
                                                <div className="control-form">
                                                    <label className="label">Contact Number</label>
                                                    <p>{selectedStaff.staff_phone_no}</p>
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
                                                        <div className="select is-fullwidth">
                                                            <select
                                                                name="staff_acc_role"
                                                                value={selectedStaff?.staff_acc_role || ''} // Use selectedStaff state
                                                                onChange={(e) => setSelectedStaff({ 
                                                                    ...selectedStaff, 
                                                                    staff_acc_role: e.target.value 
                                                                })} // Update the selectedStaff state
                                                                required
                                                            >
                                                                <option value="">Select Account Role</option>
                                                                <option value="manager">Manager</option>
                                                                <option value="frontDesk">Front Desk</option>
                                                                <option value="restaurantDesk">Restaurant Desk</option>
                                                                <option value="barDesk">Bar Desk</option>
                                                            </select>
                                                        </div>
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
                                                            value={selectedStaff.shift_start_time || ''} 
                                                            onChange={(e) => setSelectedStaff({...selectedStaff, shift_start_time: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="column is-6">
                                                        <input 
                                                            className="input" 
                                                            type="time" 
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
                                                            value={selectedStaff.staff_username || ''} 
                                                            onChange={(e) => setSelectedStaff({...selectedStaff, staff_username: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Status</label>
                                                    <div className="control">
                                                        <div className="select is-fullwidth">
                                                            <select 
                                                                value={selectedStaff.staff_status || ''} 
                                                                onChange={(e) => setSelectedStaff({ ...selectedStaff, staff_status: e.target.value })}
                                                            >
                                                                <option value="">Select Status</option> 
                                                                <option value="ACTIVE">ACTIVE</option>
                                                                <option value="ON_LEAVE">ON LEAVE</option>
                                                                <option value="INACTIVE">INACTIVE</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
 
                                        </div>
                                        <div className="columns">
                                            <div className="column is-12 is-left">
                                                <button className="button is-blue" onClick={handleSaveChanges}>Save Changes</button>
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
                                                <strong>Change Password</strong>
                                            </h1>
                                        </div>
                                        <div className="columns is-multiline is-mobile">
                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">New Password</label>
                                                    <div className="control">
                                                        <input 
                                                            className="input" 
                                                            type="password" 
                                                            placeholder="Enter new password" 
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="columns">
                                            <div className="column is-12 is-left">
                                                <button className="button is-blue" onClick={handleChangePassword}>Save Password</button>
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
                                                <strong>Archive Data</strong>
                                            </h1>
                                        </div>
                                        <div className="columns is-multiline is-mobile">
                                            <div className="column">
                                                <p>To ensure data integrity and maintain a clear historical record, all user accounts that are no longer active shall be archived. Archiving an account involves securely storing all associated data, including user information and transaction history, in a read-only format. Archiving does not delete the account or its data but instead preserves it in its current state, safeguarding the integrity of the information while freeing up active account management resources.</p>
                                            </div>
                                            <div className="column is-12 is-left">
                                                <button className="button is-red" onClick={() => setIsArchiving(true)}>Archive</button>
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
                                                <p>Are you sure you want to archive this staff?</p>
                                                <div className="buttons is-right">
                                                    <button className="button is-danger" onClick={handleArchive}>Yes</button>
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

                {/* Add the modal component */}
                <AddStaffModal isOpen={isModalOpen} toggleModal={toggleModal} />
            </div>
        </section>
    );
};

export default AccountManager;
