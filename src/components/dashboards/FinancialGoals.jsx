import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  CircularProgress,
  Button,
  Container,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DashboardAPIs } from "../../const/APIs";
import { DashboardNavbar } from "../navbar/DashboardNavbar";
import { LinearProgress, Typography } from "@mui/material";

export default function FinancialGoals() {
  const { dashboardId } = useParams();
  const [financialGoals, setFinancialGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  });

  const [formErrors, setFormErrors] = useState({
    targetAmount: false,
    currentAmount: false,
  });

  const [newFinancialGoal, setNewFinancialGoal] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  });

  const jwtToken = sessionStorage.getItem("budgetPlanner-login")
    ? JSON.parse(sessionStorage.getItem("budgetPlanner-login")).jwt
    : null;

  const fetchFinancialGoals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        DashboardAPIs.getDashboardFinancialGoalByDashboardId(dashboardId),
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
          "Content-Type": "application/json",
        }
      );
      setFinancialGoals(response.data);
    } catch (error) {
      console.error("Error fetching financial goals in Budget page", error);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardId, jwtToken]);

  useEffect(() => {
    fetchFinancialGoals();
  }, [fetchFinancialGoals]);

  const handleAddFinancialGoal = async () => {
    if (!jwtToken) {
      console.error("Authentication error: No JWT Token found.");
      return;
    }
    if (
      !newFinancialGoal.title ||
      !newFinancialGoal.targetAmount ||
      !newFinancialGoal.currentAmount ||
      !newFinancialGoal.deadline
    ) {
      alert("All fields are required.");
      return;
    }
    if (Object.values(formErrors).some((err) => err)) {
      alert("Please fix the errors before submitting.");
      return;
    }

    try {
      await axios.post(
        DashboardAPIs.getDashboardFinancialGoalByDashboardId(dashboardId),
        newFinancialGoal,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      fetchFinancialGoals();
      setNewFinancialGoal({
        title: "",
        targetAmount: "",
        currentAmount: "",
        deadline: "",
      });
    } catch (error) {
      console.error("Error adding the financial category", error);
    }
  };

  const handleEditClick = (goal) => {
    setEditingId(goal.id);
    setEditFormData({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline, // Assuming deadline is in ISO format
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (editingId) {
      // Updating existing goal
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      // Adding new goal
      setNewFinancialGoal((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Check and handle validation for number inputs
      if (name === "targetAmount" || name === "currentAmount") {
        let errors = { ...formErrors };
        errors[name] = isNaN(value) || parseFloat(value) <= 0;
        setFormErrors(errors);
      }
    }
  };

  const handleSave = async () => {
    if (!jwtToken) {
      console.error("Authentication error: No JWT Token found.");
      return;
    }

    try {
      await axios.put(
        DashboardAPIs.getDashboardFinancialGoalIdByDashboardId(
          dashboardId,
          editingId
        ),
        editFormData,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      setEditingId(null); // Clear editing mode
      window.location.reload(); // Reload to fetch updated data
    } catch (error) {
      console.error("Error updating the financial goal", error);
    }
  };

  const calculateProgress = (currentAmount, targetAmount) => {
    return (currentAmount / targetAmount) * 100; // Calculate percentage
  };

  const handleDeleteFinancialGoal = async (goalId) => {
    if (!jwtToken) {
      console.error("Authentication error: No JWT Token found.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this financial goal?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(
          DashboardAPIs.getDashboardFinancialGoalIdByDashboardId(
            dashboardId,
            goalId
          ),
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );
        const updatedGoals = financialGoals.filter(
          (goal) => goal.id !== goalId
        );
        setFinancialGoals(updatedGoals); // Update the state to reflect the deletion
        console.log("Financial goal deleted successfully.");
      } catch (error) {
        console.error("Error deleting the financial goal", error);
      }
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
              {financialGoals.map((goal) => (
                <ListItem
                  key={goal.id}
                  onDoubleClick={() => handleEditClick(goal)}
                >
                  {editingId === goal.id ? (
                    <div>
                      <TextField
                        label="Title"
                        name="title"
                        value={editFormData.title}
                        onChange={(e) => handleInputChange(e, "title")}
                      />
                      <TextField
                        label="Target Amount"
                        name="targetAmount"
                        value={editFormData.targetAmount}
                        onChange={(e) => handleInputChange(e, "targetAmount")}
                      />
                      <TextField
                        label="Current Amount"
                        name="currentAmount"
                        value={editFormData.currentAmount}
                        onChange={(e) => handleInputChange(e, "currentAmount")}
                      />
                      <TextField
                        label="Deadline"
                        name="deadline"
                        type="date"
                        value={editFormData.deadline}
                        onChange={(e) => handleInputChange(e, "deadline")}
                        InputLabelProps={{ shrink: true }}
                      />
                      <Button onClick={handleSave} color="primary">
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditingId(null)}
                        color="secondary"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <ListItemText
                        primary={goal.title}
                        secondary={`Target: $${goal.targetAmount}, Current: $${
                          goal.currentAmount
                        }, Deadline: ${new Date(
                          goal.deadline
                        ).toLocaleDateString()}`}
                      />
                      <div style={{ width: "100%" }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(
                            calculateProgress(
                              goal.currentAmount,
                              goal.targetAmount
                            ),
                            100
                          )}
                          style={{
                            flex: 1,
                            height: 20,
                            backgroundColor: "lightgray",
                            color:
                              goal.currentAmount >= goal.targetAmount
                                ? "#4caf50"
                                : "#4caf50",
                          }}
                        />
                        <Typography component={'div'} variant="body2" color="textSecondary">
                          {`${Math.min(
                            calculateProgress(
                              goal.currentAmount,
                              goal.targetAmount
                            ),
                            100
                          ).toFixed(0)}%`}
                        </Typography>
                        {goal.currentAmount >= goal.targetAmount && (
                          <Typography component={'div'}
                            style={{ color: "green", marginTop: "10px" }}
                          >
                            Congratulations, you reached your financial goal!
                          </Typography>
                        )}
                      </div>
                    </>
                  )}
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => {
                        handleDeleteFinancialGoal(goal.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "20px",
            gap: "10px",
          }}
        >
          <TextField
            label="Title"
            name="title"
            value={newFinancialGoal.title}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            style={{ flex: 1 }}
          />
          <TextField
            label="Target Amount"
            name="targetAmount"
            value={newFinancialGoal.targetAmount}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            style={{ flex: 1 }}
          />
          <TextField
            label="Current Amount"
            name="currentAmount"
            value={newFinancialGoal.currentAmount}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            style={{ flex: 1 }}
          />
          <TextField
            label="Deadline"
            name="deadline"
            type="date"
            value={newFinancialGoal.deadline}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            style={{ flex: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddFinancialGoal}
            style={{ height: "56px" }}
          >
            Create
          </Button>
        </div>
      </Container>
    </>
  );
}
