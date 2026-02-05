import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
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
        <div className="login-container">
            <div className="login-card">
                <div className="login-left">
                    <div className="sphere-orb orb-large"></div>
                    <div className="sphere-orb orb-small"></div>
                    <div className="sphere-orb orb-bottom"></div>
                    <div className="left-content">
                        <h2>WELCOME</h2>
                        <h3>YOUR MODERN PANEL</h3>
                        <p>Experience the next generation of interior design management with our unified administrative tools.</p>
                    </div>
                </div>

                <div className="login-right">
                    <div className="sphere-orb orb-extra"></div>
                    <div className="login-header">
                        <h1>Sign in</h1>
                        <p>Welcome back! Please enter your details.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <div className="input-icon-box">
                                <User size={20} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="User Name / Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <div className="input-icon-box">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="show-password-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "HIDE" : "SHOW"}
                            </button>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-container" onClick={() => setRememberMe(!rememberMe)}>
                                {rememberMe ? <CheckSquare size={18} color="#004683" /> : <Square size={18} />}
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="forgot-link">Forgot Password?</a>
                        </div>

                        {error && (
                            <div className="error-banner-small">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-signin-primary"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>

                        <div className="divider">
                            <span>Or</span>
                        </div>

                        <button
                            type="button"
                            className="btn-signin-secondary"
                            onClick={fillDefaultCredentials}
                        >
                            Sign in with Guest Access
                        </button>

                        <p className="signup-footer">
                            Don't have an account? <a href="#">Sign Up</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
