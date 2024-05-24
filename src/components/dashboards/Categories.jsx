import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  CircularProgress,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DashboardAPIs } from "../../const/APIs";
import { DashboardNavbar } from "../navbar/DashboardNavbar";

export default function Categories() {
  const { dashboardId } = useParams();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [ratings, setRatings] = useState({});
  const jwtToken = sessionStorage.getItem("budgetPlanner-login")
    ? JSON.parse(sessionStorage.getItem("budgetPlanner-login")).jwt
    : null;

  useEffect(() => {
    fetchCategoriesAndRatings();
  }, [dashboardId, jwtToken]);

  async function fetchCategoriesAndRatings() {
    setIsLoading(true);
    try {
      const categoryResponse = await axios.get(
        DashboardAPIs.getDashboardCategoriesByDashboardId(dashboardId),
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      setCategories(categoryResponse.data);
      await fetchRatings(categoryResponse.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchRatings(categories) {
    const ratingsResponse = await Promise.all(
      categories.map(async (category) => {
        const userRating = await axios
          .get(
            `${DashboardAPIs.getDashboardCategoryByCategoryId(
              dashboardId,
              category.id
            )}/priorities/user`,
            {
              headers: { Authorization: `Bearer ${jwtToken}` },
            }
          )
          .catch(() => ({ data: { priority: 0 } }));

        const calculatedRating = await axios
          .get(
            `${DashboardAPIs.getDashboardCategoryByCategoryId(
              dashboardId,
              category.id
            )}/priorities/calculate`,
            {
              headers: { Authorization: `Bearer ${jwtToken}` },
            }
          )
          .catch(() => ({ data: 0 }));

        return {
          id: category.id,
          userRating: userRating.data.priority,
          calculatedRating: calculatedRating.data,
        };
      })
    );

    const newRatings = ratingsResponse.reduce((acc, rating) => {
      acc[rating.id] = {
        myRating: rating.userRating,
        calculatedRating: rating.calculatedRating,
      };
      return acc;
    }, {});

    setRatings(newRatings);
  }

  const fetchCalculatedRatings = async (categories) => {
    try {
      const ratingsPromises = categories.map(
        (category) =>
          axios
            .get(
              `${DashboardAPIs.getDashboardCategoryByCategoryId(
                dashboardId,
                category.id
              )}/priorities/calculate`,
              {
                headers: { Authorization: `Bearer ${jwtToken}` },
              }
            )
            .catch((e) => ({ data: 0 })) // Assuming 0 as default when error
      );
      const ratingsResponses = await Promise.all(ratingsPromises);
      const newCalculatedRatings = ratingsResponses.map((response, index) => ({
        [categories[index].id]: {
          ...ratings[categories[index].id],
          calculatedRating: response.data,
        },
      }));
      setRatings((prevRatings) => ({
        ...prevRatings,
        ...Object.assign({}, ...newCalculatedRatings),
      }));
    } catch (error) {
      console.error("Error fetching calculated ratings", error);
    }
  };

  const fetchUserRatings = async (categories) => {
    try {
      const userRatingsPromises = categories.map(
        (category) =>
          axios
            .get(
              `${DashboardAPIs.getDashboardCategoryByCategoryId(
                dashboardId,
                category.id
              )}/priorities/user`,
              {
                headers: { Authorization: `Bearer ${jwtToken}` },
              }
            )
            .catch((e) => ({ data: { priority: 0 } })) // Assuming 0 as default when error
      );
      const userRatingsResponses = await Promise.all(userRatingsPromises);
      const newUserRatings = userRatingsResponses.map((response, index) => ({
        [categories[index].id]: {
          ...ratings[categories[index].id],
          myRating: response.data.priority,
        },
      }));
      setRatings((prevRatings) => ({
        ...prevRatings,
        ...Object.assign({}, ...newUserRatings),
      }));
    } catch (error) {
      console.error("Error fetching user ratings", error);
    }
  };

  const handleRateCategory = async (categoryId, priorityValue) => {
    const url = `${DashboardAPIs.getDashboardCategoryByCategoryId(
      dashboardId,
      categoryId
    )}/priorities?priority=${priorityValue}`;
    try {
      await axios.post(
        url,
        {},
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      setRatings((prev) => ({
        ...prev,
        [categoryId]: { ...prev[categoryId], myRating: priorityValue },
      }));
    } catch (error) {
      console.error("Error rating category:", error);
    }
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = async () => {
    if (!jwtToken) {
      console.error("Authentication error: No JWT Token found.");
      return;
    }
    if (!newCategory.name) {
      alert("Please provide a category name.");
      return;
    }
    try {
      await axios.post(
        DashboardAPIs.getDashboardCategoriesByDashboardId(dashboardId),
        newCategory,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      fetchCategoriesAndRatings();
      setNewCategory({ name: "", description: "" }); // Reset form after successful addition
    } catch (error) {
      console.error("Error adding the category", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!jwtToken) {
      console.error("Authentication error: No JWT Token found.");
      return;
    }
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(
          DashboardAPIs.getDashboardCategoryByCategoryId(
            dashboardId,
            categoryId
          ),
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        setCategories((prev) =>
          prev.filter((category) => category.id !== categoryId)
        );
      } catch (error) {
        console.error("Error deleting the category", error);
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
              {categories.map((category) => (
                <ListItem key={category.id}>
                  <ListItemText
                    primary={category.name}
                    secondary={category.description}
                  />
                  <FormControl style={{ margin: "0 20px", width: 100 }}>
                    <InputLabel id={`rating-label-${category.id}`}>
                      Rating
                    </InputLabel>
                    <Select
                      labelId={`rating-label-${category.id}`}
                      value={ratings[category.id]?.myRating || ""}
                      onChange={(e) =>
                        handleRateCategory(category.id, e.target.value)
                      }
                    >
                      {[...Array(10).keys()].map((num) => (
                        <MenuItem key={num + 1} value={num + 1}>
                          {num + 1}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography component={'div'} style={{ margin: "0 10px" }}>
                    Calculated Rating:{" "}
                    {ratings[category.id]?.calculatedRating || 0}
                    <br />
                    My Rating: {ratings[category.id]?.myRating || 0}
                  </Typography>
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteCategory(category.id)}
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
            alignItems: "center", // Align items horizontally in the center
            marginTop: "20px",
          }}
        >
          <TextField
            label="Name"
            name="name"
            value={newCategory.name}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            style={{ marginRight: "10px" }} // Add some right margin to separate the text fields
          />
          <TextField
            label="Description"
            name="description"
            value={newCategory.description}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            style={{ marginRight: "10px" }} // Add some right margin to separate the text fields
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddCategory}
            style={{ height: "52px" }} // Adjust the height to match the text fields
          >
            Create
          </Button>
        </div>
      </Container>
    </>
  );
}
