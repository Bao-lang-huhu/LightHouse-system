import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './pages.css';
import '../App.css';
import axios from 'axios';

const Profile = () => {
  const [guest, setGuest] = useState({
    guest_fname: '',
    guest_lname: '',
    guest_email: '',
    guest_phone_no: '',
    guest_gender: '',
    guest_birthdate: '',
    guest_address: '',
    guest_country: '',
  });

  const [guestPhoto, setGuestPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchGuestDetails = async () => {
      try {
        const token = localStorage.getItem('token'); 
        if (!token) {
          setError('User not logged in');
          return;
        }
        const response = await axios.get('https://light-house-system.vercel.app/api/getGuestDetails', {
          headers: { Authorization: `Bearer ${token}` }, 
        });

        if (response.data) {
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
    setGuest({ ...guest, [name]: value });
  };



  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto = reader.result;
        setGuestPhoto(newPhoto);
        setGuest({ ...guest, guest_photo: newPhoto });
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:3001/api/updateGuest', guest, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setSuccess('Profile updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to update profile');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <section className='section-m1'>
      <div className="contact-hero-image">
        <div className="text-content-title">
          <h1 className='title'>Profile</h1>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="columns">
            {/* Left Column - Guest Information */}
            <div className="column is-7">
              <h2 className='title'>Guest Information</h2>
              {error && <div className="notification is-danger">{error}</div>}
              {success && <div className="notification is-success">{success}</div>}
              <div className="auth_space">
                <div className="field">
                  <label className="label">First Name</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="guest_fname"
                      value={guest.guest_fname}
                      onChange={handleChange}
                      placeholder="Enter first name"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Last Name</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="guest_lname"
                      value={guest.guest_lname}
                      onChange={handleChange}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
              </div>

              <div className="auth_space">
                <div className="field">
                  <label className="label">Birthdate</label>
                  <div className="control">
                    <input
                      className="input"
                      type="date"
                      name="guest_birthdate"
                      value={guest.guest_birthdate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="label">Address</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="guest_address"
                      value={guest.guest_address}
                      onChange={handleChange}
                      placeholder="Enter address"
                    />
                  </div>
                </div>
              </div>

              <div className="auth_space">
                <div className="field">
                  <label className="label">Email</label>
                  <div className="control">
                    <input
                      className="input"
                      type="email"
                      name="guest_email"
                      value={guest.guest_email}
                      onChange={handleChange}
                      placeholder="Enter email"
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="label">Country</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="guest_country"
                      value={guest.guest_country}
                      onChange={handleChange}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>

              <div className="auth_space">
                <div className="field">
                  <label className="label">Phone Number</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="guest_phone_no"
                      value={guest.guest_phone_no}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Gender</label>
                  <div className="control">
                    <div className="select select-gender">
                      <select name="guest_gender" value={guest.guest_gender} onChange={handleChange}>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="NON-BINARY">Non-Binary</option>
                        <option value="PREFER NOT TO SAY">Prefer Not To Say</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Guest Photo and Preview */}
            <div className="column is-4 is-offset-1" style={{backgroundColor:"#0090cc", padding:"1rem", borderRadius:"20%"}}>
             
              {guestPhoto && (
                <div className="field">
                  <figure className="image is-300x300">
                    <img className="is-rounded" src={guestPhoto} alt="Guest Preview" />
                  </figure>
                </div>
              )} 
              <h2 className="title">Guest Photo</h2>
              <div className="field">
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
                {/* Save Changes Button */}
                <div className="columns">
                <div className="column is-12 is-left">
                    <button className="button is-blue" onClick={handleSaveChanges}>
                    Save Changes
                    </button>
                </div>
                </div>
                {/* Separator Line */}
                <hr />
                </div>

                {/* Account Username */}
                <div className="container">
                <div className="columns">
                    {/* Left Column - Change Username */}
                    <div className="column is-7">
                    <label className="label">Change Username</label>
                    <div className="field">
                        <label className="label">New Username</label>
                        <div className="control">
                        <input
                            className="input"
                            type="text"
                            name="guest_username"
                            value={guest.guest_username}
                            onChange={handleChange}
                            placeholder="Enter new username"
                        />
                        </div>
                    </div>
                    </div>
                </div>
                {/* Save Changes Button */}
                <div className="columns">
                    <div className="column is-12 is-left">
                    <button className="button is-blue" onClick={handleSaveChanges}>
                        Save Changes
                    </button>
                    </div>
                </div>
                {/* Separator Line */}
                <hr />
                </div>

                {/* Account Password */}
                <div className="container">
                <div className="columns">
                    {/* Left Column - Change Password */}
                    <div className="column is-7">
                    <label className="label">Change Password</label>
                    <div className="auth_space">
                        <div className="field">
                        <label className="label">Old Password</label>
                        <div className="control">
                            <input
                            className="input"
                            type="password"
                            name="old_password"
                            placeholder="Enter old password"
                            />
                        </div>
                        </div>
                        <div className="field">
                        <label className="label">New Password</label>
                        <div className="control">
                            <input
                            className="input"
                            type="password"
                            name="new_password"
                            placeholder="Enter new password"
                            />
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                {/* Save Changes Button */}
                <div className="columns">
                    <div className="column is-12 is-left">
                    <button className="button is-blue" onClick={handleSaveChanges}>
                        Save Changes
                    </button>
                    </div>
                </div>
                {/* Separator Line */}
                <hr />
                </div>
            </div>
            </section>
            );
            }

            export default Profile;

