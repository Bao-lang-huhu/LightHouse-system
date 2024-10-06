import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './modals_m.css';
import axios from 'axios';
import ErrorMsg from '../messages/errorMsg'; 
import SuccessMsg from '../messages/successMsg'; 

const AddStaffModal = ({ isOpen, toggleModal }) => {
    const [staff, setStaff] = useState({
        staff_fname: '',
        staff_lname: '',
        staff_username: '',
        staff_email: '',
        staff_phone_no: '',
        staff_gender: '',
        shift_start_time: '',
        shift_end_time: '',
        staff_hire_date: '',
        staff_photo: '',
        staff_acc_role: '',
        staff_status: 'ACTIVE',
        staff_password: ''
    });

    const [staffPhoto, setStaffPhoto] = useState(null); 
    const [error, setError] = useState(''); 
    const [success, setSuccess] = useState(''); 
    const [erroredFields, setErroredFields] = useState({}); 

    useEffect(() => {
        if (isOpen) {
            setError('');
            setSuccess('');
            setErroredFields({});
        }
    }, [isOpen]);

    const handleClose = () => {
        setStaff({
            staff_fname: '',
            staff_lname: '',
            staff_username: '',
            staff_email: '',
            staff_phone_no: '',
            staff_gender: '',
            shift_start_time: '',
            shift_end_time: '',
            staff_hire_date: '',
            staff_photo: '',
            staff_acc_role: '',
            staff_status: 'ACTIVE',
            staff_password: ''
        });
        setStaffPhoto(null);
        setError('');
        setSuccess('');
        setErroredFields({});
        toggleModal();
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
    
        if (file) {
            // Check file type
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                setError('Please upload a valid image file (PNG, JPEG, JPG).');
                return;
            }
    
            // Check file size (max 3 MB)
            const maxSize = 3 * 1024 * 1024; // 3 MB in bytes
            if (file.size > maxSize) {
                setError('File size should not exceed 5 MB.');
                return;
            }
    
            // If valid, read the file as a base64 string
            const reader = new FileReader();
            reader.onloadend = () => {
                setStaffPhoto(reader.result);
                setStaff({ ...staff, staff_photo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };



    const handleChange = (e) => {
        const { name, value } = e.target;
    
        if (name === 'staff_fname' || name === 'staff_lname') {
            const alphabeticValue = value.replace(/[^a-zA-Z\s'-]/g, '');
            setStaff({ ...staff, [name]: alphabeticValue });
        } 
        else if (name === 'staff_phone_no') {
            // Allow only digits (0-9) to be entered
            const numericValue = value.replace(/[^0-9]/g, '');
            setStaff({ ...staff, [name]: numericValue });
        } else {
            setStaff({ ...staff, [name]: value });
        }
    
        setErroredFields((prev) => ({ ...prev, [name]: false }));
    };
    

    const handleSubmit = async () => {
        setError('');
        setSuccess('');
        setErroredFields({});
    
        // Required fields validation
        const requiredFields = ['staff_fname', 'staff_lname', 'staff_username', 'staff_email', 'staff_phone_no', 'staff_gender', 'staff_acc_role', 'staff_password'];
        const errors = {};
    
        requiredFields.forEach((field) => {
            if (!staff[field] || staff[field].trim() === '') {
                errors[field] = true;
            }
        });
    
        // Password length validation (at least 8 characters)
        if (staff.staff_password && staff.staff_password.length < 8) {
            errors.staff_password = true;
            setError('Password must be at least 8 characters long.');
        }
    
        // Check if there are validation errors
        if (Object.keys(errors).length > 0) {
            setErroredFields(errors);
            setError((prev) => prev || 'Please fill in all required fields.');
            return; // Stop form submission if there are errors
        }
    
        // Proceed with form submission if validation passes
        try {
            const response = await axios.post('https://light-house-system-h74t-server.vercel.app/api/registerStaff', staff);
    
            if (response.status === 201) {
                setSuccess('Staff registered successfully!');
                setError('');
    
                setTimeout(() => {
                    handleClose(); // Close modal after successful submission
                }, 3000);
            }
        } catch (error) {
            console.error('Error registering staff:', error.response?.data || error.message);
            setError('Failed to register staff: ' + (error.response?.data?.error || error.message));
        }
    };
    
    

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={handleClose}></div>
            <div className="modal-card custom-modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Add New Staff</p>
                    <button className="delete" aria-label="close" onClick={handleClose}></button>
                </header>
                <section className="modal-card-body">                
                    {error && <ErrorMsg message={error} />}
                    {success && <SuccessMsg message={success} />}

                    <div className="columns is-multiline">
                        {/* First Column */}
                        <div className="column is-one-third">
                            <div className="field">
                                <label className="label">First Name</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.staff_fname ? 'is-danger' : ''}`}
                                        type="text"
                                        name="staff_fname"
                                        placeholder="Enter first name"
                                        value={staff.staff_fname}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.staff_fname && <p className="help is-danger">Please enter a valid first name.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Last Name</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.staff_lname ? 'is-danger' : ''}`}
                                        type="text"
                                        name="staff_lname"
                                        placeholder="Enter last name"
                                        value={staff.staff_lname}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.staff_lname && <p className="help is-danger">Please enter a valid last name.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Username</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.staff_username ? 'is-danger' : ''}`}
                                        type="text"
                                        name="staff_username"
                                        placeholder="Enter username"
                                        value={staff.staff_username}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.staff_username && <p className="help is-danger">Please enter a valid username.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Gender</label>
                                <div className="control">
                                    <div className={`select is-fullwidth ${erroredFields.staff_gender ? 'is-danger' : ''}`}>
                                        <select
                                            name="staff_gender"
                                            value={staff.staff_gender}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Gender</option> 
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="NON-BINARY">Non-Binary</option>
                                            <option value="PREFER NOT TO SAY">Prefer Not to Say</option>
                                        </select>
                                    </div>
                                    {erroredFields.staff_gender && <p className="help is-danger">Please select a valid gender.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Second Column */}
                        <div className="column is-one-third">
                            <div className="field">
                                <label className="label">Email</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.staff_email ? 'is-danger' : ''}`}
                                        type="email"
                                        name="staff_email"
                                        placeholder="Enter email"
                                        value={staff.staff_email}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.staff_email && <p className="help is-danger">Please enter a valid email.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Phone Number</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.staff_phone_no ? 'is-danger' : ''}`}
                                        type="tel"
                                        name="staff_phone_no"
                                        placeholder="Enter phone number"
                                        value={staff.staff_phone_no}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.staff_phone_no && <p className="help is-danger">Please enter a valid phone number.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Password</label>
                                <div className="control">
                                <input
                                    className={`input ${erroredFields.staff_password ? 'is-danger' : ''}`}
                                    type="password"
                                    name="staff_password"
                                    placeholder="Enter new password"
                                    value={staff.staff_password}
                                    onChange={handleChange}
                                    required
                                    disabled={false} 
                                />

                                    {erroredFields.staff_password&& <p className="help is-danger">Password must be at least 8 characters long.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Third Column */}
                        <div className="column is-one-third">
                            <div className="field">
                                <label className="label">Account Role</label>
                                <div className="control">
                                    <div className={`select is-fullwidth ${erroredFields.staff_acc_role ? 'is-danger' : ''}`}>
                                        <select
                                            name="staff_acc_role"
                                            value={staff.staff_acc_role}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Account Role</option>
                                            <option value="manager">Manager</option>
                                            <option value="frontDesk">Front Desk</option>
                                            <option value="restaurantDesk">Restaurant Desk</option>
                                            <option value="barDesk">Bar Desk</option>
                                        </select>
                                    </div>
                                    {erroredFields.staff_acc_role && <p className="help is-danger">Please select a valid account role.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Hire Date</label>
                                <div className="control">
                                    <input
                                        className={`input ${erroredFields.staff_hire_date ? 'is-danger' : ''}`}
                                        type="date"
                                        name="staff_hire_date"
                                        placeholder="Enter hire date"
                                        value={staff.staff_hire_date}
                                        onChange={handleChange}
                                        required
                                    />
                                    {erroredFields.staff_hire_date && <p className="help is-danger">Please enter a valid hire date.</p>}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Shift Time</label>
                                <div className="columns">
                                    <div className="column is-6">
                                        <input
                                            className={`input ${erroredFields.shift_start_time ? 'is-danger' : ''}`}
                                            type="time"
                                            name="shift_start_time"
                                            placeholder="Start Time"
                                            value={staff.shift_start_time}
                                            onChange={handleChange}
                                            required
                                        />
                                        {erroredFields.shift_start_time && <p className="help is-danger">Please enter a valid start time.</p>}
                                    </div>
                                    <div className="column is-6">
                                        <input
                                            className={`input ${erroredFields.shift_end_time ? 'is-danger' : ''}`}
                                            type="time"
                                            name="shift_end_time"
                                            placeholder="End Time"
                                            value={staff.shift_end_time}
                                            onChange={handleChange}
                                            required
                                        />
                                        {erroredFields.shift_end_time && <p className="help is-danger">Please enter a valid end time.</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="field">
                
                                {staffPhoto && (
                                    <figure className="image is-128x128">
                                        <img
                                            src={staffPhoto}
                                            alt="Staff Preview"
                                            style={{
                                                width: "128px",
                                                height: "128px",
                                                borderRadius: "50%",
                                            }}
                                        />
                                    </figure>
                                )}
                                <div className="control">
                                <label className="label"> Staff Photo</label>
                                <p>Only 3 MB photos in file types JPEG, JPG, and PNG</p>
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
                </section>

                <footer className="modal-card-foot is-flex is-justify-content-flex-end is-align-items-center">
                    <button className="button is-blue mr-2" onClick={handleSubmit}>Save</button>
                    <button className="button is-red" onClick={handleClose}>Cancel</button>
                </footer>
            </div>
        </div>
    );
};

export default AddStaffModal;
