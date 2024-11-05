import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_m.css';
import { IoPerson, IoSearchCircle,  } from 'react-icons/io5';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';
import axios from 'axios';
import { IoImageOutline, IoInformationCircle, IoMailOpen, IoPencil, IoTrashBin, IoEye , IoEyeSharp, IoEyeOffSharp} from 'react-icons/io5';
import { Avatar, Grid2, TextField, Typography, FormControl, Alert, Snackbar, Select, MenuItem } from '@mui/material';

const StaffProfile = () => {
    const [guest, setGuest] = useState({
      guest_fname: '',
      guest_lname: '',
      guest_email: '',
      guest_phone_no: '',
      guest_gender: '',
      guest_birthdate: '',
      guest_address: '',
      guest_country: '',
      guest_photo: '',
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
    
    
    useEffect(() => {
      const fetchGuestDetails = async () => {
          try {
              const token = localStorage.getItem('token'); 
              if (!token) {
                  setError('User not logged in');
                  return;
              }
              const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getGuestDetails', {
                  headers: { Authorization: `Bearer ${token}` },
              });
  
              if (response.data) {
                  console.log('Fetched guest data:', response.data); 
                  setGuest(response.data); 
                  setGuestPhoto(response.data.guest_photo || null);
              }
          } catch (err) {
              setError('Failed to fetch guest details');
          }
      };
  
      fetchGuestDetails();
  }, []);
  
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setGuest((prevGuest) => ({
          ...prevGuest,
          [name]: value,
      }));
  };
  
  const handlePhotoChange = (event) => {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setTempPhoto(reader.result); 
              setGuest((prevGuest) => ({
                  ...prevGuest,
                  guest_photo: reader.result, 
              }));
          };
          reader.readAsDataURL(file); 
      }
  };
  
  
      const handleSavePhoto = async () => {
          if (tempPhoto) {
              setGuest((prevGuest) => ({
                  ...prevGuest,
                  guest_photo: tempPhoto, 
              }));
      
              await handleSaveChanges();
          }
          setIsEditing(false); 
          setTempPhoto(null); // Reset temp photo
      };
      
  
      // Handle canceling the edit
      const handleCancelEdit = () => {
          setIsEditing(false); 
          setTempPhoto(null); 
      };
  
  
      const toggleEdit = () => {
          setIsEditing(!isEditing); 
          setTempPhoto(null);
      };
  
      const toggleEditCredentials = () => {
          setIsEditingCredentials(!isEditingCredentials);
        };
        
        const toggleEditingAccount = () => {
          setIsEditingAccount(!isEditingAccount);
        };
        
        const handleSaveChanges = async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await axios.put('https://light-house-system-h74t-server.vercel.app/api/updateGuest', guest, {
              headers: { Authorization: `Bearer ${token}` },
            });
        
            if (response.status === 200) {
              const updatedGuest = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getGuestDetails', {
                headers: { Authorization: `Bearer ${token}` },
              });
        
              setGuest(updatedGuest.data);
              setGuestPhoto(updatedGuest.data.guest_photo);
        
              handleOpenNotification('Profile updated successfully', 'success');
        
              // Close editing states after successful update
              setIsEditingCredentials(false);
              setIsEditingAccount(false);
            }
          } catch (err) {
            handleOpenNotification('Failed to update profile', 'error');
          }
        };
        
    
        const handleSaveAccountChanges = async (isUpdatingEmail, isUpdatingPassword) => {
          try {
            const guestId = guest.guest_id;
        
            // Validate if the current password is provided
            if (!guest.guest_old_password) {
              handleOpenNotification('Please provide the current password to update account details.', 'error');
              return;
            }
        
            // If updating the email, validate
            if (isUpdatingEmail) {
              if (guest.guest_email === '') {
                handleOpenNotification('Please provide a new username to update.', 'error');
                return;
              }
        
              // Check if the new email is the same as the current one
              if (guest.guest_email === guest.guest_email) { // Compare with the original email
                handleOpenNotification('This is your current username.', 'info');
                return;
              }
            }
        
            // If updating the password, validate
            if (isUpdatingPassword && (!guest.guest_new_password || guest.guest_new_password.length < 8)) {
              handleOpenNotification('New password must be at least 8 characters long.', 'error');
              return;
            }
        
            const response = await axios.put(`https://light-house-system-h74t-server.vercel.app/api/update_account/${guestId}`, {
              guest_email: isUpdatingEmail ? guest.guest_email : '', 
              guest_old_password: guest.guest_old_password, 
              guest_new_password: isUpdatingPassword ? guest.guest_new_password : '', 
            });
        
            if (response.status === 200) {
              handleOpenNotification('Account updated successfully!', 'success');
              
              // Close the modal after success
              setIsEditingAccount(false);
            }
          } catch (err) {
            // Handle specific server errors like wrong password
            if (err.response && err.response.status === 400) {
              handleOpenNotification(err.response.data.error || 'Failed to update account', 'error');
            } else {
              // General error message for other issues
              handleOpenNotification('An error occurred while updating the account. Please try again.', 'error');
            }
          }
        };
          
  
    const handleEmailSave = () => {
      handleSaveAccountChanges(true, false); // Update email only
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
  
    return (
      <section className='section-p1'>
        <div className="contact-hero-image p-1 m-0">
          <div className="text-content-title p-2">
            <h1 className='subtitle is-3'>Staff Profile</h1>
          </div>
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
                                  {guest.guest_fname} {guest.guest_lname}
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
                                  {guest.guest_email}
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
  
  
  
                      {/* Email Modal */}
                      <div className={`modal ${isEmailModalOpen ? 'is-active' : ''}`}>
                          <div className="modal-background"></div>
                          <div className="modal-card">
                              <header className="modal-card-head">
                                  <p className="modal-card-title">Change Email</p>
                                  <button className="delete" aria-label="close" onClick={() => setIsEmailModalOpen(false)}></button>
                              </header>
                              <section className="modal-card-body">
                                  <div className="field">
                                      <label className="label">New Username</label>
                                      <div className="control">
                                          <input className="input" type="email" name="guest_email" onChange={handleChange} placeholder="Enter new username" />
                                      </div>
                                  </div>
                                  <div className="field">
                                      <label className="label">Current Password</label>
                                      <div className="control is-flex">
                                          <input className="input" name="guest_old_password" onChange={handleChange} placeholder="Enter current password" type={showPassword ? "text" : "password"}  />
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
                                  <button className="button is-blue mr-1" onClick={handleEmailSave}>Save</button>
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
                                          <input className="input" type="text" name="guest_email" value={guest.guest_email} readOnly />
                                      </div>
                                  </div>
                                  <div className="field">
                                      <label className="label">Current Password</label>
                                      <div className="control is-flex">
                                          <input className="input" type={showCurrentPassword ? "text" : "password"} name="guest_old_password" onChange={handleChange} placeholder="Enter current password" />
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
                                          <input className="input" type={showPassword ? "text" : "password"} name="guest_new_password" onChange={handleChange} placeholder="Enter new password" />
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
                                          name="guest_fname"
                                          value={guest.guest_fname}
                                          onChange={handleChange}
                                          placeholder="Enter first name"
                                      />
                                  ) : (
                                      <Typography 
                                          variant="h6" 
                                          style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                          {guest.guest_fname}
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
                                          name="guest_lname"
                                          value={guest.guest_lname}
                                          onChange={handleChange}
                                          placeholder="Enter last name"
                                      />
                                  ) : (
                                      <Typography 
                                          variant="h6" 
                                          style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                          {guest.guest_lname}
                                      </Typography>
                                  )}
                              </Grid2>
  
                              {/* Birthdate */}
                              <Grid2 xs={12} sm={3}>
                                  <Typography 
                                      variant="body1" 
                                      style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                      Date of Birth
                                  </Typography>
                                  {isEditingCredentials ? (
                                      <TextField
                                          fullWidth
                                          variant="outlined"
                                          type="date"
                                          name="guest_birthdate"
                                          value={guest.guest_birthdate}
                                          onChange={handleChange}
                                      />
                                  ) : (
                                      <Typography 
                                          variant="h6" 
                                          style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                          {guest.guest_birthdate}
                                      </Typography>
                                  )}
                              </Grid2>
  
                              {/* Address */}
                              <Grid2 xs={12} sm={3}>
                                  <Typography 
                                      variant="body1" 
                                      style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                      Address
                                  </Typography>
                                  {isEditingCredentials ? (
                                      <TextField
                                          fullWidth
                                          variant="outlined"
                                          name="guest_address"
                                          value={guest.guest_address}
                                          onChange={handleChange}
                                          placeholder="Enter address"
                                      />
                                  ) : (
                                      <Typography 
                                          variant="h6" 
                                          style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                          {guest.guest_address}
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

                                  <Grid2 xs={12} sm={3}>
                                  <Typography 
                                      variant="body1" 
                                      style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                      Email
                                  </Typography>
                                  {isEditingCredentials ? (
                                      <TextField
                                          fullWidth
                                          variant="outlined"
                                          name="guest_email"
                                          value={guest.guest_phone_no}
                                          onChange={handleChange}
                                          placeholder="Enter email"
                                      />
                                  ) : (
                                      <Typography 
                                          variant="h6" 
                                          style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                          {guest.guest_phone_no}
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
                                          name="guest_phone_no"
                                          value={guest.guest_phone_no}
                                          onChange={handleChange}
                                          placeholder="Enter phone number"
                                      />
                                  ) : (
                                      <Typography 
                                          variant="h6" 
                                          style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                          {guest.guest_phone_no}
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
                                              name="guest_gender"
                                              value={guest.guest_gender}
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
                                          {guest.guest_gender}
                                      </Typography>
                                  )}
                              </Grid2>
                          </Grid2>                   
                      </div>


                      <div className="field is-flex is-align-items-center is-justify-content-space-between" style={{ marginTop: '80px' }}>
                          <h2 className='subtitle is-5'>
                          <IoInformationCircle className='mr-2' /> Job Information
                          </h2>
                          </div>


                        {/*Staff ID*/}
                          <div className='auth_space'>
                          <Grid2 
                              container 
                              spacing={{ xs: 2, sm: 4, md: 12 }}  // Smaller spacing for xs and sm, larger for md and above
                              style={{ marginTop: '2rem', alignItems: 'center' }}  >

                                  <Grid2 xs={12} sm={3}>
                                  <Typography 
                                      variant="body1" 
                                      style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                      Staff ID
                                  </Typography>
                                  {isEditingCredentials ? (
                                      <TextField
                                          fullWidth
                                          variant="outlined"
                                          placeholder="Staff ID"
                                      />
                                  ) : (
                                      <Typography 
                                          variant="h6" 
                                          style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                          {guest.guest_phone_no}
                                      </Typography>
                                  )}
                              </Grid2>  
  

                              {/* Hire Date */}
                              <Grid2 xs={12} sm={3}>
                                  <Typography 
                                      variant="body1" 
                                      style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                      Hire Date
                                  </Typography>
                                  {isEditingCredentials ? (
                                      <TextField
                                          fullWidth
                                          variant="outlined"
                                          placeholder="Hire Date"
                                      />
                                  ) : (
                                      <Typography 
                                          variant="h6" 
                                          style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                          {guest.guest_phone_no}
                                      </Typography>
                                  )}
                              </Grid2>


                            {/* Account Role */}
                              <Grid2 xs={12} sm={3}>
                                  <Typography 
                                      variant="body1" 
                                      style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                      Account Role
                                  </Typography>
                                  {isEditingCredentials ? (
                                      <TextField
                                          fullWidth
                                          variant="outlined"
                                          placeholder="Account Role"
                                      />
                                  ) : (
                                      <Typography 
                                          variant="h6" 
                                          style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                          {guest.guest_phone_no}
                                      </Typography>
                                  )}
                              </Grid2>
                          </Grid2>       


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
                                  {isEditingCredentials ? (
                                      <TextField
                                          fullWidth
                                          variant="outlined"
                                          placeholder="Shift Time"
                                      />
                                  ) : (
                                      <Typography 
                                          variant="h6" 
                                          style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                          {guest.guest_phone_no}
                                      </Typography>
                                  )}
                              </Grid2>  
  

                              {/* Status*/}
                              <Grid2 xs={12} sm={3}>
                                  <Typography 
                                      variant="body1" 
                                      style={{ color: '#757575', fontWeight: 600, fontSize: '1.1rem' }}>
                                      Status
                                  </Typography>
                                  {isEditingCredentials ? (
                                      <TextField
                                          fullWidth
                                          variant="outlined"
                                          placeholder="Status"
                                      />
                                  ) : (
                                      <Typography 
                                          variant="h6" 
                                          style={{ fontWeight: 500, fontSize: '1.2rem', color: '#000' }}>
                                          {guest.guest_phone_no}
                                      </Typography>
                                  )}
                              </Grid2>
                          </Grid2>               
                      </div>
                      </div>
                  </div>
                </div>  
              </div>
              </div>
              </div>
          </section>
      );
    }

export default StaffProfile;
