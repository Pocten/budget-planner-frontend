import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { CircularProgress, Button, Container, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DashboardAPIs } from "../../const/APIs";
import { DashboardNavbar } from '../navbar/DashboardNavbar';


export default function FinancialGoals() {
    const { dashboardId } = useParams();
    const [financialGoals, setFinancialGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newFinancialGoal, setNewFinancialGoal] = useState({ title: '', targetAmount: '', currentAmount: '', deadline: ''});
    const jwtToken = sessionStorage.getItem('budgetPlanner-login') ? JSON.parse(sessionStorage.getItem('budgetPlanner-login')).jwt : null;


    const fetchFinancialGoals = useCallback(async () => {
      setIsLoading(true);
      try {
          const response = await axios.get(DashboardAPIs.getDashboardFinancialGoalByDashboardId(dashboardId), {
              headers: { Authorization: `Bearer ${jwtToken}` },
          });
          setFinancialGoals(response.data);
      } catch (error) {
          console.error('Error fetching financial goals in Budget page', error);
      } finally {
          setIsLoading(false);
      }
  }, [dashboardId, jwtToken]);
  
  useEffect(() => {
    fetchFinancialGoals();
}, [fetchFinancialGoals]);


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewFinancialGoal(prev => ({ ...prev, [name]: value }));
    };

    const handleAddFinancialGoal = async () => {
        if (!jwtToken) {
            console.error("Authentication error: No JWT Token found.");
            return;
        }

        try {
            await axios.post(DashboardAPIs.getDashboardFinancialGoalByDashboardId(dashboardId), newFinancialGoal, {
                headers: { Authorization: `Bearer ${jwtToken}` },
            });
            fetchFinancialGoals(); 
            setNewFinancialGoal({ title: '', targetAmount: '', currentAmount: '', deadline: '' }); 
        } catch (error) {
            console.error('Error adding the financial category', error);
        }
    };




    return (
      <>
        <DashboardNavbar />

        <Container>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <div style={{ marginTop: "150px" }}>
              <List>
                {financialGoals.map((financialGoal) => (
                  <ListItem key={financialGoal.id}>
                    <ListItemText
                      primary={financialGoal.title}
                      secondary={financialGoal.targetAmount}
                    />
                    <React.Fragment>
                          <div>Target Amount: ${financialGoal.targetAmount}</div>
                          <div>
                            Deadline :{" "}
                            {new Date(financialGoal.deadline).toLocaleDateString()}
                          </div>
                          <div>Current Amount: ${financialGoal.currentAmount}</div>

                        </React.Fragment>
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="delete">
                        <DeleteIcon
                          //onClick={() => handleDeleteCategory(category.id)}
                          style={{ cursor: "pointer" }}
                        />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            <TextField
              label="Title"
              name="title"
              value={newFinancialGoal.title}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="TargetlAmount"
              name="targetAmount"
              value={newFinancialGoal.targetAmount}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="CurrentAmount"
              name="currentAmount"
              value={newFinancialGoal.currentAmount}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="Deadline"
              name="deadline"
              value={newFinancialGoal.deadline}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddFinancialGoal} // Attach the function here
              disabled={
                !newFinancialGoal.title ||
                !newFinancialGoal.targetAmount ||
                !newFinancialGoal.deadline
              } // Optionally disable if required fields are empty
              style={{ marginLeft: "10px" }}
            >
              Add New Financial Goal
            </Button>
          </div>
        </Container>
      </>
    );
}
