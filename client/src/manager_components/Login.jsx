import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Correct named import
import 'bulma/css/bulma.min.css';
import { IoEyeSharp, IoEyeOffSharp } from 'react-icons/io5';
import SuccessMsg from '../messages/successMsg';
import ErrorMsg from '../messages/errorMsg';
import axios from 'axios';
import '../App.css';

function LoginStaff() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // Message for error/success
    const [isSuccess, setIsSuccess] = useState(false); // Boolean to track success state
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility
    const [isRedirecting, setIsRedirecting] = useState(false); // Boolean to track redirect state
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // Start the login process
            const response = await axios.post('http://localhost:3001/api/loginStaff', {
                staff_username: username,
                staff_password: password
            });

            if (response.status === 200) {
                setMessage('Login successful!');
                setIsSuccess(true);
                const token = response.data.token;
                localStorage.setItem('token', token);

                // Decode the token to get the staff_acc_role
                const decodedToken = jwtDecode(token);
                const staffRole = decodedToken.staff_acc_role;

                // Redirect based on the role after a short delay
                setTimeout(() => {
                    setIsRedirecting(true);
                }, 1000);

                setTimeout(() => {
                    setMessage('');  // Clear the message
                    setIsRedirecting(false);  // Ensure redirection state is reset
                    switch (staffRole) {
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
                            navigate('/'); // Default redirect
                            break;
                    }
                }, 3000);
            }
        } catch (error) {
            console.error('Login error:', error);

            // Display error message and allow user to retry login
            setMessage('Invalid username or password. Please try again.');
            setIsSuccess(false);
            setIsRedirecting(false); // Ensure the login button is re-enabled
        }
    };

    // Handle changes to reset the error message when credentials are updated
    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        setMessage(''); // Clear the message on any input change
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <section>
            <div className="login-page">
                <div className="background-image">
                    <div className="login-container">
                        <form onSubmit={handleLogin}>
                            <div className="container-white">
                                <h1 className='login-title'><strong>Login Staff</strong></h1>
                                <div className="field">
                                    <label className="label" htmlFor="username">Username:</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            id="username"
                                            name="username"
                                            placeholder="Enter your username"
                                            value={username}
                                            onChange={handleInputChange(setUsername)} // Call handleInputChange
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="field">
                                    <label className="label" htmlFor="password">Password:</label>
                                    <div className="control is-flex">
                                        <input
                                            className="input"
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={handleInputChange(setPassword)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="button is-blue ml-2"
                                            onClick={togglePasswordVisibility}>
                                            {showPassword ? <IoEyeOffSharp /> : <IoEyeSharp />} {/* Toggle icons */}
                                        </button>
                                    </div>
                                </div>

                            </div>

                            <div className="buttons is-centered">
                                <button className="button is-blue search" type="submit" disabled={isRedirecting}>
                                    {isRedirecting ? 'Redirecting...' : 'LOGIN'}
                                </button>
                            </div>

                            {/* Always display the latest message based on the login outcome */}
                            {message && (
                                isSuccess ? 
                                <SuccessMsg message={message} /> : 
                                <ErrorMsg message={message} />
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default LoginStaff;
