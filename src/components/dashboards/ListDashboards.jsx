import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Button, Alert, Container, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import {DashboardAPIs} from "../../const/APIs";


export default function ListDashboards() {
    const [dashboards, setDashboards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [openCreateForm, setOpenCreateForm] = useState(false);
    const [newDashboard, setNewDashboard] = useState({ title: '', description: '' });
    const navigate = useNavigate();
    const jwtToken = sessionStorage.getItem('budgetPlanner-login') ? JSON.parse(sessionStorage.getItem('budgetPlanner-login')).jwt : null;
    const userId = sessionStorage.getItem('budgetPlanner-login') ? JSON.parse(window.atob(jwtToken.split('.')[1])).userId : null;

    useEffect(() => {
        fetchDashboards();
    }, [userId, jwtToken]);

    const fetchDashboards = async () => {
        if (!userId || !jwtToken) {
            console.error("Authentication error: No JWT Token or User ID found.");
            return;
        }

        try {
            const response = await axios.get(DashboardAPIs.getAllDashboardsByUserId(userId), {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });
            setDashboards(response.data);
        } catch (error) {
            console.error('Error fetching dashboards', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateDashboardOpen = () => {
        setOpenCreateForm(true);
    };

    const handleDashboardClick = (dashboardId) => {
        navigate(`/dashboard/${dashboardId}`);
    };
    const handleCreateDashboardClose = () => {
        setOpenCreateForm(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDashboard(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!jwtToken) {
            console.error("Authentication error: No JWT Token found.");
            return;
        }

        try {
            await axios.post(DashboardAPIs.create(userId), newDashboard, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });
            handleCreateDashboardClose();
            setNewDashboard({ title: '', description: '' }); // Reset form
            fetchDashboards(); // Refresh dashboards list
        } catch (error) {
            console.error('Error creating dashboard', error);
        }
    };

    return (
      <Container className="mt-5">
        {isLoading ? (
          <CircularProgress />
        ) : (
          <div className="container my-5">
            <div className="row" style={{ marginTop: "100px" }}>
              {dashboards.length === 0 && (
                <div className="col-12 text-center">
                  <h3 className="text-muted">
                    You don't have any dashboards yet.
                  </h3>
                  <Button
                    variant="contained"
                    onClick={handleCreateDashboardOpen}
                  >
                    Create Your First Dashboard
                  </Button>
                </div>
              )}
              {dashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  className="col-md-4 d-flex align-items-stretch"
                >
                  <div
                    className="card my-2"
                    style={{
                      width: "100%",
                      cursor: "pointer",
                      boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
                    }}
                    onClick={() => handleDashboardClick(dashboard.id)}
                  >
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{dashboard.title}</h5>
                      <p className="card-text" style={{ flexGrow: 1 }}>
                        {dashboard.description}
                      </p>
                      <a className="mt-2 btn btn-primary stretched-link">
                        Go to Dashboard
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* "Create New Dashboard" card */}
            <div className="col-md-4 d-flex align-items-stretch">
              <div
                className="card my-2 border-2 border-dashed border-secondary"
                style={{
                  width: "100%",
                  cursor: "pointer",
                  minHeight: "200px",
                  display: "flex",
                  flexDirection: "column", // Ensures the flex items are stacked vertically
                  justifyContent: "center", // Vertically centers the button in the card
                }}
                onClick={handleCreateDashboardOpen}
              >
                <div className="card-body d-flex justify-content-center">
                  <button className="btn btn-outline-primary">
                    <strong>Create New Dashboard</strong>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Dialog for creating a new dashboard */}
        <Dialog open={openCreateForm} onClose={() => setOpenCreateForm(false)}>
          <DialogTitle>Create New Dashboard</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Title"
              type="text"
              fullWidth
              variant="standard"
              value={newDashboard.title}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              variant="standard"
              value={newDashboard.description}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Create</Button>
          </DialogActions>
        </Dialog>
      </Container>
    );

}
