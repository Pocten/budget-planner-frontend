import axios from 'axios';

const API_URL = 'https://budget-planner-backend-c5122df5a273.herokuapp.com/api/v1/users';

const getUserProfile = (id) => {
    // Assuming the token is stored in the local storage (add authorization header if needed)
    return axios.get(`${API_URL}/${id}`);
};

const updateUserProfile = (id, data) => {
    // Assuming the token is stored in the local storage (add authorization header if needed)
    return axios.put(`${API_URL}/${id}`, data);
};

export default {
    getUserProfile,
    updateUserProfile,
};
