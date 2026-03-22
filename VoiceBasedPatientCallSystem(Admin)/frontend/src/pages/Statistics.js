import React, { useEffect, useState } from "react";
import { Card ,  Typography} from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from 'axios';
import BottomNavigation from "../components/BottomNavigation";
import ADMIN_API_BASE_URL from '../config/api';
import "./Statistics.css";

const { Title } = Typography;

const Statistics = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
      const fetchStatistics = async () => {
          try {
              const response = await axios.get(`${ADMIN_API_BASE_URL}/api/dashboard/statistics`);
              setData(response.data);
          } catch (error) {
              setData([]);
          }
      };

      fetchStatistics();
  }, []);

  return (
      <div className="statistics-container">
          <Title level={2} style={{ textAlign: "center" }}>Admin Activity Statistics</Title>
          <Card title="Admin Activity Statistics">
              <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{ r: 5, fill: "#8884d8" }} />
                  </LineChart>
              </ResponsiveContainer>
          </Card>
          <BottomNavigation /> 
      </div>
  );
};

export default Statistics;