
/* jshint ignore:start */
import React, { useEffect, useState } from 'react';
import './NurseRecords.css';
import NurseNavigation from '../components/NurseNavigation';
import { FaUserNurse, FaPhoneAlt, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import ADMIN_API_BASE_URL from '../config/api';

const NurseRecords = () => {
    const [nurses, setNurses] = useState([]);
    const [visibleSections, setVisibleSections] = useState({});
    const [loadError, setLoadError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNurses = async () => {
            try {
                const response = await axios.get(`${ADMIN_API_BASE_URL}/api/nurses`);
                const normalizedNurses = response.data.map((nurse) => ({
                    id: nurse._id,
                    name: nurse.name || 'Unknown',
                    licenseNumber: nurse.licenseNumber || 'Not assigned',
                    role: nurse.role || 'Registered Nurse',
                    department: nurse.department || 'General',
                    contactNumber: nurse.contactNumber || 'Not available',
                    status: nurse.status || 'Active',
                    pendingRequests: nurse.pendingRequests || 0,
                    updatedAt: nurse.updatedAt,
                }));

                setNurses(normalizedNurses);
                setLoadError('');
            } catch (error) {
                setLoadError('Unable to load available nurse records. Ensure admin backend is running.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNurses();
    }, []);

    const toggleSection = (nurseId, section) => {
        setVisibleSections((prev) => ({
            ...prev,
            [nurseId]: {
                ...prev[nurseId],
                [section]: !(prev[nurseId] && prev[nurseId][section]),
            },
        }));
    };

    const availableNurses = nurses.filter((nurse) => {
        const normalizedStatus = nurse.status.toLowerCase();
        return normalizedStatus === 'active' || normalizedStatus === 'available' || normalizedStatus === 'on duty';
    });

    const formatUpdatedAt = (dateValue) => {
        if (!dateValue) {
            return 'Recently updated';
        }

        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) {
            return 'Recently updated';
        }

        return parsedDate.toLocaleDateString();
    };

    return (
        <div className="records-container">
            <div className="records-header">
                <h1>Records Management</h1>
                <p>Available nurses in the hospital</p>
            </div>
            <div className="records-content">
                {isLoading && <div className="records-message-card">Loading nurse records...</div>}
                {!isLoading && loadError && <div className="records-message-card">{loadError}</div>}
                {!isLoading && !loadError && availableNurses.length === 0 && (
                    <div className="records-message-card">No nurses are currently marked as available in the hospital records.</div>
                )}
                {!isLoading && !loadError && availableNurses.map((nurse) => (
                    <div key={nurse.id} className="nurse-record-card">
                        {(() => {
                            const nurseSections = visibleSections[nurse.id] || {};

                            return (
                                <>
                        <div className="nurse-info">
                            <div className="nurse-icon">
                                <FaUserNurse size={84} />
                            </div>
                            <div className="nurse-details">
                                <div className="nurse-name">{nurse.name}</div>
                                <div>License No: {nurse.licenseNumber}</div>
                                <div>{nurse.role}</div>
                                <div>{nurse.department}</div>
                            </div>
                        </div>
                        <div className="checkbox-options">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={Boolean(nurseSections.schedule)}
                                    onChange={() => toggleSection(nurse.id, 'schedule')}
                                />
                                Schedule
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={Boolean(nurseSections.contact)}
                                    onChange={() => toggleSection(nurse.id, 'contact')}
                                />
                                Contact Information
                            </label>
                        </div>
                        {nurseSections.schedule && (
                            <div className="schedule">
                                <h3><FaCalendarAlt className="icon" /> Schedule</h3>
                                <div className="schedule-item">Availability Status: {nurse.status}</div>
                                <div className="schedule-item">Pending Requests: {nurse.pendingRequests}</div>
                                <div className="schedule-item">Record Updated: {formatUpdatedAt(nurse.updatedAt)}</div>
                            </div>
                        )}
                        {nurseSections.contact && (
                            <div className="contact-info">
                                <h3><FaPhoneAlt className="icon" /> Contact Information</h3>
                                <div className="contact-item">Contact: {nurse.contactNumber}</div>
                            </div>
                        )}
                                </>
                            );
                        })()}
                    </div>
                ))}
            </div>
            <NurseNavigation selected="records" />
        </div>
    );
};

export default NurseRecords;
/* jshint ignore:end */