import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../config/api';
import './css/Login.css';

const Login = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login(formData);

            if (response.success) {
                // Store token and user data
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.data));

                // Call success callback
                onLoginSuccess(response.data);
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const fillDefaultCredentials = () => {
        setFormData({
            email: 'admin@interiordesign.com',
            password: 'admin123'
        });
    };

    return (
        <div className="login-page">
            <div className="login-wrapper">

                {/* Left Side: Editorial Content */}
                <div className="content-side">
                    <h1>The Future <br /> of Interior.</h1>
                    <p>Curating exceptional spaces where architecture meets emotion. Access your private portfolio and start designing your next masterpiece.</p>

                    <div className="stat-row">
                        <div className="stat-item">
                            <b>12k+</b>
                            <span>Projects</span>
                        </div>
                        <div className="stat-item">
                            <b>45</b>
                            <span>Awards</span>
                        </div>
                        <div className="stat-item">
                            <b>18</b>
                            <span>Countries</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Floating Login Form */}
                <div className="login-form-container">
                    <div className="logo-container">
                        <div className="logo-icon">
                            <span></span><span></span><span></span>
                            <span></span><span></span><span></span>
                            <span></span><span></span><span></span>
                        </div>
                        <div className="logo-text">INTERIOR TECH</div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <div className="input-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="EMAIL ADDRESS"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="modern-input"
                            />
                        </div>

                        <div className="input-group">
                            <div className="input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="PASSWORD"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="modern-input"
                                />
                                <button
                                    type="button"
                                    className="toggle-password-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <a href="#" className="sub-link">FORGOT PASSWORD?</a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-login-dark"
                            disabled={loading}
                        >
                            {loading ? "SIGNING IN..." : "SIGN IN"}
                        </button>
                    </form>

                    <div className="signup-text">
                        DON'T HAVE AN ACCOUNT? <a href="#" className="signup-link">JOIN US</a>
                    </div>

                    <button
                        type="button"
                        className="guest-access-btn"
                        onClick={fillDefaultCredentials}
                    >
                        Guest Access
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Login;
