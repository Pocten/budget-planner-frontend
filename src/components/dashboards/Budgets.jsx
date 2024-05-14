import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Button, Container, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DashboardAPIs } from "../../const/APIs";
import { DashboardNavbar } from '../navbar/DashboardNavbar';


export default function Budgets() {
    const { dashboardId } = useParams();
    const [budgets, setBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newBudget, setNewBudget] = useState({ title: '', totalAmount: '', startDate: '', endDate: ''});
    const jwtToken = sessionStorage.getItem('budgetPlanner-login') ? JSON.parse(sessionStorage.getItem('budgetPlanner-login')).jwt : null;

    const navigate = useNavigate();


    const fetchBudgets = useCallback(async () => {
        if (!jwtToken) {
          navigate("/login");
          return;
        }
        setIsLoading(true);
        try {
          const response = await axios.get(DashboardAPIs.getDashboardBudgetsByDashboardId(dashboardId), {
            headers: { Authorization: `Bearer ${jwtToken}` },
          });
          setBudgets(response.data);
        } catch (error) {
          console.error('Error fetching budgets:', error);
        } finally {
          setIsLoading(false);
        }
      }, [dashboardId, jwtToken, navigate]);
    
      useEffect(() => {
        fetchBudgets();
      }, [fetchBudgets]);
    
      if (isLoading) {
        return (
          <Container>
            <CircularProgress />
          </Container>
        );
      }


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewBudget(prev => ({ ...prev, [name]: value }));
    };

    const handleAddBudget = async () => {
        if (!jwtToken) {
            console.error("Authentication error: No JWT Token found.");
            return;
        }

        try {
            await axios.post(DashboardAPIs.getDashboardBudgetsByDashboardId(dashboardId), newBudget, {
                headers: { Authorization: `Bearer ${jwtToken}` },
            });
            fetchBudgets(); 
            setNewBudget({ name: '', description: '' }); 
        } catch (error) {
            console.error('Error adding the budget', error);
        }
    };


    const handleDeleteBudget = async (budgetId) => {
      if (!jwtToken) {
        console.error("Authentication error: No JWT Token found.");
        return;
      }
  
      try {
        await axios.delete(
          DashboardAPIs.getDashboardBudgetByBudgetId(dashboardId, budgetId),
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );
  
        setBudgets((prevRecords) =>
          prevRecords.filter((budget) => budget.id !== budgetId)
        );
      } catch (error) {
        console.error("Error deleting budget record", error);
      }
    };

    return (
      <>

      <DashboardNavbar />

        <Container>
            {isLoading ? <CircularProgress /> : (
                          <div style={{ marginTop: '150px' }}>

<List>
      {budgets.map((budget) => (
        <ListItem key={budget.id}>
          <ListItemText
            primary={budget.title} // Display the budget title as the primary text
            secondary={
              <React.Fragment>
                <div>Total Amount: ${budget.totalAmount}</div>
                <div>Start Date: {new Date(budget.startDate).toLocaleDateString()}</div>
                <div>End Date: {new Date(budget.endDate).toLocaleDateString()}</div>
              </React.Fragment>
            }
            // Use React.Fragment to group multiple elements without adding extra nodes to the DOM
          />
          <ListItemSecondaryAction>
            <IconButton 
              edge="end" 
              aria-label="delete"
              onClick={() => handleDeleteBudget(budget.id)} // Ensure this function is passed as a prop and correctly deletes a budget
              style={{ cursor: "pointer" }}
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>

                </div>
            )}

            <div style={{ marginTop: '20px' }}>
                <TextField
                    label="Title"
                    name="title"
                    value={newBudget.title}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="outlined"
                />
                <TextField
                    label="TotalAmount"
                    name="totalAmount"
                    value={newBudget.totalAmount}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="outlined"
                />
                <TextField
                    label="StartDate"
                    name="startDate"
                    value={newBudget.startDate}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="outlined"
                />
                <TextField
                    label="EndDate"
                    name="endDate"
                    value={newBudget.endDate}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="outlined"
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddBudget}
                    style={{ marginLeft: '10px' }}
                >
                    Add New Budget
                </Button>
            </div>
        </Container>
        </>
    );
}
