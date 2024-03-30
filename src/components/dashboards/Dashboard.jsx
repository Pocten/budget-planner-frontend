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
  Typography,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button
} from '@mui/material';

export default function Dashboard() {
    const navigate = useNavigate();
    const { dashboardId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [financialRecords, setFinancialRecords] = useState([]);
    const [openCreateForm, setOpenCreateForm] = useState(false);
    const [newRecord, setNewRecord] = useState({
        amount: '',
        categoryId: '',
        type: '',
        description: ''
    });
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');



    //define jwt token
    const jwtToken = sessionStorage.getItem('budgetPlanner-login') ? JSON.parse(sessionStorage.getItem('budgetPlanner-login')).jwt : null;

    //
    useEffect(() => {
        if (!dashboardId || !jwtToken) {
            navigate('/login');
            return;
        }
        const fetchFinancialRecords = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(DashboardAPIs.getUserFinancialRecordsByDashboardId(dashboardId), {
                    headers: { Authorization: `Bearer ${jwtToken}` }
                });
                setFinancialRecords(response.data);
            } catch (error) {
                console.error('Error fetching financial records', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFinancialRecords();
    }, [dashboardId, jwtToken, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRecord(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleMonthChange = (event) => {
      setSelectedMonth(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
};

const filteredRecords = financialRecords.filter(record => {
  const dateMatch = selectedMonth ? new Date(record.date).getMonth() === parseInt(selectedMonth, 10) - 1 : true;
  const categoryMatch = selectedCategory ? record.category === selectedCategory : true;
  return dateMatch && categoryMatch;
});


    const handleCreateFormOpen = () => {
        setOpenCreateForm(true);
    };

    const handleCreateFormClose = () => {
        setOpenCreateForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!jwtToken) {
            console.error("Authentication error: No JWT Token found.");
            return;
        }

        try {
          const response = await axios.post(DashboardAPIs.getUserFinancialRecordsByDashboardId(dashboardId), newRecord, {
            headers: { Authorization: `Bearer ${jwtToken}` }
            });
            const createdRecord = response.data;

            setFinancialRecords(prevRecords => [...prevRecords, createdRecord]);
            handleCreateFormClose();
            setNewRecord({ amount: '', categoryId: '', type: '', description: '' });
        } catch (error) {
            console.error('Error creating financial record', error);
        }
    };

    if (isLoading) {
        return (
            <Container style={{ display: 'flex', justifyContent: 'center', marginTop: '150px' }}>
                <CircularProgress />
            </Container>
        );
    }

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
          <FormControl style={{ marginRight: "20px" }}>
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
          <FormControl>
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
        <TableContainer component={Paper} style={{ maxHeight: '50vh', overflow: 'auto' }}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Tag</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>${record.amount.toFixed(2)}</TableCell>
                    <TableCell>{record.description}</TableCell>
                    <TableCell>{record.categoryId}</TableCell>
                    <TableCell>{record.tag}</TableCell>
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
            style={{ width: "15%", marginRight: "10px" , height:"20px"}} // You can adjust the width as needed
          />
          <TextField
            name="categoryId"
            label="Category"
            value={newRecord.categoryId}
            onChange={handleInputChange}
            style={{ width: "15%", marginRight: "10px", height:"20px"}} // Adjust the width as needed
          />
          <FormControl style={{ width: "15%", marginRight: "10px" , height:"20px" }}>
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
            style={{ width: "20%" , height:"20px"}} // Adjust the width as needed
          />
          <Button type="submit" variant="contained" style={{ width: "10%" , height:"60px", marginTop: "10px"}}>
            Submit
          </Button>
        </form>
        <Outlet /> 
      </>
    );
}
