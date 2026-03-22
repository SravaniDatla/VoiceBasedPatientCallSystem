/* jshint ignore:start */
import React, { useState } from 'react';
import { useEffect } from 'react';
import './Patients.css';
import PatientNavigation from '../components/PatientNavigation'; 
import { SearchOutlined,CheckCircleFilled } from '@ant-design/icons';
import axios from 'axios';
import ADMIN_API_BASE_URL from '../config/api';

const Patients = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await axios.get(`${ADMIN_API_BASE_URL}/api/patients`);
                const normalized = response.data.map((patient) => ({
                    id: patient._id,
                    name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown',
                    condition: patient.condition || 'Stable',
                    nurse: patient.nurse || '-',
                    requestStatus: patient.requestStatus || 'Pending',
                    roomNo: patient.roomNo || '-',
                }));

                setPatients(normalized);
                setLoadError('');
            } catch (error) {
                setLoadError('Unable to load patient records. Ensure admin backend is running.');
            }
        };

        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(patient =>
        Object.values(patient).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="patients-container">
            <h1>Patient Records</h1>
            <div className="search-bar">
            <SearchOutlined className="search-icon" />
                <input
                    type="text"
                    placeholder="Search for patients"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="patients-list">
                {loadError && <div className="patient-card">{loadError}</div>}
                {filteredPatients.map(patient => (
                    <div key={patient.id} className="patient-card">
                        <div className="patient-name">{patient.name}</div>
                        <div className="patient-info">
                            <span>ID: {patient.id}</span>
                            <span>Room: {patient.roomNo}</span>
                        </div>
                        <div className="patient-condition">
                            Condition: {patient.condition}
                            {patient.condition === "Critical" ? <span className="critical-dot"></span> : <span className="stable-dot"></span>}
                        </div>
                        <div className="patient-status">
                            Request Status: {patient.requestStatus}
                            {patient.requestStatus === "Fulfilled" ? (<CheckCircleFilled style={{ color: 'green', fontSize: '1.5em' }} /> 
                                )  : <span className="absent-circle-x"></span>}
                        </div>
                    </div>
                ))}
            </div>
            <PatientNavigation selected="patients" />
        </div>
    );
};

export default Patients;
/* jshint ignore:end */