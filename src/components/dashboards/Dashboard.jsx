import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Outlet } from 'react-router-dom';
import { DashboardNavbar } from '../navbar/DashboardNavbar';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import {DashboardAPIs} from "../../const/APIs";
import {
  CircularProgress,
  Container,
  TextField,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';


export default function Dashboard() {
  const navigate = useNavigate();
  const { dashboardId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [financialRecords, setFinancialRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    amount: "",
    date: "",
    category: "",
    type: "",
    description: "",
  });
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [formErrors] = useState({
    amount: false,
    type: false,
  });
  
  
  const jwtToken = sessionStorage.getItem("budgetPlanner-login")
    ? JSON.parse(sessionStorage.getItem("budgetPlanner-login")).jwt
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
  
    const fetchCategories = useCallback(async () => {
      try {
        const response = await axios.get(
          DashboardAPIs.getDashboardCategoriesByDashboardId(dashboardId),
          { headers: { Authorization: `Bearer ${jwtToken}` } }
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories on Dashboard page", error);
      }
    }, [dashboardId, jwtToken]);

useEffect(() => {
  if (!dashboardId || !jwtToken) {
    navigate("/login");
    return;
  }
  fetchFinancialRecords();
  fetchCategories();

  
}, [dashboardId, jwtToken, navigate, fetchFinancialRecords, fetchCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
  };

  

  const filteredRecords = financialRecords.filter((record) => {
    const dateMatch = selectedMonth
      ? new Date(record.date).getMonth() === parseInt(selectedMonth, 10) - 1
      : true;
  
    const categoryMatch = selectedCategory
      ? record.category?.id === selectedCategory
      : true;
  
    return dateMatch && categoryMatch;
  });
  

  
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
      console.log("Deleting record :" + recordId)
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
  if ( amountValue <= 0) {
    console.error("Invalid amount: Amount must be greater than 0.");
    return; 
  }
    if (!jwtToken) {
      console.error("Authentication error: No JWT Token found.");
      return;
    }
  
    const categoryObject = categories.find(cat => cat.id === editFormData.categoryId);
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

  const handleSubmit = async (id) => {
    id.preventDefault();
    if (!jwtToken) {
      console.error("Authentication error: No JWT Token found.");
      return;
    }
  
    const isCreating = !id;
    const data = isCreating ? newRecord : editFormData;
  
    try {
      console.log("Try create record" + data); // Just before making the axios request
      const dataToSubmit = {
        amount: newRecord.amount,
        description: newRecord.description,
        category: newRecord.categoryId ? { id: newRecord.categoryId } : undefined,
        type: newRecord.type, // This line was missing

      };

      console.log("Category id when creating record is " + newRecord.categoryId)
    
      const response = await axios.post(
        DashboardAPIs.getUserFinancialRecordsByDashboardId(dashboardId),
        dataToSubmit,
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      window.location.reload();

      const savedRecord = response.data;


      if (isCreating) {
        setFinancialRecords((prevRecords) => [...prevRecords, savedRecord]);
        setNewRecord({ amount: "", date: "", category: "", type: "", description: "" }); 
      } else {
        fetchFinancialRecords();
        setFinancialRecords((prevRecords) => prevRecords.map((record) => (record.id === id ? savedRecord : record)));
        setEditFormData({}); 
        setEditingId(null);
      }
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
        <FormControl style={{ marginRight: "20px", width: "90px" }}>
          <InputLabel id="month-select-label">Month</InputLabel>
          <Select
            labelId="month-select-label"
            id="month-select"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {[...Array(12).keys()].map((month) => (
              <MenuItem key={month + 1} value={month + 1}>
                {new Date(0, month).toLocaleString("en", { month: "long" })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ width: "110px" }}>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-filter-label"
            id="category-filter"
            value={selectedCategory}
            onChange={handleCategoryChange}
            displayEmpty
          >
            <MenuItem value="">
            <em>All</em>
          </MenuItem>
     
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      </div>
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
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Tag</TableCell>
                <TableCell>Delete</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow
                  key={record.id}
                  onDoubleClick={() => handleEditClick(record)}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                    "&:hover": { backgroundColor: "#f0f0f0" },
                  }}
                >
                  <TableCell>
                    {editingId === record.id ? (
                      <TextField
                        name="date"
                        value={editFormData.date}
                        onChange={handleEditInputChange}
                        onKeyPress={handleKeyPress}
                        onBlur={handleBlur}
                      />
                    ) : (
                      new Date(record.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    )}
                  </TableCell>

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
                        }}
                        error={parseFloat(editFormData.amount) <= 0} // Correctly parse the amount as a float before comparing
                        helperText={
                          parseFloat(editFormData.amount) <= 0
                            ? "Only numbers over 0 are possible"
                            : ""
                        }
                      />
                    ) : (
                      // Display mode: Show amount with color and symbol based on type
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
                        >
                          <MenuItem value="INCOME">INCOME</MenuItem>
                          <MenuItem value="EXPENSE">EXPENSE</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      // Just display the type as text when not editing
                      record.type
                    )}
                  </TableCell>

                  <TableCell>
                    {editingId === record.id ? (
                      <TextField
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditInputChange}
                        onKeyPress={handleKeyPress}
                        onBlur={handleBlur}
                      />
                    ) : (
                      record.description
                    )}
                  </TableCell>

                  <TableCell>
                    {editingId === record.id ? (
                      <FormControl size="small" fullWidth>
                        <Select
                          name="categoryId"
                          value={editFormData.categoryId} // this should reflect the edit form's state
                          onChange={handleEditInputChange}
                          onBlur={handleBlur}
                          displayEmpty
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

                  <TableCell></TableCell>
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
          alignItems: "flex-end",
          margin: "20px",
        }}
      >

        <TextField
          name="amount"
          label="Amount"
          type="number"
          value={newRecord.amount}
          onChange={handleInputChange}
          inputProps={{ min: "0.01", step: "0.01" }} // This prevents negative numbers and allows only positive values greater than 0
          style={{ width: "15%", marginRight: "10px", height: "20px" }}
          error={parseFloat(newRecord.amount) <= 0}
          helperText={
            parseFloat(newRecord.amount) <= 0
              ? "Only numbers over 0 are possible"
              : ""
          }
          InputProps={{}}
          required
        />

        <TextField
          name="date"
          type="date"
          value={newRecord.date}
          onChange={handleInputChange}
          style={{ width: "15%", marginRight: "10px", height: "20px" }} // You can adjust the width as needed
        />

        <FormControl  style={{ width: "15%", marginRight: "10px", height: "20px" }} fullWidth>
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
        error={formErrors.type} required fullWidth
          style={{ width: "15%", marginRight: "10px", height: "20px" }}
        >
          <InputLabel>Type</InputLabel>
          <Select
            name="type"
            value={newRecord.type}
            label="Type"
            onChange={handleInputChange}
            required
  error={formErrors.type}
  helperText={formErrors.type ? "Type is required" : ""}
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
          style={{ width: "20%", height: "20px" }} // Adjust the width as needed
        />
        <Button
          type="submit"
          variant="contained"
          style={{ width: "15%", marginRight: "10px", height: "50px" }}
        >
          Submit
        </Button>
      </form>
      <Outlet />
    </>
  );
}
