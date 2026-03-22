/* jshint ignore:start */
import React, { useEffect, useState } from 'react';
import './Nurses.css';
import NurseNavigation from '../components/NurseNavigation';
import { SearchOutlined , CheckCircleFilled} from '@ant-design/icons'; 
import axios from 'axios';
import ADMIN_API_BASE_URL from '../config/api';

const Nurses = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [nurses, setNurses] = useState([]);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        const fetchNurses = async () => {
            try {
                const response = await axios.get(`${ADMIN_API_BASE_URL}/api/nurses`);
                const normalized = response.data.map((nurse) => ({
                    id: nurse._id,
                    name: nurse.name || 'Unknown',
                    department: nurse.department || '-',
                    status: nurse.status || 'Active',
                    pendingRequests: nurse.pendingRequests || 0,
                }));

                setNurses(normalized);
                setLoadError('');
            } catch (error) {
                setLoadError('Unable to load nurse records. Ensure admin backend is running.');
            }
        };

        fetchNurses();
    }, []);

    const filteredNurses = nurses.filter(nurse =>
        Object.values(nurse).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="nurses-container">
            <h1>Nurse Records</h1>
            <div className="search-bar">
            <SearchOutlined className="search-icon" />
                <input
                    type="text"
                    placeholder="Search for nurses"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="nurses-list">
                {loadError && <div className="nurse-card">{loadError}</div>}
                {filteredNurses.map(nurse => (
                    <div key={nurse.id} className="nurse-card">
                        <div className="nurse-name">{nurse.name}</div>
                        <div className="nurse-info">
                            <span>ID: {nurse.id}</span>
                            <span>Department: {nurse.department}</span>
                        </div>
                        <div className="nurse-status">
                            Availability Status: {nurse.status}
                            {nurse.status === "Active" ? (
        <CheckCircleFilled style={{ color: 'green', fontSize: '1.5em' }} /> 
    )  : <span className="absent-circle-x"></span>}
                        </div>
                        <div className="nurse-requests">
                            Pending Requests: {nurse.pendingRequests}
                            {nurse.pendingRequests === 0 ? <span className="active-dot"></span> : <span className="critical-dot"></span>}
                        </div>
                    </div>
                ))}
            </div>
            <NurseNavigation selected="nurses" />
        </div>
    );
};

export default Nurses;
/* jshint ignore:end */