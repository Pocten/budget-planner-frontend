import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Outlet } from "react-router-dom";
import { DashboardNavbar } from "../navbar/DashboardNavbar";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import { DashboardAPIs } from "../../const/APIs";
import { CircularProgress, Container, Typography, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Dashboard() {
  const navigate = useNavigate();
  const { dashboardId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [financialRecords, setFinancialRecords] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [budgets, setBudgets] = useState([]);

  const [newRecord, setNewRecord] = useState({
    amount: "",
    date: "",
    category: "",
    type: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [userMap, setUserMap] = useState({});

  const [formErrors] = useState({
    amount: false,
    type: false,
  });

  const jwtToken = sessionStorage.getItem("budgetPlanner-login")
    ? JSON.parse(sessionStorage.getItem("budgetPlanner-login")).jwt
    : null;

  const userId = sessionStorage.getItem("budgetPlanner-login")
    ? JSON.parse(window.atob(jwtToken.split(".")[1])).userId
    : null;

  const fetchFinancialRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        DashboardAPIs.getUserFinancialRecordsByDashboardId(dashboardId),
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      setFinancialRecords(response.data);
    } catch (error) {
      console.error("Error fetching financial records", error);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardId, jwtToken]);
  useEffect(() => {
    fetchFinancialRecords();
  }, [fetchFinancialRecords, userMap]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        DashboardAPIs.getDashboardCategoriesByDashboardId(dashboardId),
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      console.log("Categories fetched:", response.data); // Log the response data
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories on Dashboard page", error);
    }
  }, [dashboardId, jwtToken]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(
        DashboardAPIs.getDashboardMembersByDashboardId(userId, dashboardId),
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      const users = response.data;
      const userMap = users.reduce((map, user) => {
        map[user.userId] = user.userName;
        return map;
      }, {});
      setUserMap(userMap);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [jwtToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchBudgets = useCallback(async () => {
    if (!jwtToken) {
      navigate("/login");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(
        DashboardAPIs.getDashboardBudgetsByDashboardId(dashboardId),
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      console.log("Budgets fetched:", response.data); // Log to check the structure
      setBudgets(response.data); // Ensure this is an array
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardId, jwtToken, navigate]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const calculateRemainingBudget = (budget) => {
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);
    let totalExpenses = 0;
    let totalIncome = 0;

    financialRecords.forEach((record) => {
      const recordDate = new Date(record.date);
      if (recordDate >= startDate && recordDate <= endDate) {
        if (record.type === "EXPENSE") {
          totalExpenses += parseFloat(record.amount);
        } else if (record.type === "INCOME") {
          totalIncome += parseFloat(record.amount);
        }
      }
    });

    return budget.totalAmount - totalExpenses + totalIncome;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <Container
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "150px",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  const handleDeleteRecord = async (recordId) => {
    if (!jwtToken) {
      console.error("Authentication error: No JWT Token found.");
      return;
    }

    try {
      await axios.delete(
        DashboardAPIs.getFinancialRecordById(dashboardId, recordId),
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );

      setFinancialRecords((prevRecords) =>
        prevRecords.filter((record) => record.id !== recordId)
      );
      console.log("Deleting record :" + recordId);
    } catch (error) {
      console.error("Error deleting financial record", error);
    }
  };

  const handleEditClick = (record) => {
    setEditingId(record.id);
    setEditFormData({
      amount: record.amount,
      description: record.description,
      date: record.date,
      type: record.type,
      categoryId: record.category ? record.category.id : "", // set categoryId from record's category object if exists
    });
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    console.log(`Before update: ${name} = ${value}`); // Add this line for debugging

    setEditFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };
      console.log(`After update: ${name} = ${updatedFormData[name]}`); // Add this line for debugging
      return updatedFormData;
    });
  };

  const handleSave = async (id) => {
    // Validate the amount before submitting
    const amountValue = parseFloat(newRecord.amount);
    if (amountValue <= 0) {
      console.error("Invalid amount: Amount must be greater than 0.");
      return;
    }
    if (!jwtToken) {
      console.error("Authentication error: No JWT Token found.");
      return;
    }

    const categoryObject = categories.find(
      (cat) => cat.id === editFormData.categoryId
    );

    const dataToSubmit = {
      ...editFormData,
      category: categoryObject ? { id: categoryObject.id } : null,
    };

    try {
      const response = await axios.put(
        DashboardAPIs.getFinancialRecordById(dashboardId, id),
        dataToSubmit,
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );

      const updatedRecord = response.data;

      setFinancialRecords((prevRecords) =>
        prevRecords.map((record) => (record.id === id ? updatedRecord : record))
      );

      setEditingId(null);
      setEditFormData({});
    } catch (error) {
      console.error("Error updating financial record", error);
    }
  };

  const handleBlur = () => {
    handleSave(editingId);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSave(editingId);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!jwtToken) {
      console.error("Authentication error: No JWT Token found.");
      return;
    }

    let formattedDate = new Date(newRecord.date).toISOString(); // Ensures the date includes time

    const dataToSubmit = {
      amount: newRecord.amount,
      description: newRecord.description,
      category: newRecord.categoryId ? { id: newRecord.categoryId } : undefined,
      type: newRecord.type,
      date: formattedDate, // Use the formatted date
    };

    console.log("Submitting record with date:", dataToSubmit); // Log the date being submitted

    try {
      const response = await axios.post(
        DashboardAPIs.getUserFinancialRecordsByDashboardId(dashboardId),
        dataToSubmit,
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      setFinancialRecords((prevRecords) => [...prevRecords, response.data]);
      setNewRecord({
        amount: "",
        date: "",
        category: "",
        type: "",
        description: "",
      });
    } catch (error) {
      console.error("Error submitting financial record", error);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "20px",
          marginTop: "150px",
        }}
      >
      </div>
      <Container>
        {Array.isArray(budgets) &&
          budgets.map((budget) => {
            const remainingBudget = calculateRemainingBudget(budget);
            const budgetStatusColor = remainingBudget >= 0 ? "green" : "red";
            return (
              <Typography component={'div'}
                key={budget.id}
                style={{
                  marginBottom: "10px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: budgetStatusColor,
                }}
              >
                Your budget from:
                {new Date(budget.startDate).toLocaleDateString()} till
                {new Date(budget.endDate).toLocaleDateString()} is $
                {budget.totalAmount}. You have ${remainingBudget.toFixed(2)}
                left.
              </Typography>
            );
          })}
      </Container>

      {/* FINANCIAL RECORDS TABLE INFO ON TOP */}
      <Paper style={{ width: "100%", overflow: "hidden" }}>
        <TableContainer
          component={Paper}
          style={{
            maxHeight: "50vh",
            overflow: "auto",
            marginTop: "1rem",
            boxShadow: "0 10px 9px rgba(0,0,0,0.1)",
          }}
        >
          <Table
            aria-label="simple table"
            sx={{ ".MuiTableCell-root": { padding: "10px" } }}
          >
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#212520",
                  color: "white",
                  "& .MuiTableCell-head": {
                    color: "white",
                  },
                }}
              >
                <TableCell
                  style={{
                    width: "100px",
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  style={{
                    width: "60px",
                  }}
                >
                  Amount
                </TableCell>
                <TableCell
                  style={{
                    width: "60px",
                  }}
                >
                  Type
                </TableCell>
                <TableCell
                  style={{
                    width: "100px",
                  }}
                >
                  Description
                </TableCell>
                <TableCell
                  style={{
                    width: "80px",
                  }}
                >
                  Category
                </TableCell>
                <TableCell style={{ width: "100px" }}>Created By</TableCell>
                <TableCell
                  style={{
                    width: "20px",
                  }}
                >
                  Delete
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {financialRecords.map((record) => (
                <TableRow
                  key={record.id}
                  onDoubleClick={() => handleEditClick(record)}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                    "&:hover": { backgroundColor: "#f0f0f0" },
                  }}
                >
                  {/* DATE CELL INFO IN TABLE */}
                  <TableCell>
                    {editingId === record.id ? (
                      <TextField
                        type="date"
                        name="date"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        value={editFormData.date.slice(0, 10)} // assuming editFormData.date is a full ISO string
                        onChange={handleEditInputChange}
                        onKeyPress={handleKeyPress}
                        onBlur={handleBlur}
                        style={{ width: "100px" }}
                      />
                    ) : (
                      new Date(record.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    )}
                  </TableCell>
                  {/* AMOUNT INFO CELL IN TABLE*/}
                  <TableCell>
                    {editingId === record.id ? (
                      <TextField
                        name="amount"
                        type="number"
                        value={editFormData.amount}
                        onChange={handleEditInputChange}
                        onKeyPress={handleKeyPress}
                        onBlur={handleBlur}
                        inputProps={{ min: "0.01", step: "0.01" }} // Enforces minimum value and step
                        style={{
                          color:
                            editFormData.type === "INCOME" ? "green" : "red",
                          width: "90px",
                        }}
                        error={parseFloat(editFormData.amount) <= 0}
                        helperText={
                          parseFloat(editFormData.amount) <= 0
                            ? "Only numbers over 0 are possible"
                            : ""
                        }
                      />
                    ) : (
                      <span
                        style={{
                          color: record.type === "INCOME" ? "green" : "red",
                        }}
                      >
                        {record.type === "INCOME" ? "+" : "-"}$
                        {parseFloat(record.amount).toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                  {/* TYPE INFO CELL IN TABLE*/}
                  <TableCell>
                    {editingId === record.id ? (
                      // If in edit mode, show a dropdown to select type
                      <FormControl size="small" fullWidth>
                        <Select
                          name="type"
                          value={editFormData.type}
                          onChange={handleEditInputChange}
                          onBlur={handleBlur}
                          displayEmpty
                          style={{
                            width: "60px",
                          }}
                        >
                          <MenuItem value="INCOME">INCOME</MenuItem>
                          <MenuItem value="EXPENSE">EXPENSE</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      record.type
                    )}
                  </TableCell>
                  {/* DESCRIPTION INFO CELL IN TABLE*/}
                  <TableCell>
                    {editingId === record.id ? (
                      <TextField
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditInputChange}
                        onKeyPress={handleKeyPress}
                        onBlur={handleBlur}
                        style={{
                          width: "100px",
                        }}
                      />
                    ) : (
                      record.description
                    )}
                  </TableCell>
                  {/* CATEGORY INFO CELL IN TABLE*/}
                  <TableCell>
                    {editingId === record.id ? (
                      <FormControl size="small" fullWidth>
                        <Select
                          name="categoryId"
                          value={editFormData.categoryId}
                          onChange={handleEditInputChange}
                          onBlur={handleBlur}
                          displayEmpty
                          style={{
                            width: "100px",
                          }}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : // When not editing, display the category name
                    record.category ? (
                      record.category.name
                    ) : (
                      "None"
                    )}
                  </TableCell>
                  <TableCell> {userMap[record.userId]}</TableCell>{" "}
                  <TableCell style={{ align: "right" }}>
                    <DeleteIcon
                      onClick={() => handleDeleteRecord(record.id)}
                      style={{ cursor: "pointer" }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          margin: "30px",
        }}
      >
        <TextField
          name="amount"
          label="Amount"
          type="number"
          value={newRecord.amount}
          onChange={handleInputChange}
          inputProps={{ min: "0.01", step: "0.01" }}
          style={{ width: "15%", marginRight: "10px" }}
          error={parseFloat(newRecord.amount) <= 0}
          helperText={
            parseFloat(newRecord.amount) <= 0
              ? "Only numbers over 0 are possible"
              : ""
          }
          required
        />

        <TextField
          name="date"
          type="date"
          value={newRecord.date}
          onChange={handleInputChange}
          style={{ width: "15%", marginRight: "10px" }}
        />
        <FormControl style={{ width: "15%", marginRight: "10px" }} fullWidth>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            name="categoryId"
            value={newRecord.categoryId}
            onChange={handleInputChange}
            label="Category"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          error={formErrors.type}
          required
          fullWidth
          style={{ width: "15%", marginRight: "10px" }}
        >
          <InputLabel>Type</InputLabel>
          <Select
            name="type"
            value={newRecord.type}
            label="Type"
            onChange={handleInputChange}
            required
          >
            <MenuItem value="INCOME">INCOME</MenuItem>
            <MenuItem value="EXPENSE">EXPENSE</MenuItem>
          </Select>
        </FormControl>
        <TextField
          name="description"
          label="Description"
          value={newRecord.description}
          onChange={handleInputChange}
          rows={4}
          style={{ width: "20%", marginRight: "10px" }}
        />
        <Button
          type="submit"
          variant="contained"
          style={{ width: "15%", height: "56px" }}
        >
          Create
        </Button>
      </form>
      <Outlet />
    </>
  );
}