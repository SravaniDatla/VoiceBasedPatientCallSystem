import React, { useEffect, useState } from "react";
import { List, Badge, Typography, Space } from "antd";
import axios from 'axios';
import BottomNavigation from "../components/BottomNavigation";
import ADMIN_API_BASE_URL from '../config/api';


const { Title } = Typography;

const getUserLabel = (item) => {
    const name = item.userName || item.patientName || '';
    const role = item.userRole || item.entityType || '';
    const department = item.userDepartment || (item.roomNo ? `Room ${item.roomNo}` : '');

    const segments = [name, role, department].filter(Boolean);
    return segments.join(' | ');
};

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
      const fetchAlerts = async () => {
          try {
              const response = await axios.get(`${ADMIN_API_BASE_URL}/api/dashboard/alerts`);
              setAlerts(response.data);
          } catch (error) {
              setAlerts([]);
          }
      };

      fetchAlerts();
  }, []);

  return (
      <div className="alerts-container">
          <Title level={2} style={{ textAlign: "center" }}>Admin Alerts</Title>
          <List
              dataSource={alerts}
              renderItem={(item) => (
                  <List.Item>
                      <Space direction="vertical" size={2}>
                          <Badge status={item.severity} text={`${item.title}: ${item.description}`} />
                          {getUserLabel(item) && (
                              <Typography.Text type="secondary">User: {getUserLabel(item)}</Typography.Text>
                          )}
                      </Space>
                  </List.Item>
              )}
              locale={{ emptyText: 'No admin alerts yet.' }}
          />
          <BottomNavigation /> 
      </div>
  );
};

export default AdminAlerts;
