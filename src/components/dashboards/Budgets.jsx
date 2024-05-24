import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { CircularProgress, Button, Container, TextField, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DashboardAPIs } from "../../const/APIs";
import { DashboardNavbar } from '../navbar/DashboardNavbar';


export default function Budgets() {
    const { dashboardId } = useParams();
    const [budgets, setBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newBudget, setNewBudget] = useState({ title: '', totalAmount: '', startDate: '', endDate: ''});
    const jwtToken = sessionStorage.getItem('budgetPlanner-login') ? JSON.parse(sessionStorage.getItem('budgetPlanner-login')).jwt : null;
    const [editFormData, setEditFormData] = useState({
        title: "",
        totalAmount: "",
        startDate: "",
        endDate: "",
      });
      const [editingId, setEditingId] = useState(null);

      const [formErrors, setFormErrors] = useState({
        totalAmount: false      });

    const fetchBudgets = useCallback(async () => {
      setIsLoading(true);
      try {
          const response = await axios.get(DashboardAPIs.getDashboardBudgetsByDashboardId(dashboardId), {
              headers: { Authorization: `Bearer ${jwtToken}` },
          });
          setBudgets(response.data);
      } catch (error) {
          console.error('Error fetching budgets in Budget page', error);
      } finally {
          setIsLoading(false);
      }
  }, [dashboardId, jwtToken]); 
  
  useEffect(() => {
    fetchBudgets();
}, [fetchBudgets]);


const handleEditClick = (budget) => {
    setEditingId(budget.id);
    setEditFormData({
      title: budget.title,
      totalAmount: budget.totalAmount,
      startDate: budget.startDate,
      endDate: budget.endDate 
    });
  };


  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (editingId) {
        // Updating existing goal
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    } else {
        // Adding new goal
        setNewBudget(prev => ({
            ...prev,
            [name]: value
        }));
       
    }
};
    const handleAddBudget = async () => {
        if (!jwtToken) {
            console.error("Authentication error: No JWT Token found.");
            return;
        }

        if (!newBudget.title || !newBudget.totalAmount || !newBudget.startDate || !newBudget.endDate) {
            alert("All fields are required.");
            return;
          }
          if (Object.values(formErrors).some(err => err)) {
            alert("Please fix the errors before submitting.");
            return;
          }

        try {
            await axios.post(DashboardAPIs.getDashboardBudgetsByDashboardId(dashboardId), newBudget, {
                headers: { Authorization: `Bearer ${jwtToken}` },
            });
            fetchBudgets(); 
            setNewBudget({ title: '', totalAmount: '', startDate:'', endDate:'' }); 
        } catch (error) {
            console.error('Error adding the budget', error);
        }
    };
  const handleSave = async () => {
    if (!jwtToken) {
      console.error("Authentication error: No JWT Token found.");
      return;
    }
    

    try {
      await axios.put(DashboardAPIs.getDashboardBudgetByBudgetId(dashboardId, editingId), editFormData, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setEditingId(null); // Clear editing mode
      window.location.reload(); // Reload to fetch updated data
    } catch (error) {
      console.error('Error updating the financial goal', error);
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
          {isLoading ? (
            <CircularProgress />
          ) : (
            <div style={{ marginTop: "150px" }}>
              <List>
                {budgets.map((budget) => (
                  <ListItem
                    key={budget.id}
                    onDoubleClick={() => handleEditClick(budget)}
                  >
                    {editingId === budget.id ? (
                      <div>
                        <TextField
                          label="Title"
                          name="title"
                          value={editFormData.title}
                          onChange={handleInputChange}
                          error={!!formErrors.title}
                          helperText={formErrors.title}
                        />
                        <TextField
                          label="Total Amount"
                          name="totalAmount"
                          value={editFormData.totalAmount}
                          onChange={handleInputChange}
                          error={!!formErrors.totalAmount}
                          helperText={formErrors.totalAmount}
                        />
                        <TextField
                          label="Start Date"
                          name="startDate"
                          type="date"
                          value={editFormData.startDate}
                          onChange={handleInputChange}
                          InputLabelProps={{ shrink: true }}
                          error={!!formErrors.startDate}
                          helperText={formErrors.startDate}
                        />
                        <TextField
                          label="End Date"
                          name="endDate"
                          type="date"
                          value={editFormData.endDate}
                          onChange={handleInputChange}
                          InputLabelProps={{ shrink: true }}
                          error={!!formErrors.endDate}
                          helperText={formErrors.endDate}
                        />
                        <Button onClick={handleSave} color="primary">
                          Save
                        </Button>
                      </div>
                    ) : (
                      <>
                        <ListItemText
                          primary={   <div
                            style={{  fontWeight: "bold" }}
                          > {budget.title} </div>} 
                          secondary={
                            <React.Fragment>
                              <div
                                style={{ color: "green", fontWeight: "bold" }}
                              >
                                Total Amount: ${budget.totalAmount}
                              </div>
                              <div>
                                Start Date:{" "}
                                {new Date(
                                  budget.startDate
                                ).toLocaleDateString()}
                              </div>
                              <div>
                                End Date:{" "}
                                {new Date(budget.endDate).toLocaleDateString()}
                              </div>
                            </React.Fragment>
                          }
                        />

                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteBudget(budget.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </ListItem>
                ))}
              </List>
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
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
              label="Start Date"
              name="startDate"
              type="date"
              value={newBudget.startDate}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: true }} // Ensures the label doesn't overlap with the value when a date is selected
            />
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={newBudget.endDate}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: true }} // Similarly, ensures proper label placement
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleAddBudget}
              style={{ marginLeft: "10px" }}
            >
              Add New Budget
            </Button>
          </div>
        </Container>
      </>
    );
}