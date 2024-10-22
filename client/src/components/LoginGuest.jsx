import React, { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import 'bulma/css/bulma.min.css';
import { IoEyeSharp, IoEyeOffSharp } from 'react-icons/io5';
import SuccessMsg from '../messages/successMsg';
import ErrorMsg from '../messages/errorMsg';
import axios from 'axios';
import '../App.css';

function LoginGuest() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false); 
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility
    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setMessage(''); 
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setMessage(''); 
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3001/api/loginGuest', {
                guest_email: email,
                guest_password: password
            });

            if (response.status === 200) {
                setMessage('Login successful!');
                setIsSuccess(true); 
                localStorage.setItem('token', response.data.token);

                setTimeout(() => {
                    setIsRedirecting(true);
                }, 1000);

                setTimeout(() => {
                    setMessage('');
                    navigate('/');
                }, 3000);
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage('Failed to login. Please check your email and password.');
            setIsSuccess(false);
        }
    };

    // Toggle password visibility
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
                                <h1 className='login-title'><strong>Login</strong></h1>
                                <div className="field">
                                    <label className="label" htmlFor="email">Email:</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={handleEmailChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="field">
                                    <label className="label" htmlFor="password">Password:</label>
                                    <div className="control is-flex">
                                        <input
                                            className="input"
                                            type={showPassword ? 'text' : 'password'} // Toggle between password and text
                                            id="password"
                                            name="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={handlePasswordChange}
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

                                <div className="field">
                                    <label>Don’t have an account? <Link to="/register">Sign Up</Link></label>
                                </div>
                            </div>

                            <div className="buttons is-centered">
                                <button className="button is-blue search" type="submit" disabled={isRedirecting}>
                                    {isRedirecting ? 'Redirecting...' : 'LOGIN'}
                                </button>
                            </div>

                            {message && isSuccess && <SuccessMsg message={message} />}
                            {message && !isSuccess && <ErrorMsg message={message} />}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default LoginGuest;
