import React, { useState, useEffect, useRef } from 'react';
import {
    Building2, FileText, Bell, Shield, User, Palette, Database,
    Save, Upload, Check, X, Eye, EyeOff, Download, Trash2
} from 'lucide-react';
import { settingsAPI, authAPI, uploadAPI } from '../../config/api';
import { BASE_IMAGE_URL } from '../../config/api';
import './css/Settings.css';

const TABS = [
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'documents', label: 'Document Defaults', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'application', label: 'App Settings', icon: Palette },
    { id: 'data', label: 'Data & Backup', icon: Database },
];

const Settings = () => {
    const [activeTab, setActiveTab] = useState('company');
    const [settings, setSettings] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Password fields
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    const logoInputRef = useRef(null);
    const avatarInputRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [settingsRes, profileRes] = await Promise.all([
                settingsAPI.get(),
                authAPI.getCurrentUser()
            ]);
            if (settingsRes.success) setSettings(settingsRes.data);
            if (profileRes.success) setProfile(profileRes.data);
        } catch (err) {
            showToast('error', 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type, message) => {
        setToast({ type, message });
    };

    const updateSettingsField = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const saveSettings = async (section) => {
        try {
            setSaving(true);
            const res = await settingsAPI.update({ [section]: settings[section] });
            if (res.success) {
                showToast('success', 'Settings saved successfully!');
            }
        } catch (err) {
            showToast('error', err.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const saveProfile = async () => {
        try {
            setSaving(true);
            const res = await authAPI.updateProfile({
                fullName: profile.fullName,
                email: profile.email,
                phone: profile.phone,
                avatar: profile.avatar
            });
            if (res.success) {
                setProfile(res.data);
                // Update localStorage
                const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...savedUser, ...res.data }));
                showToast('success', 'Profile updated successfully!');
            }
        } catch (err) {
            showToast('error', err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            showToast('error', 'Passwords do not match');
            return;
        }
        if (passwords.newPassword.length < 6) {
            showToast('error', 'Password must be at least 6 characters');
            return;
        }
        try {
            setSaving(true);
            const res = await authAPI.updatePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            if (res.success) {
                // Update token
                if (res.token) {
                    localStorage.setItem('token', res.token);
                }
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
                showToast('success', 'Password changed successfully!');
            }
        } catch (err) {
            showToast('error', err.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setSaving(true);
            const res = await uploadAPI.image(formData);
            if (res.success) {
                if (type === 'logo') {
                    updateSettingsField('company', 'companyLogo', res.data.url || res.data.path);
                } else if (type === 'avatar') {
                    setProfile(prev => ({ ...prev, avatar: res.data.url || res.data.path }));
                }
                showToast('success', 'Image uploaded successfully!');
            }
        } catch (err) {
            showToast('error', 'Failed to upload image');
        } finally {
            setSaving(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${BASE_IMAGE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    // ---------- Tab Content Renderers ----------

    const renderCompanyProfile = () => (
        <>
            <h3 className="settings-section-title">Company Profile</h3>
            <p className="settings-section-desc">Your business identity used across quotations, invoices, and reports.</p>
            <hr className="settings-divider" />

            <div className="settings-form-group full-width" style={{ marginBottom: '1.75rem' }}>
                <label>Company Logo</label>
                <div className="settings-upload-area" onClick={() => logoInputRef.current?.click()}>
                    <div className="settings-upload-preview">
                        {settings?.company?.companyLogo ? (
                            <img src={getImageUrl(settings.company.companyLogo)} alt="Logo" />
                        ) : (
                            <Building2 size={28} color="#94a3b8" />
                        )}
                    </div>
                    <div className="settings-upload-info">
                        <h4>Upload Company Logo</h4>
                        <p>Recommended: 200×200px, PNG or JPG</p>
                    </div>
                    <span className="settings-upload-btn">
                        <Upload size={14} /> Upload
                    </span>
                    <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'logo')}
                    />
                </div>
            </div>

            <div className="settings-form-grid">
                <div className="settings-form-group">
                    <label>Company Name</label>
                    <input
                        className="settings-input"
                        value={settings?.company?.companyName || ''}
                        onChange={(e) => updateSettingsField('company', 'companyName', e.target.value)}
                        placeholder="Your company name"
                    />
                </div>
                <div className="settings-form-group">
                    <label>Email</label>
                    <input
                        className="settings-input"
                        type="email"
                        value={settings?.company?.email || ''}
                        onChange={(e) => updateSettingsField('company', 'email', e.target.value)}
                        placeholder="info@yourcompany.com"
                    />
                </div>
                <div className="settings-form-group">
                    <label>Phone</label>
                    <input
                        className="settings-input"
                        value={settings?.company?.phone || ''}
                        onChange={(e) => updateSettingsField('company', 'phone', e.target.value)}
                        placeholder="+91 9876543210"
                    />
                </div>
                <div className="settings-form-group">
                    <label>GSTIN / Tax ID</label>
                    <input
                        className="settings-input"
                        value={settings?.company?.gstin || ''}
                        onChange={(e) => updateSettingsField('company', 'gstin', e.target.value)}
                        placeholder="22AAAAA0000A1Z5"
                    />
                </div>
                <div className="settings-form-group">
                    <label>Website</label>
                    <input
                        className="settings-input"
                        value={settings?.company?.website || ''}
                        onChange={(e) => updateSettingsField('company', 'website', e.target.value)}
                        placeholder="https://yourcompany.com"
                    />
                </div>
                <div className="settings-form-group full-width">
                    <label>Address</label>
                    <textarea
                        className="settings-textarea"
                        value={settings?.company?.address || ''}
                        onChange={(e) => updateSettingsField('company', 'address', e.target.value)}
                        placeholder="Full business address"
                        rows={3}
                    />
                </div>
            </div>

            <div className="settings-save-row">
                <button className="btn-settings-save" onClick={() => saveSettings('company')} disabled={saving}>
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </>
    );

    const renderDocumentDefaults = () => (
        <>
            <h3 className="settings-section-title">Document Defaults</h3>
            <p className="settings-section-desc">Default values used when creating new quotations and invoices.</p>
            <hr className="settings-divider" />

            <div className="settings-form-grid">
                <div className="settings-form-group">
                    <label>Default Tax Rate (%)</label>
                    <input
                        className="settings-input"
                        type="number"
                        min="0"
                        max="100"
                        value={settings?.documents?.defaultTaxRate ?? 18}
                        onChange={(e) => updateSettingsField('documents', 'defaultTaxRate', Number(e.target.value))}
                    />
                </div>
                <div className="settings-form-group">
                    <label>Currency Symbol</label>
                    <input
                        className="settings-input"
                        value={settings?.documents?.currencySymbol || '₹'}
                        onChange={(e) => updateSettingsField('documents', 'currencySymbol', e.target.value)}
                        placeholder="₹"
                    />
                </div>
                <div className="settings-form-group">
                    <label>Quotation Prefix</label>
                    <input
                        className="settings-input"
                        value={settings?.documents?.quotationPrefix || 'QT-'}
                        onChange={(e) => updateSettingsField('documents', 'quotationPrefix', e.target.value)}
                        placeholder="QT-"
                    />
                </div>
                <div className="settings-form-group">
                    <label>Invoice Prefix</label>
                    <input
                        className="settings-input"
                        value={settings?.documents?.invoicePrefix || 'INV-'}
                        onChange={(e) => updateSettingsField('documents', 'invoicePrefix', e.target.value)}
                        placeholder="INV-"
                    />
                </div>
                <div className="settings-form-group">
                    <label>Quotation Validity (Days)</label>
                    <input
                        className="settings-input"
                        type="number"
                        min="1"
                        value={settings?.documents?.quotationValidity ?? 30}
                        onChange={(e) => updateSettingsField('documents', 'quotationValidity', Number(e.target.value))}
                    />
                </div>
                <div className="settings-form-group full-width">
                    <label>Default Terms & Conditions</label>
                    <textarea
                        className="settings-textarea"
                        value={settings?.documents?.defaultTerms || ''}
                        onChange={(e) => updateSettingsField('documents', 'defaultTerms', e.target.value)}
                        placeholder="Enter default terms and conditions for quotations and invoices..."
                        rows={4}
                    />
                </div>
                <div className="settings-form-group full-width">
                    <label>Default Notes</label>
                    <textarea
                        className="settings-textarea"
                        value={settings?.documents?.defaultNotes || ''}
                        onChange={(e) => updateSettingsField('documents', 'defaultNotes', e.target.value)}
                        placeholder="Enter default notes..."
                        rows={3}
                    />
                </div>
            </div>

            <div className="settings-save-row">
                <button className="btn-settings-save" onClick={() => saveSettings('documents')} disabled={saving}>
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </>
    );

    const renderNotifications = () => (
        <>
            <h3 className="settings-section-title">Notification Preferences</h3>
            <p className="settings-section-desc">Control how and when notifications are triggered.</p>
            <hr className="settings-divider" />

            <div className="settings-form-grid">
                <div className="settings-form-group">
                    <label>Task Deadline Reminder (Hours Before)</label>
                    <input
                        className="settings-input"
                        type="number"
                        min="1"
                        value={settings?.notifications?.taskDeadlineHours ?? 24}
                        onChange={(e) => updateSettingsField('notifications', 'taskDeadlineHours', Number(e.target.value))}
                    />
                </div>
                <div className="settings-form-group">
                    <label>Low Stock Alert Threshold</label>
                    <input
                        className="settings-input"
                        type="number"
                        min="1"
                        value={settings?.notifications?.lowStockThreshold ?? 10}
                        onChange={(e) => updateSettingsField('notifications', 'lowStockThreshold', Number(e.target.value))}
                    />
                </div>
                <div className="settings-form-group">
                    <label>Quotation Expiry Warning (Days Before)</label>
                    <input
                        className="settings-input"
                        type="number"
                        min="1"
                        value={settings?.notifications?.quotationExpiryDays ?? 7}
                        onChange={(e) => updateSettingsField('notifications', 'quotationExpiryDays', Number(e.target.value))}
                    />
                </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                <div className="settings-toggle-row">
                    <div className="toggle-label-group">
                        <span className="toggle-title">Email Notifications</span>
                        <span className="toggle-desc">Send email alerts for important events (coming soon)</span>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={settings?.notifications?.emailNotifications || false}
                            onChange={(e) => updateSettingsField('notifications', 'emailNotifications', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>

            <div className="settings-save-row">
                <button className="btn-settings-save" onClick={() => saveSettings('notifications')} disabled={saving}>
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </>
    );

    const renderSecurity = () => (
        <>
            <h3 className="settings-section-title">Security Settings</h3>
            <p className="settings-section-desc">Manage access policies and security preferences.</p>
            <hr className="settings-divider" />

            <div className="settings-form-grid">
                <div className="settings-form-group">
                    <label>Default Role for New Users</label>
                    <select
                        className="settings-select"
                        value={settings?.security?.defaultRole || 'User'}
                        onChange={(e) => updateSettingsField('security', 'defaultRole', e.target.value)}
                    >
                        <option value="User">User</option>
                        <option value="Staff">Staff</option>
                        <option value="Designer">Designer</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
                <div className="settings-form-group">
                    <label>Minimum Password Length</label>
                    <input
                        className="settings-input"
                        type="number"
                        min="4"
                        max="32"
                        value={settings?.security?.minPasswordLength ?? 6}
                        onChange={(e) => updateSettingsField('security', 'minPasswordLength', Number(e.target.value))}
                    />
                </div>
                <div className="settings-form-group">
                    <label>Session Timeout</label>
                    <select
                        className="settings-select"
                        value={settings?.security?.sessionTimeout || '30d'}
                        onChange={(e) => updateSettingsField('security', 'sessionTimeout', e.target.value)}
                    >
                        <option value="1d">1 Day</option>
                        <option value="7d">7 Days</option>
                        <option value="14d">14 Days</option>
                        <option value="30d">30 Days</option>
                        <option value="90d">90 Days</option>
                    </select>
                </div>
            </div>

            <div className="settings-save-row">
                <button className="btn-settings-save" onClick={() => saveSettings('security')} disabled={saving}>
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </>
    );

    const renderProfile = () => {
        const initials = profile?.fullName
            ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
            : '?';

        return (
            <>
                <h3 className="settings-section-title">My Profile</h3>
                <p className="settings-section-desc">Update your personal information and password.</p>
                <hr className="settings-divider" />

                <div className="profile-header-card">
                    <div className="profile-avatar-large" onClick={() => avatarInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                        {profile?.avatar ? (
                            <img src={getImageUrl(profile.avatar)} alt="Avatar" />
                        ) : (
                            initials
                        )}
                    </div>
                    <div className="profile-info">
                        <h3>{profile?.fullName || 'User'}</h3>
                        <p>{profile?.email} · {profile?.role}</p>
                    </div>
                    <span className="settings-upload-btn" onClick={() => avatarInputRef.current?.click()}>
                        <Upload size={14} /> Change Photo
                    </span>
                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'avatar')}
                    />
                </div>

                <div className="settings-form-grid">
                    <div className="settings-form-group">
                        <label>Full Name</label>
                        <input
                            className="settings-input"
                            value={profile?.fullName || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                        />
                    </div>
                    <div className="settings-form-group">
                        <label>Email</label>
                        <input
                            className="settings-input"
                            type="email"
                            value={profile?.email || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>
                    <div className="settings-form-group">
                        <label>Phone</label>
                        <input
                            className="settings-input"
                            value={profile?.phone || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        />
                    </div>
                    <div className="settings-form-group">
                        <label>Role</label>
                        <input className="settings-input" value={profile?.role || ''} disabled style={{ opacity: 0.6 }} />
                    </div>
                </div>

                <div className="settings-save-row" style={{ borderTop: 'none', marginTop: '1rem', paddingTop: 0 }}>
                    <button className="btn-settings-save" onClick={saveProfile} disabled={saving}>
                        <Save size={16} /> {saving ? 'Saving...' : 'Update Profile'}
                    </button>
                </div>

                {/* Password Change Section */}
                <div className="password-section">
                    <h4>Change Password</h4>
                    <p className="section-desc">Update your password to keep your account secure.</p>

                    <div className="settings-form-grid" style={{ marginTop: '1rem' }}>
                        <div className="settings-form-group" style={{ position: 'relative' }}>
                            <label>Current Password</label>
                            <input
                                className="settings-input"
                                type={showPasswords.current ? 'text' : 'password'}
                                value={passwords.currentPassword}
                                onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                style={{
                                    position: 'absolute', right: '12px', top: '32px',
                                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'
                                }}
                            >
                                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div className="settings-form-group" style={{ position: 'relative' }}>
                            <label>New Password</label>
                            <input
                                className="settings-input"
                                type={showPasswords.new ? 'text' : 'password'}
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                style={{
                                    position: 'absolute', right: '12px', top: '32px',
                                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'
                                }}
                            >
                                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div className="settings-form-group" style={{ position: 'relative' }}>
                            <label>Confirm New Password</label>
                            <input
                                className="settings-input"
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                style={{
                                    position: 'absolute', right: '12px', top: '32px',
                                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'
                                }}
                            >
                                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="settings-save-row">
                        <button
                            className="btn-settings-save"
                            onClick={changePassword}
                            disabled={saving || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
                        >
                            <Shield size={16} /> {saving ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </div>
            </>
        );
    };

    const renderApplication = () => (
        <>
            <h3 className="settings-section-title">Application Settings</h3>
            <p className="settings-section-desc">General app-level configuration and branding.</p>
            <hr className="settings-divider" />

            <div className="settings-form-grid">
                <div className="settings-form-group">
                    <label>Brand Name</label>
                    <input
                        className="settings-input"
                        value={settings?.application?.brandName || ''}
                        onChange={(e) => updateSettingsField('application', 'brandName', e.target.value)}
                        placeholder="Interior Design"
                    />
                </div>
                <div className="settings-form-group">
                    <label>Brand Subtitle</label>
                    <input
                        className="settings-input"
                        value={settings?.application?.brandSubtitle || ''}
                        onChange={(e) => updateSettingsField('application', 'brandSubtitle', e.target.value)}
                        placeholder="Admin Panel"
                    />
                </div>
                <div className="settings-form-group">
                    <label>Accent Color</label>
                    <div className="color-picker-row">
                        <input
                            type="color"
                            className="color-picker-input"
                            value={settings?.application?.accentColor || '#2563eb'}
                            onChange={(e) => updateSettingsField('application', 'accentColor', e.target.value)}
                        />
                        <span className="color-picker-hex">{settings?.application?.accentColor || '#2563eb'}</span>
                    </div>
                </div>
                <div className="settings-form-group">
                    <label>Date Format</label>
                    <select
                        className="settings-select"
                        value={settings?.application?.dateFormat || 'DD/MM/YYYY'}
                        onChange={(e) => updateSettingsField('application', 'dateFormat', e.target.value)}
                    >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                </div>
                <div className="settings-form-group">
                    <label>Timezone</label>
                    <select
                        className="settings-select"
                        value={settings?.application?.timezone || 'Asia/Kolkata'}
                        onChange={(e) => updateSettingsField('application', 'timezone', e.target.value)}
                    >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                        <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                    </select>
                </div>
            </div>

            <div className="settings-save-row">
                <button className="btn-settings-save" onClick={() => saveSettings('application')} disabled={saving}>
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </>
    );

    const renderData = () => (
        <>
            <h3 className="settings-section-title">Data & Backup</h3>
            <p className="settings-section-desc">Export data and manage system cleanup.</p>
            <hr className="settings-divider" />

            <div className="data-info-card">
                <div className="info-icon"><Download size={20} /></div>
                <div className="info-text">
                    <h4>Export All Data</h4>
                    <p>Download a CSV export of all quotations, invoices, clients, and inventory data.</p>
                </div>
                <button className="btn-data-action" onClick={() => showToast('success', 'Export feature coming soon!')}>
                    Export CSV
                </button>
            </div>

            <div className="data-info-card">
                <div className="info-icon"><Trash2 size={20} /></div>
                <div className="info-text">
                    <h4>Clear Old Notifications</h4>
                    <p>Delete all read notifications older than 30 days to keep things clean.</p>
                </div>
                <button className="btn-data-action danger" onClick={() => showToast('success', 'Cleanup feature coming soon!')}>
                    Clean Up
                </button>
            </div>

            <div className="data-info-card">
                <div className="info-icon"><Database size={20} /></div>
                <div className="info-text">
                    <h4>System Information</h4>
                    <p>Server status, database connection, and uptime information.</p>
                </div>
                <button className="btn-data-action" onClick={() => showToast('success', 'System info coming soon!')}>
                    View Info
                </button>
            </div>
        </>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'company': return renderCompanyProfile();
            case 'documents': return renderDocumentDefaults();
            case 'notifications': return renderNotifications();
            case 'security': return renderSecurity();
            case 'profile': return renderProfile();
            case 'application': return renderApplication();
            case 'data': return renderData();
            default: return renderCompanyProfile();
        }
    };

    if (loading) {
        return (
            <div className="settings-container">
                <div className="settings-loading">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="settings-container">
            <div className="settings-wrapper">
                <div className="settings-header">
                    <h2>Settings</h2>
                    <p>Manage your application configuration and preferences</p>
                </div>

                <div className="settings-layout">
                    {/* Left Tab Navigation */}
                    <div className="settings-tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon size={18} className="tab-icon" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="settings-content">
                        <div className="settings-section-card">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast notification */}
            {toast && (
                <div className={`settings-toast ${toast.type}`}>
                    {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default Settings;
