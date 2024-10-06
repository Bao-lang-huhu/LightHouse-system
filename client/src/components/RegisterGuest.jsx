import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Add useNavigate for redirection
import 'bulma/css/bulma.min.css';
import './pages.css';
import '../App.css';
import { auth, createUserWithEmailAndPassword } from '../firebaseConfig'; 
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';
import axios from 'axios';
import { IoEyeSharp, IoEyeOffSharp } from 'react-icons/io5'; // Icons for the "peek" button

function RegisterGuest() {
    const [guest, setGuest] = useState({
        guest_fname: '',
        guest_lname: '',
        guest_birthdate: '',
        guest_address: '',
        guest_email: '',
        guest_country: '',
        guest_phone_no: '',
        guest_gender: '',
        guest_photo: '',
        guest_password: ''
    });

    const [errorMessage, setErrorMessage] = useState(''); // For error messages
    const [successMessage, setSuccessMessage] = useState(''); // For success messages
    const [isSubmitting, setIsSubmitting] = useState(false); // To disable the button during submission
    const [showPassword, setShowPassword] = useState(false); // For toggling password visibility
    const navigate = useNavigate(); // For redirection

    const handleChange = (e) => {
        setGuest({ ...guest, [e.target.name]: e.target.value });
        setErrorMessage(''); // Clear the error message on input change
        setSuccessMessage(''); // Clear the success message on input change
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear any previous error messages
        setSuccessMessage(''); // Clear any previous success messages
        setIsSubmitting(true); // Disable the submit button during submission

        try {
            // Create user in Firebase, this will validate the email automatically
            const userCredential = await createUserWithEmailAndPassword(auth, guest.guest_email, guest.guest_password);
            const firebase_uid = userCredential.user.uid; // Get Firebase UID

            if (!firebase_uid) {
                throw new Error('Firebase UID not generated');
            }

            // Send registration data along with Firebase UID to the backend
            const response = await axios.post('https://light-house-system.vercel.app/api/registerGuest', {
                ...guest,
                firebase_uid // Include Firebase UID
            });

            if (response.status === 201) {
                setSuccessMessage('Guest registered successfully! Redirecting to login...');
                setIsSubmitting(false); // Re-enable the button
                
                // Redirect to the login page after a short delay
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (error) {
            // Handle specific Firebase Auth error
            if (error.code === 'auth/email-already-in-use') {
                setErrorMessage('The email is already in use. Please use a different email.');
            } else if (error.code === 'auth/weak-password') {
                setErrorMessage('Password is too weak. Please choose a stronger password.');
            } else if (error.code === 'auth/invalid-email') {
                setErrorMessage('Invalid email format. Please provide a valid email.');
            } else {
                console.error('Error registering guest:', error);
                setErrorMessage('Failed to register guest. Error: ' + error.message); // Show any other error messages
            }
            setIsSubmitting(false); // Re-enable the submit button to allow retry
        }
    };

    return (
        <section>
            <div className="sign-up-page">
                <div className="background-image">                   
                    <div className="login-container">
                        <form onSubmit={handleSubmit}>
                            <div className="container-white">
                                <h1 className='login-title'><strong>Sign-up</strong></h1>
                                <div className='auth_space'>
                                    <div className="field"> 
                                        <label className="label" htmlFor="guest_fname">First name:</label>
                                        <div className="control">
                                            <input
                                                className="input"
                                                type="text"
                                                id="guest_fname"
                                                name="guest_fname"
                                                placeholder="Enter your first name"
                                                value={guest.guest_fname}
                                                onChange={(e) => {
                                                    const re = /^[a-zA-Z\s]*$/; // Regular expression for letters and spaces only
                                                    if (e.target.value === '' || re.test(e.target.value)) {
                                                        handleChange(e); // Allow the change only if it matches the regex
                                                    }
                                                }}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="field">
                                        <label className="label" htmlFor="guest_lname">Last name:</label>
                                        <div className="control">
                                            <input
                                                className="input"
                                                type="text"
                                                id="guest_lname"
                                                name="guest_lname"
                                                placeholder="Enter your last name"
                                                value={guest.guest_lname}
                                                onChange={(e) => {
                                                    const re = /^[a-zA-Z\s]*$/; // Regular expression for letters and spaces only
                                                    if (e.target.value === '' || re.test(e.target.value)) {
                                                        handleChange(e); // Allow the change only if it matches the regex
                                                    }
                                                }}
                                                required
                                            />
                                        </div>
                                    </div>

                                </div>

                                <div className='auth_space'>
                                    <div className="field">
                                        <label className="label">Gender:</label>
                                        <div className="control">
                                            <div className="select is-fullwidth">
                                                <select name="guest_gender" value={guest.guest_gender} onChange={handleChange} required>
                                                    <option value="">Select Gender</option>
                                                    <option value="MALE">Male</option>
                                                    <option value="FEMALE">Female</option>
                                                    <option value="Non-Binary">Non-Binary</option>
                                                    <option value="Other">Other</option>
                                                    <option value="Prefer Not To Say">Prefer Not To Say</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="field">
                                        <label className="label" htmlFor="guest_birthdate">Birthdate:</label>
                                        <div className="control">
                                            <input
                                                className="input"
                                                type="date"
                                                id="guest_birthdate"
                                                name="guest_birthdate"
                                                placeholder="Enter your birth date"
                                                value={guest.guest_birthdate}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='auth_space'>
                                    <div className="field">
                                        <label className="label" htmlFor="guest_address">Address:</label>
                                        <div className="control">
                                            <input
                                                className="input"
                                                type="text"
                                                id="guest_address"
                                                name="guest_address"
                                                placeholder="Enter your address"
                                                value={guest.guest_address}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="field">
                                        <label className="label" htmlFor="guest_country">Country:</label>
                                        <div className="control">
                                            <div className="select is-fullwidth">
                                                <select 
                                                    id="guest_country" 
                                                    name="guest_country" 
                                                    value={guest.guest_country} 
                                                    onChange={handleChange} 
                                                    required
                                                >
                                                    <option value="">Select Country</option>
                                                    <option value="Argentina">Argentina</option>
                                                    <option value="Australia">Australia</option>
                                                    <option value="Belgium">Belgium</option>
                                                    <option value="Brazil">Brazil</option>
                                                    <option value="Canada">Canada</option>
                                                    <option value="China">China</option>
                                                    <option value="Denmark">Denmark</option>
                                                    <option value="Egypt">Egypt</option>
                                                    <option value="Finland">Finland</option>
                                                    <option value="France">France</option>
                                                    <option value="Germany">Germany</option>
                                                    <option value="India">India</option>
                                                    <option value="Indonesia">Indonesia</option>
                                                    <option value="Italy">Italy</option>
                                                    <option value="Japan">Japan</option>
                                                    <option value="Malaysia">Malaysia</option>
                                                    <option value="Mexico">Mexico</option>
                                                    <option value="Netherlands">Netherlands</option>
                                                    <option value="New Zealand">New Zealand</option>
                                                    <option value="Norway">Norway</option>
                                                    <option value="Philippines">Philippines</option> {/* Mention Philippines */}
                                                    <option value="Russia">Russia</option>
                                                    <option value="Singapore">Singapore</option>
                                                    <option value="South Africa">South Africa</option>
                                                    <option value="South Korea">South Korea</option>
                                                    <option value="Spain">Spain</option>
                                                    <option value="Sweden">Sweden</option>
                                                    <option value="Switzerland">Switzerland</option>
                                                    <option value="United Kingdom">United Kingdom</option>
                                                    <option value="United States">United States</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className='auth_space'>
                                <div className="field">
                                    <label className="label" htmlFor="guest_phone_no">Contact Number:</label>
                                        <div className="control">
                                            <input
                                                className="input"
                                                type="tel"
                                                id="guest_phone_no"
                                                name="guest_phone_no"
                                                placeholder="Enter your contact number"
                                                value={guest.guest_phone_no}
                                                onChange={(e) => {
                                                    const re = /^[0-9\b]+$/; // Regular expression for numbers only
                                                    // Allow only if it's a number or backspace
                                                    if (e.target.value === '' || re.test(e.target.value)) {
                                                        handleChange(e);
                                                    }
                                                }}
                                                required
                                            />
                                        </div>
                                </div>


                                <div className="field">
                                    <label className="label" htmlFor="guest_email">Email:</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="email"
                                            id="guest_email"
                                            name="guest_email"
                                            placeholder="Enter your email"
                                            value={guest.guest_email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                </div>

                                <div className="auth_space">
                                    <div className="field">
                                        <label className="label" htmlFor="guest_password">Password:</label>
                                        <div className="field">
                                            <div className="control is-flex">
                                                <input
                                                    className="input"
                                                    type={showPassword ? "text" : "password"} // Toggle between text and password
                                                    id="guest_password"
                                                    name="guest_password"
                                                    placeholder="Enter your password"
                                                    value={guest.guest_password}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <button
                                                    type="button" // Button to toggle password visibility
                                                    className="button is-light ml-2" // Bulma button with some margin-left
                                                    onClick={togglePasswordVisibility}
                                                >
                                                    {showPassword ? <IoEyeOffSharp /> : <IoEyeSharp />} {/* Toggle icons */}
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="field">
                                    <label>Already have an account? <Link to="/login">Log in</Link></label>
                                </div>
                            </div>

                            <div className="buttons is-centered">
                                <button className="button is-blue search" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Processing...' : 'SIGN UP'}
                                </button>
                            </div>

                            {/* Display success or error message below the form */}
                            {successMessage && <SuccessMsg message={successMessage} />}
                            {errorMessage && <ErrorMsg message={errorMessage} />}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default RegisterGuest;
