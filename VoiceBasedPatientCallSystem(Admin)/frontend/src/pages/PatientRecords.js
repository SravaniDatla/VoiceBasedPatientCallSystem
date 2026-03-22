/* jshint ignore:start */
import React, { useEffect, useState } from 'react';
import './PatientRecords.css';
import PatientNavigation from '../components/PatientNavigation';
import { FaUserCircle, FaPhoneAlt, FaNotesMedical } from 'react-icons/fa';
import axios from 'axios';
import ADMIN_API_BASE_URL from '../config/api';

const PatientRecords = () => {
    const [patients, setPatients] = useState([]);
    const [visibleSections, setVisibleSections] = useState({});
    const [loadError, setLoadError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await axios.get(`${ADMIN_API_BASE_URL}/api/patients`);
                const normalizedPatients = response.data.map((patient) => ({
                    id: patient._id,
                    name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown',
                    dateOfBirth: patient.dateOfBirth || null,
                    gender: patient.gender || 'Not specified',
                    roomNo: patient.roomNo || 'Unassigned',
                    condition: patient.condition || 'Stable',
                    requestStatus: patient.requestStatus || 'Pending',
                    nurse: patient.nurse || 'Unassigned',
                    medicalHistory: patient.medicalHistory || 'No medical history recorded.',
                    contactNumber: patient.contactNumber || 'Not available',
                    email: patient.email || 'Not available',
                    updatedAt: patient.updatedAt,
                }));

                setPatients(normalizedPatients);
                setLoadError('');
            } catch (error) {
                setLoadError('Unable to load patient records. Ensure admin backend is running.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const toggleSection = (patientId, section) => {
        setVisibleSections((prev) => ({
            ...prev,
            [patientId]: {
                ...prev[patientId],
                [section]: !(prev[patientId] && prev[patientId][section]),
            },
        }));
    };

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return 'Not available';
        }

        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) {
            return 'Not available';
        }

        return parsedDate.toLocaleDateString();
    };

    const formatGender = (value) => {
        if (!value) {
            return 'Not specified';
        }

        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    return (
        <div className="records-container">
            <div className="records-header">
                <h1>Records Management</h1>
                <p>All patient records in the admin dashboard</p>
            </div>
            <div className="records-content">
                {isLoading && <div className="records-message-card">Loading patient records...</div>}
                {!isLoading && loadError && <div className="records-message-card">{loadError}</div>}
                {!isLoading && !loadError && patients.length === 0 && (
                    <div className="records-message-card">No patient records are available yet.</div>
                )}
                {!isLoading && !loadError && patients.map((patient) => {
                    const patientSections = visibleSections[patient.id] || {};

                    return (
                        <div key={patient.id} className="patient-record-card">
                            <div className="patient-info">
                                <div className="profile-icon">
                                    <FaUserCircle size={74} />
                                </div>
                                <div className="patient-details">
                                    <div className="patient-name">{patient.name}</div>
                                    <div className="patient-id">Patient ID: {patient.id}</div>
                                    <div className="patient-dob">DOB: {formatDate(patient.dateOfBirth)} | Sex: {formatGender(patient.gender)}</div>
                                    <div className="patient-room">Room No: {patient.roomNo}</div>
                                </div>
                            </div>
                            <div className="checkbox-options">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(patientSections.clinical)}
                                        onChange={() => toggleSection(patient.id, 'clinical')}
                                    />
                                    Clinical Details
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(patientSections.contact)}
                                        onChange={() => toggleSection(patient.id, 'contact')}
                                    />
                                    Contact Information
                                </label>
                            </div>
                            {patientSections.clinical && (
                                <div className="clinical-details">
                                    <h3><FaNotesMedical className="icon" /> Clinical Details</h3>
                                    <div className="detail-item">Condition: {patient.condition}</div>
                                    <div className="detail-item">Request Status: {patient.requestStatus}</div>
                                    <div className="detail-item">Assigned Nurse: {patient.nurse}</div>
                                    <div className="detail-item">Medical History: {patient.medicalHistory}</div>
                                    <div className="detail-item">Record Updated: {formatDate(patient.updatedAt)}</div>
                                </div>
                            )}
                            {patientSections.contact && (
                                <div className="contact-info">
                                    <h3><FaPhoneAlt className="icon" /> Contact Information</h3>
                                    <div className="detail-item">Contact: {patient.contactNumber}</div>
                                    <div className="detail-item">Email: {patient.email}</div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <PatientNavigation selected="records" />
        </div>
    );
};

export default PatientRecords;
/* jshint ignore:end */