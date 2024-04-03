import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { CircularProgress, Button, Container, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DashboardAPIs } from "../../const/APIs";
import { DashboardNavbar } from '../navbar/DashboardNavbar';


export default function Categories() {
    const { dashboardId } = useParams();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const jwtToken = sessionStorage.getItem('budgetPlanner-login') ? JSON.parse(sessionStorage.getItem('budgetPlanner-login')).jwt : null;



    const fetchCategories = useCallback(async () => {
      setIsLoading(true);
      try {
          const response = await axios.get(DashboardAPIs.getDashboardCategoriesByDashboardId(dashboardId), {
              headers: { Authorization: `Bearer ${jwtToken}` },
          });
          setCategories(response.data);
      } catch (error) {
          console.error('Error fetching categories in Categories page', error);
      } finally {
          setIsLoading(false);
      }
  }, [dashboardId, jwtToken]); // Dependencies for useCallback
  
  useEffect(() => {
    fetchCategories();
}, [fetchCategories]);


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
  
      try {
        await axios.delete(
          DashboardAPIs.getDashboardCategoryByCategoryId(dashboardId, categoryId),
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );
  
        setCategories((prevRecords) =>
          prevRecords.filter((category) => category.id !== categoryId)
        );
      } catch (error) {
        console.error("Error deleting financial record", error);
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
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="delete">
                                  
                                <DeleteIcon
                      onClick={() => handleDeleteCategory(category.id)}
                      style={{ cursor: "pointer" }}
                    />
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
