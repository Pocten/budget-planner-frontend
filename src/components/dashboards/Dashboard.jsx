import React, { useState, useEffect } from 'react';
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
    categoryId: "",
    type: "",
    description: "",
  });
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [openCreateForm, setOpenCreateForm] = useState(false);
  const [categories, setCategories] = useState([]);

  //define jwt token
  const jwtToken = sessionStorage.getItem("budgetPlanner-login")
    ? JSON.parse(sessionStorage.getItem("budgetPlanner-login")).jwt
    : null;

    const fetchFinancialRecords = async () => {
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
    };
  
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          DashboardAPIs.getDashboardCategoriesByDashboardId(dashboardId),
          { headers: { Authorization: `Bearer ${jwtToken}` } }
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories on Dashboard page", error);
      }
    };
  
    useEffect(() => {
      if (!dashboardId || !jwtToken) {
        navigate("/login");
        return;
      }
      fetchFinancialRecords();
      fetchCategories();
    }, [dashboardId, jwtToken, navigate]);

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
    setSelectedCategory(event.target.value);
  };

  const filteredRecords = financialRecords.filter((record) => {
    const dateMatch = selectedMonth
      ? new Date(record.date).getMonth() === parseInt(selectedMonth, 10) - 1
      : true;
    const categoryMatch = selectedCategory
      ? record.category === selectedCategory
      : true;
    return dateMatch && categoryMatch;
  });

  const handleCreateFormClose = () => {
    setOpenCreateForm(false);
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
      categoryId: record.categoryId, // Ensure this is set to the current record's category ID

    });
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (id) => {
    if (!jwtToken) {
      console.error("Authentication error: No JWT Token found.");
      return;
    }

    try {
      const response = await axios.put(
        DashboardAPIs.getFinancialRecordById(dashboardId, id),
        editFormData,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
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
  
    // Determine if creating or updating based on the presence of `id`
    const isCreating = !id;
    const url = isCreating ? DashboardAPIs.getUserFinancialRecordsByDashboardId(dashboardId) : DashboardAPIs.getFinancialRecordById(dashboardId, id);
    const method = isCreating ? 'post' : 'put';
    const data = isCreating ? newRecord : editFormData;
  
    try {
      console.log("Try create record" + data); // Just before making the axios request
      const dataToSubmit = {
        amount: newRecord.amount,
        description: newRecord.description,
        categoryId: newRecord.categoryId // Ensure this is a string. If it's not, convert or validate before setting.
      };
    
      const response = await axios.post(
        DashboardAPIs.getUserFinancialRecordsByDashboardId(dashboardId),
        dataToSubmit,
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );

      const savedRecord = response.data;
      console.log("creating "+ savedRecord)
  
      if (isCreating) {
        // If creating a new record, add it to the state
        setFinancialRecords((prevRecords) => [...prevRecords, savedRecord]);
        setNewRecord({ amount: "", date: "", categoryId: "", type: "", description: "" }); // Reset new record form
      } else {
        fetchFinancialRecords();
        setFinancialRecords((prevRecords) => prevRecords.map((record) => (record.id === id ? savedRecord : record)));
        setEditFormData({}); // Reset edit form
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
            labelId="category-select-label"
            id="category-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="Food">Food</MenuItem>
            <MenuItem value="Living">Living</MenuItem>
            <MenuItem value="Clothes">Clothes</MenuItem>
            <MenuItem value="Drug">Drug</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
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
                     InputProps={{
                       startAdornment: editFormData.type === 'INCOME' ? '+' : '-',
                     }}
                     style={{
                       color: editFormData.type === 'INCOME' ? 'green' : 'red',
                     }}
                   />
                 ) : (
                   // Display mode: Show amount with color and symbol based on type
                   <span style={{ color: record.type === 'INCOME' ? 'green' : 'red' }}>
                     {record.type === 'INCOME' ? '+' : '-'}${parseFloat(record.amount).toFixed(2)}
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
    // If in edit mode, show a dropdown to select the category
    <FormControl size="small" fullWidth>
      <Select
        name="categoryId"
        value={editFormData.categoryId}
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
  ) : (
    // Display the category name for the current record
    categories.find((cat) => cat.id === record.categoryId)?.name || ''
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
          margin: "10px",
        }}
      >
        <TextField
          name="amount"
          label="Amount"
          type="number"
          value={newRecord.amount}
          onChange={handleInputChange}
          style={{ width: "15%", marginRight: "10px", height: "20px" }} // You can adjust the width as needed
        />
        <TextField
          name="date"
          type="date"
          value={newRecord.date}
          onChange={handleInputChange}
          style={{ width: "15%", marginRight: "10px", height: "20px" }} // You can adjust the width as needed
        />

<FormControl fullWidth>
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
    <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
))}

  </Select>
</FormControl>


        <FormControl
          style={{ width: "15%", marginRight: "10px", height: "20px" }}
        >
          <InputLabel>Type</InputLabel>
          <Select
            name="type"
            value={newRecord.type}
            label="Type"
            onChange={handleInputChange}
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
          style={{ width: "10%", height: "60px", marginTop: "10px" }}
        >
          Submit
        </Button>
      </form>
      <Outlet />
    </>
  );
}
