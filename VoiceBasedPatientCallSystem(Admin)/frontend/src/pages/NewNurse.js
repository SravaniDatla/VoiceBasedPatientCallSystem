/* jshint ignore:start */
import React, { useState } from 'react';
import './NewNurse.css';
import NurseNavigation from '../components/NurseNavigation';
import axios from 'axios';
import ADMIN_API_BASE_URL from '../config/api';

const NewNurse = () => {
    const [alertMessage, setAlertMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        role: '',
        contactNumber: '',
        licenseNumber: '',
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            await axios.post(`${ADMIN_API_BASE_URL}/api/nurses`, {
                name: formData.name.trim(),
                department: formData.department.trim(),
                role: formData.role,
                contactNumber: formData.contactNumber.trim(),
                licenseNumber: formData.licenseNumber.trim(),
            });

            setAlertMessage('Profile saved successfully!');
            setFormData({
                name: '',
                department: '',
                role: '',
                contactNumber: '',
                licenseNumber: '',
            });
        } catch (error) {
            const message = error.response?.data?.msg || 'Unable to save nurse details. Check backend and try again.';
            setAlertMessage(message);
        }

        setTimeout(() => {
            setAlertMessage('');
        }, 3000);
    };

    return (
        <div className="registration-container">
            <div className="registration-header">
                <h1>Employee / Nurse Sign Up</h1>
            </div>
            <form className="registration-form" onSubmit={handleSubmit}>
                <h3>Registration Form</h3>
                <div className="form-group">
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        name="department"
                        placeholder="Enter your department name"
                        value={formData.department}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <select name="role" value={formData.role} onChange={handleChange} required>
                        <option value="">Select your role</option>
                        <option value="Registered Nurse">Registered Nurse</option>
                        <option value="Medical Assistant">Medical Assistant</option>
                        <option value="Ward Staff">Ward Staff</option>
                    </select>
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        name="contactNumber"
                        placeholder="Enter your contact number"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        name="licenseNumber"
                        placeholder="Enter your license number"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button className="submit-button" type="submit">Submit</button>
            </form>
            {alertMessage && <div className="alert-message">{alertMessage}</div>}
            <NurseNavigation selected="new" />
        </div>
    );
};

export default NewNurse;
/* jshint ignore:end */