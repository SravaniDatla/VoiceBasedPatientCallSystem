/* jshint ignore:start */
import React, { useState } from 'react';
import './NewPatient.css';
import PatientNavigation from '../components/PatientNavigation';
import axios from 'axios';
import ADMIN_API_BASE_URL from '../config/api';

const NewPatient = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        contactNumber: '',
        email: '',
        gender: '',
        medicalHistory: '',
        roomNo: '',
        agreed: false,
    });
    const [alertMessage, setAlertMessage] = useState('');

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.agreed) {
            setAlertMessage('Please accept the communication consent checkbox.');
            setTimeout(() => setAlertMessage(''), 3000);
            return;
        }

        try {
            const payload = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                dateOfBirth: formData.dateOfBirth || undefined,
                contactNumber: formData.contactNumber.trim() || undefined,
                email: formData.email.trim() || undefined,
                gender: formData.gender || undefined,
                medicalHistory: formData.medicalHistory.trim() || undefined,
                roomNo: formData.roomNo.trim() || undefined,
            };

            await axios.post(`${ADMIN_API_BASE_URL}/api/patients`, payload);

            setAlertMessage('Details saved successfully!');
            setFormData({
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                contactNumber: '',
                email: '',
                gender: '',
                medicalHistory: '',
                roomNo: '',
                agreed: false,
            });
        } catch (error) {
            const message = error.response?.data?.msg || 'Unable to save patient details. Check backend and try again.';
            setAlertMessage(message);
        }

        setTimeout(() => setAlertMessage(''), 3000);
    };

    return (
        <div className="registration-container">
            <div className="registration-header">
                <h1>Patient Sign Up</h1>
            </div>
            <form className="registration-form" onSubmit={handleSubmit}>
                <h3>Patient Registration Form</h3>
                {/* <p>Please provide the following information to create your account.</p> */}
                <div className="form-group">
                    <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} /> 
                </div>
                <div className="form-group">
                    <input type="text" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="">Select your gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} placeholder="Medical History (Are previous or existing medical conditions we should be aware of? (e.g. diabetes, heart disease))"></textarea>
                </div>
                <div className="form-group">
                    <input type="text" name="roomNo" placeholder="Room Number" value={formData.roomNo} onChange={handleChange} />
                </div>
                <div className="form-group checkbox-group">
                    <input type="checkbox" id="agree" name="agreed" checked={formData.agreed} onChange={handleChange} />
                    <label htmlFor="agree">
                        I agree to receive communications from VocalCare and be contacted via email or SMS for appointment reminders and health updates.
                    </label>
                </div>
                <button className="submit-button" type="submit">Submit</button>
            </form>
            {alertMessage && <div className="alert-message">{alertMessage}</div>}
            <PatientNavigation selected="new" />
        </div>
    );
};

export default NewPatient;
/* jshint ignore:end */