import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { CircularProgress, Button, Container, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DashboardAPIs } from "../../const/APIs";
import { DashboardNavbar } from '../navbar/DashboardNavbar';


export default function Tags() {
    const { dashboardId } = useParams();
    const [tags, setTags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newTag, setNewTag] = useState({ name: '', description: ''});
    const jwtToken = sessionStorage.getItem('budgetPlanner-login') ? JSON.parse(sessionStorage.getItem('budgetPlanner-login')).jwt : null;



    const fetchTags = useCallback(async () => {
      setIsLoading(true);
      try {
          const response = await axios.get(DashboardAPIs.getDashboardTagsByDashboardId(dashboardId), {
              headers: { Authorization: `Bearer ${jwtToken}` },
          });
          setTags(response.data);
      } catch (error) {
          console.error('Error fetching tags in Tags page', error);
      } finally {
          setIsLoading(false);
      }
  }, [dashboardId, jwtToken]); // Dependencies for useCallback
  
  useEffect(() => {
    fetchTags();
}, [fetchTags]);


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewTag(prev => ({ ...prev, [name]: value }));
    };

    const handleAddTag = async () => {
        if (!jwtToken) {
            console.error("Authentication error: No JWT Token found.");
            return;
        }

        try {
            await axios.post(DashboardAPIs.getDashboardTagsByDashboardId(dashboardId), newTag, {
                headers: { Authorization: `Bearer ${jwtToken}` },
            });
            fetchTags(); 
            setNewTag({ name: '', description: '' }); 
        } catch (error) {
            console.error('Error adding the tag', error);
        }
    };


    const handleDeleteTag = async (tagId) => {
      if (!jwtToken) {
        console.error("Authentication error: No JWT Token found.");
        return;
      }
  
      try {
        await axios.delete(
          DashboardAPIs.getDashboardTagByTagId(dashboardId, tagId),
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );
  
        setTags((prevRecords) =>
          prevRecords.filter((tag) => tag.id !== tagId)
        );
      } catch (error) {
        console.error("Error deleting tag record", error);
      }
    };

    return (
      <>

      <DashboardNavbar />

        <Container>
            {isLoading ? <CircularProgress /> : (
                          <div style={{ marginTop: '150px' }}>

                <List>
                    {tags.map((tag) => (
                        <ListItem key={tag.id}>
                            <ListItemText primary={tag.name} secondary={tag.description} />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="delete">
                                  
                                <DeleteIcon
                      onClick={() => handleDeleteTag(tag.id)}
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
                    value={newTag.name}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="outlined"
                />
                <TextField
                    label="Description"
                    name="description"
                    value={newTag.description}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="outlined"
                />
                
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddTag}
                    style={{ marginLeft: '10px' }}
                >
                    Add New Tag
                </Button>
            </div>
        </Container>
        </>
    );
}
