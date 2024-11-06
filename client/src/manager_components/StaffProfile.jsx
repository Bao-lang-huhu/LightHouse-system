import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_m.css';
import { useNavigate } from 'react-router-dom'; 
import { IoPerson, IoPlayBack, IoSearchCircle,  } from 'react-icons/io5';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';
import axios from 'axios';
import { IoImageOutline, IoInformationCircle, IoMailOpen, IoPencil, IoTrashBin, IoEye , IoEyeSharp, IoEyeOffSharp} from 'react-icons/io5';
import { Avatar, Grid2, TextField, Typography, FormControl, Alert, Snackbar, Select, MenuItem } from '@mui/material';

const StaffProfile = () => {
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
      

    // Function to return color based on status
const getStatusColor = (status) => {
    if (status === 'ACTIVE') return 'green';
    if (status === 'INACTIVE') return 'red';
    return 'black'; // Default color if status is neither ACTIVE nor INACTIVE
  };
  
    const [guestPhoto, setGuestPhoto] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [emailError, setEmailError] = useState(false); // Define email error state

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [tempPhoto, setTempPhoto] = useState(null);
    const [isEditingCredentials, setIsEditingCredentials] = useState(false);
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [notification, setNotification] = useState({
      open: false,
      message: '',
      severity: 'success',
    });
  
    const handleOpenNotification = (message, severity) => {
      setNotification({
        open: true,
        message: message,
        severity: severity,
      });
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
      };
      
    
    
    useEffect(() => {
        const fetchStaffDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('User not logged in');
                    return;
                }
                const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getStaffDetails', {
                    headers: { Authorization: `Bearer ${token}` },
                });
      
                if (response.data) {
                    setStaff(response.data);
                    setGuestPhoto(response.data.staff_photo || null); // Assuming staff photo is in the response
                }
            } catch (err) {
                setError('Failed to fetch staff details');
            }
        };
      
        fetchStaffDetails();
      }, []);
      
  
  
      const handleChange = (e) => {
        const { name, value } = e.target;
        setStaff((prevStaff) => ({
            ...prevStaff,
            [name]: value,
        }));
      };
      
  
      const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempPhoto(reader.result); 
                setStaff((prevStaff) => ({
                    ...prevStaff,
                    staff_photo: reader.result,  // Set the staff photo field here
                }));
            };
            reader.readAsDataURL(file); 
        }
    };
    
  
  
    const handleSavePhoto = async () => {
        if (tempPhoto) {
            setStaff((prevStaff) => ({
                ...prevStaff,
                staff_photo: tempPhoto,  // Apply temp photo to staff_photo
            }));
    
            await handleSaveChanges(); // Save changes to server
        }
        setIsEditing(false); 
        setTempPhoto(null); // Reset temp photo
    };
    
    const handleCancelEdit = () => {
        setIsEditing(false); 
        setTempPhoto(null); // Clear temporary photo
    };
    
    const toggleEdit = () => {
        setIsEditing(!isEditing); 
        setTempPhoto(null); // Clear temp photo when toggling edit mode
    };
    
  
      const toggleEditCredentials = () => {
          setIsEditingCredentials(!isEditingCredentials);
        };
        
        const toggleEditingAccount = () => {
          setIsEditingAccount(!isEditingAccount);
        };
        
        const handleSaveChanges = async () => {
            try {
                // Validate email format before saving
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
                if (!emailRegex.test(staff.staff_email)) {
                    handleOpenNotification('Please enter a valid email address with "@"', 'error');
                    return; // Stop execution if email is invalid
                }
        
                const token = localStorage.getItem('token');
                
                // Send update request
                const response = await axios.put(`https://light-house-system-h74t-server.vercel.app/api/updateStaffDetails`, staff, {
                    headers: { Authorization: `Bearer ${token}` },
                });
        
                if (response.status === 200) {
                    // Fetch the updated staff details
                    const updatedStaff = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getStaffDetails', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
        
                    setStaff(updatedStaff.data);
                    setGuestPhoto(updatedStaff.data.staff_photo); // Update photo
        
                    handleOpenNotification('Profile updated successfully', 'success');
        
                    setIsEditingCredentials(false);
                    setIsEditingAccount(false);
                   
                }
            } catch (err) {
                handleOpenNotification('Failed to update profile', 'error');
            }
        };
        
          
        const handleSaveAccountChanges = async (isUpdatingUsername, isUpdatingPassword) => {
            try {
                const staffId = staff.staff_id; // Ensure staff_id exists in the staff object
        
                // Validate if the current password is provided
                if (!staff.staff_old_password) {
                    handleOpenNotification('Please provide the current password to update account details.', 'error');
                    return;
                }
        
                // Validate if current password is correct
                const passwordValidationResponse = await axios.post(`https://light-house-system-h74t-server.vercel.app/api/validatePassword`, {
                    staff_id: staffId,
                    staff_old_password: staff.staff_old_password,
                });
        
                if (passwordValidationResponse.status !== 200) {
                    handleOpenNotification('Old password is incorrect.', 'error');
                    return;
                }
        
                // If updating the username, validate
                if (isUpdatingUsername) {
                    if (staff.staff_username === '') {
                        handleOpenNotification('Please provide a new username.', 'error');
                        return;
                    }
        
                    // Check for only letters and spaces in the new username
                    const usernameRegex = /^[a-zA-Z\s]+$/;
                    if (!usernameRegex.test(staff.staff_username)) {
                        handleOpenNotification('Username should only contain letters and spaces.', 'error');
                        return;
                    }
        
                    // Check if the new username is the same as the current one
                    if (staff.staff_username === staff.staff_current_username) {
                        handleOpenNotification('This is your current username.', 'info');
                        return;
                    }
                }
        
                // If updating the password, validate
                if (isUpdatingPassword && (!staff.staff_new_password || staff.staff_new_password.length < 8)) {
                    handleOpenNotification('New password must be at least 8 characters long.', 'error');
                    return;
                }
        
                // Send request to update the staff account
                const response = await axios.put(`https://light-house-system-h74t-server.vercel.app/api/updateStaffProfile/${staffId}`, {
                    staff_username: isUpdatingUsername ? staff.staff_username : '', 
                    staff_old_password: staff.staff_old_password, 
                    staff_new_password: isUpdatingPassword ? staff.staff_new_password : '', 
                });
        
                if (response.status === 200) {
                    handleOpenNotification('Account updated successfully!', 'success');
                    
                    // Close the modal after success
                    setIsEditingAccount(false);
                    setIsEmailModalOpen(false); 
                    setIsPasswordModalOpen(false); // Close the username modal if open
                }
            } catch (err) {
                if (err.response && err.response.status === 400) {
                    handleOpenNotification(err.response.data.error || 'Failed to update account', 'error');
                } else {
                    handleOpenNotification('An error occurred while updating the account. Please try again.', 'error');
                }
            }
        };
        
        
        
        // Modified function to handle only username update
        const handleUsernameSave = () => {
            handleSaveAccountChanges(true, false); // Update username only
        };
        
    
        const handlePasswordSave = () => {
        handleSaveAccountChanges(false, true); // Update password only
        };
    
        const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
        
    const toggleCurrentPasswordVisibility = () => {
        setShowCurrentPassword(!showCurrentPassword);
    };

    const navigate = useNavigate();

    const handleBackToHome = () => {
        switch (staff.staff_acc_role) {
            case 'manager':
                navigate('/manager_home');
                break;
            case 'frontDesk':
                navigate('/frontdesk_home');
                break;
            case 'restaurantDesk':
                navigate('/restaurant_home');
                break;
            case 'barDesk':
                navigate('/bar_home');
                break;
            default:
                navigate('/staff_login'); // Fallback to home or a default page if no match
        }
    };

  
    return (
      <section className='section-p1'>
        <div className="contact-hero-image p-1 m-0">
          <div className="text-content-title p-2">
            <h1 className='subtitle is-3'>Staff Profile</h1>
          </div>
        </div>
        <div className='m-1'>
            <button className='button is-blue' onClick={handleBackToHome}> <IoPlayBack className='mr-1'/>Back to Home</button>
        </div>
  
        <div className="section p-2" style={{ margin: '0 auto' }}>
          <div className="container">
              <div className="columns">
                <div className="column is-12">
                  <div className="columns is-vcentered m-1 blue-profile">
                      {/* Left Side - Guest Photo and Name */}   

                      <div className="column is-12-mobile is-half-tablet is-vcentered" style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                          <Avatar
                              alt="Guest Preview"
                              src={tempPhoto || guestPhoto} 
                              sx={{ 
                                  width: { xs: 64, sm: 128 }, 
                                  height: { xs: 64, sm: 128 } 
                              }}
                          />
                          
                          {/* Guest Name */}
                          <div style={{ marginLeft: "1rem" }}>
                              <p className="subtitle is-2">
                                  {staff.staff_fname} {staff.staff_lname}
                              </p>
                          </div>
                      </div>
                      
  
                      {/* Right Side - Edit Buttons */}
                      <div className="column is-12-mobile is-half-tablet is-vcentered" style={{ textAlign: "right", marginTop: '1rem' }}>
                          {isEditing ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>
                                  <div className="file" style={{ marginBottom: "1rem", display: 'flex', alignItems: 'center' }}>
                                      <label className="file-label">
                                          <input 
                                              className="file-input" 
                                              type="file" 
                                              accept="image/*" 
                                              onChange={handlePhotoChange} 
                                          />
                                          <span className="file-cta">
                                              <span className="file-label"><IoImageOutline className='mr-2'/>Choose a photo</span>
                                          </span>
                                      </label>
                                  </div>

                                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
                                      <button 
                                          className="button is-blue" 
                                          onClick={handleSavePhoto}
                                      >
                                          Save
                                      </button>
                                      <button 
                                          className="button is-inverted-blue" 
                                          onClick={handleCancelEdit}
                                      >
                                          Cancel
                                      </button>
                                  </div>
                              </div>
                          ) : (
                              <button 
                                  className="button is-blue" 
                                  onClick={toggleEdit}
                              >
                                  Edit Profile Pic
                              </button>
                          )}
                      </div>
  
                      <div className="field is-flex is-flex-direction-column-mobile is-align-items-start is-align-items-center-desktop is-justify-content-space-between">
                          <div className="field" style={{ display: 'flex', alignItems: 'center' }}>
                              <label className="label" style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem', marginRight: '10px' }}>
                                  Username:
                              </label>
                              <p style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000', marginBottom: '0.5rem' }}>
                                  {staff.staff_username}
                              </p>
                          </div>
                      </div>
  
                      <div className="field is-flex  is-justify-content-space-between">

                          <div className="buttons is-flex is-flex-direction-column-mobile is-justify-content-space-between">
                              {/* Edit Email Button */}
                              <button className="button is-blue is-fullwidth-mobile mb-2-mobile" onClick={() => setIsEmailModalOpen(true)}>
                                  <IoMailOpen className='mr-1'/> Change Username
                              </button>
                              {/* Edit Password Button */}
                              <button className="button is-inverted-blue is-fullwidth-mobile" onClick={() => setIsPasswordModalOpen(true)}>
                                  <IoEye className='mr-1'/> Change Password
                              </button>
                          </div>
                      </div>
  
  
  
                      {/* Username Modal */}
                    <div className={`modal ${isEmailModalOpen ? 'is-active' : ''}`}>
                        <div className="modal-background"></div>
                        <div className="modal-card">
                            <header className="modal-card-head">
                                <p className="modal-card-title">Change Username</p>
                                <button className="delete" aria-label="close" onClick={() => setIsEmailModalOpen(false)}></button>
                            </header>
                            <section className="modal-card-body">
                                <div className="field">
                                    <label className="label">New Username</label>
                                    <div className="control">
                                        <input 
                                            className="input" 
                                            type="text" 
                                            name="staff_username" 
                                            onChange={handleChange} 
                                            placeholder="Enter new username" 
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">Current Password</label>
                                    <div className="control is-flex">
                                        <input 
                                            className="input" 
                                            name="staff_old_password" 
                                            onChange={handleChange} 
                                            placeholder="Enter current password" 
                                            type={showPassword ? "text" : "password"}  
                                        />
                                        <button
                                            type="button" 
                                            className="button is-blue ml-2" 
                                            onClick={togglePasswordVisibility}>
                                            {showPassword ? <IoEyeOffSharp /> : <IoEyeSharp />} {/* Toggle icons */}
                                        </button>
                                    </div>
                                </div>
                            </section>
                            <footer className="modal-card-foot is-flex is-justify-content-flex-end">
                                <button className="button is-blue mr-1" onClick={handleUsernameSave}>Save</button>
                                <button className="button is-inverted-blue" onClick={() => setIsEmailModalOpen(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                            </footer>
                        </div>
                    </div>

  
                      {/* Password Modal */}
                      <div className={`modal ${isPasswordModalOpen ? 'is-active' : ''}`}>
                          <div className="modal-background"></div>
                          <div className="modal-card">
                              <header className="modal-card-head">
                                  <p className="modal-card-title">Change Password</p>
                                  <button className="delete" aria-label="close" onClick={() => setIsPasswordModalOpen(false)}></button>
                              </header>
                              <section className="modal-card-body">
                                  <div className="field">
                                      <label className="label">Current Username</label>
                                      <div className="control">
                                          <input className="input" type="text" name="staff_email" value={staff.staff_email} readOnly />
                                      </div>
                                  </div>
                                  <div className="field">
                                      <label className="label">Current Password</label>
                                      <div className="control is-flex">
                                          <input className="input" type={showCurrentPassword ? "text" : "password"} name="staff_old_password" onChange={handleChange} placeholder="Enter current password" />
                                          <button
                                              type="button" 
                                                  className="button is-blue ml-2" 
                                                  onClick={toggleCurrentPasswordVisibility}>
                                                  {showCurrentPassword ? <IoEyeOffSharp /> : <IoEyeSharp />} {/* Toggle icons */}
                                          </button>
                                      </div>
                                  </div>
                                  <div className="field">
                                      <label className="label">New Password</label>
                                      <div className="control is-flex">
                                          <input className="input" type={showPassword ? "text" : "password"} name="staff_new_password" onChange={handleChange} placeholder="Enter new password" />
                                          <button
                                              type="button" 
                                                  className="button is-blue ml-2" 
                                                  onClick={togglePasswordVisibility}>
                                                  {showPassword ? <IoEyeOffSharp /> : <IoEyeSharp />} {/* Toggle icons */}
                                              </button>
                                      </div>
                                  </div>
                              </section>
                              <footer className="modal-card-foot is-flex is-justify-content-flex-end">
                                  <button className="button is-blue" onClick={handlePasswordSave}>Save</button>
                                  <button className="button is-inverted-blue" onClick={() => setIsPasswordModalOpen(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                              </footer>
  
                          </div>
                      </div>
                  </div>
  
                  <div className='columns is-vcentered m-1 blue-profile p-5'>
                      <div className="field is-flex is-align-items-center is-justify-content-space-between" style={{ marginBottom: '2rem' }}>
                          <h2 className='subtitle is-5'>
                          <IoInformationCircle className='mr-2' /> Personal Information
                          </h2>
                          <div>
                          {isEditingCredentials ? (
                              <>
                              <button className="button is-blue mr-2" onClick={handleSaveChanges}>
                                  <IoPencil className='mr-2' /> Save
                              </button>
                              <button className="button is-inverted-blue" onClick={toggleEditCredentials}>
                                  <IoTrashBin className='mr-2' /> Cancel
                              </button>
                              </>
                          ) : (
                              <button className="button is-blue" onClick={toggleEditCredentials}>
                              <IoPencil className='mr-2' /> Edit Info
                              </button>
                          )}
                          </div>
                      </div>
  
                      <div className='auth_space'>
                          <Grid2 
                              container 
                              spacing={{ xs: 2, sm: 4, md: 12 }}  // Smaller spacing for xs and sm, larger for md and above
                              style={{ alignItems: 'center' }} >
                              {/* First Name */}
                            <Grid2 xs={12} sm={3}>
                                <Typography 
                                    variant="body1" 
                                    style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                    First Name
                                </Typography>
                                {isEditingCredentials ? (
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        name="staff_fname"
                                        value={staff.staff_fname}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Allow only letters and spaces
                                            handleChange({ target: { name: 'staff_fname', value } });
                                        }}
                                        placeholder="Enter first name"
                                    />
                                ) : (
                                    <Typography 
                                        variant="h6" 
                                        style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                        {staff.staff_fname}
                                    </Typography>
                                )}
                            </Grid2>

                            {/* Last Name */}
                            <Grid2 xs={12} sm={3}>
                                <Typography 
                                    variant="body1" 
                                    style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                    Last Name
                                </Typography>
                                {isEditingCredentials ? (
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        name="staff_lname"
                                        value={staff.staff_lname}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Allow only letters and spaces
                                            handleChange({ target: { name: 'staff_lname', value } });
                                        }}
                                        placeholder="Enter last name"
                                    />
                                ) : (
                                    <Typography 
                                        variant="h6" 
                                        style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                        {staff.staff_lname}
                                    </Typography>
                                )}
                            </Grid2>

                          </Grid2>
                      </div>
  
                      <div className='auth_space'>
                          <Grid2 
                              container 
                              spacing={{ xs: 2, sm: 4, md: 12 }}  // Smaller spacing for xs and sm, larger for md and above
                              style={{ marginTop: '2rem', alignItems: 'center' }}  >
                              
                                {/* Email */}
                                <Grid2 xs={12} sm={3}>
                                <Typography 
                                    variant="body1" 
                                    style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                    Email
                                </Typography>
                                {isEditingCredentials ? (
                                    <>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            name="staff_email"
                                            value={staff.staff_email}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                handleChange({ target: { name: 'staff_email', value } });
                                            }}
                                            placeholder="Enter email"
                                            onBlur={() => {
                                                // Validate email format on blur (when the user leaves the field)
                                                const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staff.staff_email);
                                                setEmailError(!isValidEmail); // Set error state if email is invalid
                                            }}
                                            error={emailError} // Show error state if email is invalid
                                            helperText={emailError ? "Please enter a valid email address" : ""}
                                        />
                                    </>
                                ) : (
                                    <Typography 
                                        variant="h6" 
                                        style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                        {staff.staff_email}
                                    </Typography>
                                )}
                                </Grid2>
 
  
                                {/* Phone Number */}
                                <Grid2 xs={12} sm={3}>
                                    <Typography 
                                        variant="body1" 
                                        style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                        Phone Number
                                    </Typography>
                                    {isEditingCredentials ? (
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            name="staff_phone_no"
                                            value={staff.staff_phone_no}
                                            onChange={(e) => {
                                                // Allow only numeric input
                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                handleChange({ target: { name: 'staff_phone_no', value } });
                                            }}
                                            placeholder="Enter phone number"
                                        />
                                    ) : (
                                        <Typography 
                                            variant="h6" 
                                            style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                            {staff.staff_phone_no}
                                        </Typography>
                                    )}
                                </Grid2>

  
                              {/* Gender */}
                              <Grid2 xs={12} sm={3}>
                                  <Typography 
                                      variant="body1" 
                                      style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                      Gender
                                  </Typography>
                                  {isEditingCredentials ? (
                                      <FormControl fullWidth variant="outlined">
                                          <Select
                                              labelId="gender-label"
                                              name="staff_gender"
                                              value={staff.staff_gender}
                                              onChange={handleChange}
                                          >
                                              <MenuItem value="MALE">Male</MenuItem>
                                              <MenuItem value="FEMALE">Female</MenuItem>
                                              <MenuItem value="NON-BINARY">Non-Binary</MenuItem>
                                              <MenuItem value="PREFER NOT TO SAY">Prefer Not To Say</MenuItem>
                                          </Select>
                                      </FormControl>
                                  ) : (
                                      <Typography 
                                          variant="h6" 
                                          style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                          {staff.staff_gender}
                                      </Typography>
                                  )}
                              </Grid2>
                          </Grid2>                   
                      </div>


                        <div className="field is-flex is-align-items-center is-justify-content-space-between" style={{ marginTop: '2em' }}>
                            <h2 className='subtitle is-5'>
                            <IoInformationCircle className='mr-2' /> Job Information
                            </h2>
                        </div>


                        {/*Staff ID*/}
                          <div className='auth_space'>
                         
                          <div className='auth_space'>
                          <Grid2 
                              container 
                              spacing={{ xs: 2, sm: 4, md: 12 }}  // Smaller spacing for xs and sm, larger for md and above
                              style={{ marginTop: '2rem', alignItems: 'center' }}  >

                                  <Grid2 xs={12} sm={3}>
                                  <Typography 
                                      variant="body1" 
                                      style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                      Shift Time
                                  </Typography>
                                  
                                      <Typography 
                                          variant="h6" 
                                          style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                          {staff.shift_start_time} - {staff.shift_end_time}
                                      </Typography>
                                </Grid2>  

                                {/* Status*/}
                                <Grid2 xs={12} sm={3}>
                                    <Typography 
                                        variant="body1" 
                                        style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                        Hire Date
                                    </Typography>
                                    
                                    <Typography 
                                        variant="h6" 
                                        style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                        {staff.staff_hire_date ? 
                                            new Date(staff.staff_hire_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                            }) 
                                            : ''}
                                    </Typography>
                                </Grid2>

  

                              {/* Status*/}
                              <Grid2 xs={12} sm={3}>
                                  <Typography 
                                      variant="body1" 
                                      style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                      Status
                                  </Typography>
                                    <Typography 
                                          variant="h6" 
                                          style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                          {staff.staff_status}
                                    </Typography>
                              </Grid2>

                              {/*Account Role*/}
                                <Grid2 xs={12} sm={3}>
                                    <Typography 
                                        variant="body1" 
                                        style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                        Account Role
                                    </Typography>
                                    
                                    <Typography 
                                        variant="h6" 
                                        style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                        {staff.staff_acc_role ? staff.staff_acc_role.toUpperCase() : ''}
                                    </Typography>
                                </Grid2>
                          </Grid2>               
                      </div>
                      </div>
                  </div>
                </div>  
              </div>
              </div>
                <Snackbar
                    open={notification.open}
                    autoHideDuration={3000}
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    sx={{ width: '400px' }}  >
                    <Alert
                        onClose={handleCloseNotification}
                        severity={notification.severity}
                        style={{ fontSize: '1.2rem', padding: '20px' }} 
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
              </div>
          </section>
      );
    }

export default StaffProfile;
