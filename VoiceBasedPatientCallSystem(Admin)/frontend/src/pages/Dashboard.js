
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Calendar, List, Button, Typography, Space } from "antd";
import { UserOutlined, TeamOutlined, BellOutlined, ExclamationCircleOutlined, MessageOutlined, ClockCircleOutlined, BellFilled, BarChartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import BottomNavigation from "../components/BottomNavigation"; 
import ADMIN_API_BASE_URL from '../config/api';
import "./Dashboard.css"; 

const { Title, Text } = Typography;

const formatApiDate = (value) => {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getCalendarDate = (value) => {
    if (value && typeof value.toDate === 'function') {
        return value.toDate();
    }

    return new Date(value);
};

const getUserLabel = (item) => {
    const name = item.userName || item.patientName || '';
    const role = item.userRole || item.entityType || '';
    const department = item.userDepartment || (item.roomNo ? `Room ${item.roomNo}` : '');

    return [name, role, department].filter(Boolean).join(' | ');
};

const Dashboard = () => {
    const today = new Date();
    const formattedDate = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;
    const [summary, setSummary] = useState({
        totalNurses: 0,
        totalPatients: 0,
        alertsToday: 0,
        recentAlerts: [],
    });
    const [loadError, setLoadError] = useState('');
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedDateAlerts, setSelectedDateAlerts] = useState([]);
    const [alertsError, setAlertsError] = useState('');
    const [isAlertsLoading, setIsAlertsLoading] = useState(false);
    const navigate = useNavigate();

    const fetchAlertsByDate = async (dateValue) => {
        setIsAlertsLoading(true);

        try {
            const response = await axios.get(`${ADMIN_API_BASE_URL}/api/dashboard/alerts`, {
                params: { date: formatApiDate(dateValue) },
            });

            setSelectedDateAlerts(response.data);
            setAlertsError('');
        } catch (error) {
            setSelectedDateAlerts([]);
            setAlertsError('Unable to load alerts for the selected date.');
        } finally {
            setIsAlertsLoading(false);
        }
    };

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await axios.get(`${ADMIN_API_BASE_URL}/api/dashboard/summary`);
                setSummary(response.data);
                setLoadError('');
            } catch (error) {
                setLoadError('Unable to load dashboard details. Ensure admin backend is running.');
            }
        };

        fetchSummary();
        fetchAlertsByDate(today);
    }, []);

    const recentAlerts = summary.recentAlerts || [];

    const formatAlertDate = (value) => {
        const date = new Date(value);
        return {
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: date.toLocaleDateString('en-GB'),
        };
    };

    const formattedSelectedDate = selectedDate.toLocaleDateString('en-GB');

    const handleCalendarSelect = (value) => {
        const nextDate = getCalendarDate(value);

        if (Number.isNaN(nextDate.getTime())) {
            return;
        }

        setSelectedDate(nextDate);
        fetchAlertsByDate(nextDate);
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                <Title level={2} style={{ textAlign: 'center', margin: 0 }}>
                    <span style={{ fontSize: '2em' }}>👤</span> Hello, Admin
                </Title>
                <Button
                    icon={<BarChartOutlined />}
                    style={{ marginLeft: '20px' }}
                    onClick={() => navigate('/statistics')}
                />
            </div>

            <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={8}><Card><Statistic title="Total Nurses" value={summary.totalNurses} prefix={<TeamOutlined />} /></Card></Col>
                <Col span={8}><Card><Statistic title="Total Patients" value={summary.totalPatients} prefix={<UserOutlined />} /></Card></Col>
                <Col span={8}><Card><Statistic title="Alerts Today" value={summary.alertsToday} prefix={<BellOutlined />} /></Card></Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title={`Today: ${formattedDate}`}>
                        <Text strong>{"Click a date to see past alerts"}</Text>
                        <Calendar fullscreen={false} onSelect={handleCalendarSelect} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title={`Alerts on ${formattedSelectedDate}`}>
                        {loadError && <Text type="danger">{loadError}</Text>}
                        {alertsError && <Text type="danger">{alertsError}</Text>}
                        <List
                            className="dashboard-alert-list"
                            dataSource={selectedDateAlerts}
                            renderItem={(item) => (
                                <List.Item>
                                    <Space direction="vertical" size="small">
                                        <Text strong>
                                            <ExclamationCircleOutlined /> {item.title}
                                        </Text>
                                        <Text>
                                            <MessageOutlined style={{ marginRight: 8 }} /> {item.description}
                                        </Text>
                                        {getUserLabel(item) && (
                                            <Text type="secondary">User: {getUserLabel(item)}</Text>
                                        )}
                                        <Text type="secondary">
                                            <ClockCircleOutlined /> {formatAlertDate(item.createdAt).time} | {formatAlertDate(item.createdAt).date}
                                        </Text>
                                    </Space>
                                </List.Item>
                            )}
                            locale={{ emptyText: isAlertsLoading ? 'Loading alerts...' : 'No alerts found for this date.' }}
                        />
                        {!selectedDateAlerts.length && !isAlertsLoading && recentAlerts.length > 0 && (
                            <div className="dashboard-recent-alerts-hint">
                                <Text type="secondary">Recent alerts are still available in the full alerts view.</Text>
                            </div>
                        )}
                        <Button type="primary" icon={<BellFilled />} style={{ marginTop: 20, width: '100%' }} onClick={() => navigate('/alerts')}>View All Alerts</Button>
                    </Card>
                </Col>
            </Row>

            <BottomNavigation /> 
        </div>
    );
};

export default Dashboard;