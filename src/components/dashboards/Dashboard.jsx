import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Outlet } from 'react-router-dom';
import { DashboardNavbar } from '../navbar/DashboardNavbar';
import {DashboardAPIs} from "../../const/APIs";

export default function Dashboard() {
    const { dashboardId } = useParams();
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        const jwtToken = sessionStorage.getItem('budgetPlanner-login')
            ? JSON.parse(sessionStorage.getItem('budgetPlanner-login')).jwt
            : null;
        
        if (!jwtToken) {
            navigate('/login'); // Redirect to login if there is no token
            return;
        }
        
        const userId = JSON.parse(window.atob(jwtToken.split('.')[1])).userId;

        const fetchDashboards = async () => {
            try {
                const response = await axios.get(DashboardAPIs.getUserDashboardById(userId, dashboardId), {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                });
                setDashboard(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                // Handle error appropriately
            }
        };

        fetchDashboards();
    }, [dashboardId, navigate]);

    if (!dashboard) {
        return <div>Loading dashboard details...</div>; // Loading state
    }

    return (
        <>
      <DashboardNavbar />
      <Outlet /> {/* This will render the matched nested route */}
    </>
    );
    };
    
