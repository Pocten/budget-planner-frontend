import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { CircularProgress, Container, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Select, MenuItem, FormControl, InputLabel, Typography, TextField, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DashboardAPIs } from "../../const/APIs";
import { DashboardNavbar } from '../navbar/DashboardNavbar';

export default function Categories() {
    const { dashboardId } = useParams();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [ratings, setRatings] = useState({});  // Tracks individual and total ratings

    const jwtToken = sessionStorage.getItem('budgetPlanner-login') ? JSON.parse(sessionStorage.getItem('budgetPlanner-login')).jwt : null;

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(DashboardAPIs.getDashboardCategoriesByDashboardId(dashboardId), {
                headers: { Authorization: `Bearer ${jwtToken}` },
            });
            const fetchedCategories = response.data;
            const updatedRatings = {};
            fetchedCategories.forEach(cat => {
                updatedRatings[cat.id] = { myRating: 0, totalRating: 0 };  // Initialize ratings
            });
            setCategories(fetchedCategories);
            setRatings(updatedRatings);
        } catch (error) {
            console.error('Error fetching categories', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRateCategory = async (categoryId, priorityValue) => {
        const url = `${DashboardAPIs.getDashboardCategoryByCategoryId(dashboardId, categoryId)}/priorities?priority=${priorityValue}`;
      
        console.log("Sending rating update to URL:", url);
      
        try {
          const response = await axios.post(url, {}, {
            headers: {
              Authorization: `Bearer ${jwtToken}`
            }
          });
          console.log("Rating updated successfully:", response.data);
          setRatings(prev => ({
            ...prev,
            [categoryId]: {
                ...prev[categoryId],
                myRating: priorityValue  // Update my rating
            }
        }));
        fetchCategoryTotalRating(categoryId);  
          // Refresh category ratings or handle UI update here
        } catch (error) {
          console.error('Error rating category:', error.response ? error.response.data : error.message);
        }
      };
      
      
      const fetchCategoryTotalRating = async (categoryId) => {
        const url = `${DashboardAPIs.getDashboardCategoryByCategoryId(dashboardId, categoryId)}/priorities/calculate`;
        try  {
            const response = await axios.get(url, {}, {
              headers: {
                Authorization: `Bearer ${jwtToken}`
              },
            });
            setRatings(prev => ({
                ...prev,
                [categoryId]: {
                    ...prev[categoryId],
                    totalRating: response.data.totalRating  
                }
            }));
        } catch (error) {
            console.error('Error fetching total rating', error);
        }
    };


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewCategory(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCategory = async () => {
        if (!jwtToken) {
            console.error("Authentication error: No JWT Token found.");
            return;
        }

        try {
            await axios.post(DashboardAPIs.getDashboardCategoriesByDashboardId(dashboardId), newCategory, {
                headers: { Authorization: `Bearer ${jwtToken}` },
            });
            fetchCategories(); 
            setNewCategory({ name: '', description: '' }); 
        } catch (error) {
            console.error('Error adding the category', error);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!jwtToken) {
            console.error("Authentication error: No JWT Token found.");
            return;
        }
        const confirmDelete = window.confirm("Are you sure you want to delete this category?");
        if (confirmDelete) {
            try {
                await axios.delete(DashboardAPIs.getDashboardCategoryByCategoryId(dashboardId, categoryId), {
                    headers: { Authorization: `Bearer ${jwtToken}` },
                });
                setCategories(prev => prev.filter(category => category.id !== categoryId));
            } catch (error) {
                console.error("Error deleting the category", error);
            }
        }
    };

    return (
        <>
            <DashboardNavbar />
            <Container>
                {isLoading ? <CircularProgress /> : (
                    <div style={{ marginTop: '150px' }}>
                        <List>
                            {categories.map((category) => (
                                <ListItem key={category.id}>
                                    <ListItemText primary={category.name} secondary={category.description} />
                                    <FormControl>
                                        <InputLabel id="rating-label">Rating</InputLabel>
                                        <Select
                                            labelId="rating-label"
                                            value={ratings[category.id]?.myRating || ''}
                                            onChange={(e) => handleRateCategory(category.id, e.target.value)}
                                            style={{ width: 140 }}
                                        >
                                            {[...Array(10).keys()].map(num => (
                                                <MenuItem key={num + 1} value={num + 1}>{num + 1}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Typography style={{ margin: '0 10px' }}>
                                        Total Rating: {ratings[category.id]?.totalRating || 0}
                                    </Typography>
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteCategory(category.id)}>
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
                        label="Name"
                        name="name"
                        value={newCategory.name}
                        onChange={handleInputChange}
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={newCategory.description}
                        onChange={handleInputChange}
                        margin="normal"
                        variant="outlined"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddCategory}
                        style={{ marginLeft: '10px' }}
                    >
                        Add New Category
                    </Button>
                </div>
            </Container>
        </>
    );
}
