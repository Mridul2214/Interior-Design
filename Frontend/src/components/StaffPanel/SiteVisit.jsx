import React, { useState, useEffect } from 'react';
import {
    Camera,
    Upload,
    X,
    Plus,
    MapPin,
    Calendar,
    CheckCircle,
    Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { clientAPI, uploadAPI, siteVisitAPI, taskAPI } from '../../config/api';
import CustomSelect from '../common/CustomSelect';
import './css/SiteVisit.css';

const SiteVisit = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [clients, setClients] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [visitData, setVisitData] = useState({
        client: '',
        task: '',
        location: '',
        notes: '',
        visitDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await clientAPI.getAll();
                if (res.success) setClients(res.data);
            } catch (err) {
                console.error('Error fetching clients:', err);
            }
        };
        fetchClients();
    }, []);

    // Fetch tasks when client changes
    useEffect(() => {
        const fetchTasks = async () => {
            if (!visitData.client) {
                setTasks([]);
                return;
            }
            try {
                // Fetch all tasks for this client (Backend already filters by staff if needed)
                const res = await taskAPI.getAll();
                if (res.success) {
                    const clientTasks = res.data.filter(t => t.client?._id === visitData.client || t.client === visitData.client);
                    setTasks(clientTasks);
                }
            } catch (err) {
                console.error('Error fetching tasks:', err);
            }
        };
        fetchTasks();
    }, [visitData.client]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            showToast('Maximum 5 images allowed per visit', 'warning');
            return;
        }

        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (images.length === 0) {
            showToast('Please select at least one image', 'error');
            return;
        }

        setUploading(true);
        try {
            // Upload images first
            const uploadedUrls = [];
            for (const img of images) {
                const formData = new FormData();
                formData.append('image', img.file);
                const res = await uploadAPI.image(formData);
                if (res.success) uploadedUrls.push(res.url);
            }

            // Save the visit details and uploaded URLs
            await siteVisitAPI.create({
                ...visitData,
                images: uploadedUrls
            });

            showToast('Site visit details and images uploaded successfully!');
            setImages([]);
            setVisitData({
                client: '',
                location: '',
                notes: '',
                visitDate: new Date().toISOString().split('T')[0]
            });
            navigate('/staff/dashboard');
        } catch (err) {
            showToast('Failed to upload visit details', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="site-visit">
            <header className="page-header">
                <h1>Log Site Visit</h1>
                <p>Upload site photos and progress updates.</p>
            </header>

            <form onSubmit={handleUpload} className="visit-form">
                <div className="form-section card">
                    <div className="form-group site-visit-select">
                        <CustomSelect
                            label="Select Assigned Client / Project *"
                            options={clients.map(c => ({ value: c._id, label: c.name }))}
                            value={visitData.client}
                            onChange={(e) => setVisitData({ ...visitData, client: e.target.value, task: '' })}
                            placeholder="Search among your assigned clients..."
                            required
                        />
                    </div>

                    <div className="form-group site-visit-select">
                        <CustomSelect
                            label="Select Assigned Task (Optional)"
                            options={tasks.map(t => ({ value: t._id, label: t.title }))}
                            value={visitData.task}
                            onChange={(e) => setVisitData({ ...visitData, task: e.target.value })}
                            placeholder={visitData.client ? "Select related task..." : "First select a client..."}
                            disabled={!visitData.client}
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Location / Site Address</label>
                            <div className="input-with-icon">
                                <MapPin size={18} />
                                <input
                                    type="text"
                                    placeholder="Enter site locality"
                                    value={visitData.location}
                                    onChange={(e) => setVisitData({ ...visitData, location: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Visit Date</label>
                            <div className="input-with-icon">
                                <Calendar size={18} />
                                <input
                                    type="date"
                                    value={visitData.visitDate}
                                    onChange={(e) => setVisitData({ ...visitData, visitDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Progress Notes / Observation</label>
                        <textarea
                            placeholder="Describe work progress, issues found, or material requirements..."
                            rows="4"
                            value={visitData.notes}
                            onChange={(e) => setVisitData({ ...visitData, notes: e.target.value })}
                        ></textarea>
                    </div>
                </div>

                <div className="form-section card">
                    <label className="section-label">Site Photos (Max 5)</label>
                    <div className="image-upload-grid">
                        {images.map((img, index) => (
                            <div key={index} className="image-preview">
                                <img src={img.preview} alt="Site" />
                                <button type="button" className="remove-btn" onClick={() => removeImage(index)}>
                                    <X size={16} />
                                </button>
                            </div>
                        ))}

                        {images.length < 5 && (
                            <label className="upload-placeholder">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    hidden
                                />
                                <div className="placeholder-content">
                                    <Camera size={32} />
                                    <span>Add Photo</span>
                                </div>
                            </label>
                        )}
                    </div>
                    <p className="upload-hint">Upload site progress, measurements, or defects.</p>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-visit-btn" disabled={uploading}>
                        {uploading ? (
                            <>
                                <Loader size={20} className="spinner" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                <span>Complete Visit Log</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SiteVisit;
