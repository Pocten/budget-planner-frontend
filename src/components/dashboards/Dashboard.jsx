import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Outlet } from 'react-router-dom';
import { DashboardNavbar } from '../navbar/DashboardNavbar';
import {DashboardAPIs} from "../../const/APIs";
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



export default function Dashboard() {
    const { dashboardId } = useParams();
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(
      localStorage.getItem('selectedMonth') || ''
    );
    const [selectedCategory, setSelectedCategory] = useState(
      localStorage.getItem('selectedCategory') || ''
    );


    const rows = [
      {
        id: 1,
        date: '2024-03-29',
        title: 'Grocery Shopping',
        amount: 150.00,
        description: 'Weekly groceries',
        category: 'Food',
        tag: 'Essentials'
      },
      // Add more rows as needed
    ];
    const handleMonthChange = (event) => {
      const newMonth = event.target.value;
      setSelectedMonth(newMonth);
      localStorage.setItem('selectedMonth', newMonth);
  };
  
  const handleCategoryChange = (event) => {
      const newCategory = event.target.value;
      setSelectedCategory(newCategory);
      localStorage.setItem('selectedCategory', newCategory);
  };

const filteredRows = rows.filter(row => {
  const dateMatch = selectedMonth
    ? new Date(row.date).getMonth() === selectedMonth - 1
    : true;
  const categoryMatch = selectedCategory ? row.category === selectedCategory : true;
  return dateMatch && categoryMatch;
});

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
        <FormControl
          style={{ marginTop: "150px", marginLeft: "20px", minWidth: 120 }}
        >
          <InputLabel id="month-select-label">Month</InputLabel>
          <Select
            labelId="month-select-label"
            id="month-select"
            value={selectedMonth}
            label="Month"
            onChange={handleMonthChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value={1}>January</MenuItem>
            <MenuItem value={2}>February</MenuItem>
            <MenuItem value={3}>March</MenuItem>
            <MenuItem value={4}>April</MenuItem>
            <MenuItem value={5}>May</MenuItem>
            <MenuItem value={6}>June</MenuItem>
            <MenuItem value={7}>July</MenuItem>
            <MenuItem value={8}>August</MenuItem>
            <MenuItem value={9}>September</MenuItem>
            <MenuItem value={10}>October</MenuItem>
            <MenuItem value={11}>November</MenuItem>
            <MenuItem value={12}>December</MenuItem>
          </Select>
        </FormControl>
        <FormControl
          style={{ marginTop: "150px", marginLeft: "20px", minWidth: 120 }}
        >
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={selectedCategory}
            label="Category"
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
        <Paper style={{ width: "100%", overflow: "hidden", marginTop: "20px" }}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Tag</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>${row.amount.toFixed(2)}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.tag}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <Outlet /> {/* This will render the matched nested route */}
      </>
    );
    };
    
