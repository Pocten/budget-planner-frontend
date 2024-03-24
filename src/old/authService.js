import axios from 'axios';

const API_URL = 'https://budget-planner-backend-c5122df5a273.herokuapp.com/api/auth';

const register = (username, email, password) => {
    return axios.post(`${API_URL}/register`, {
        userName: username,
        userEmail: email,
        userPassword: password,
    }).catch((error) => {
        console.error('Error during registration:', error);
        throw error;
    });
};

const login = (username, password) => {
    return axios.post(`${API_URL}/login`, {
        userName: username,
        userPassword: password,
    }).then((response) => {
        if (response.data && response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    }).catch((error) => {
        console.error('Error during login:', error);
        throw error;
    });
};


const logout = () => {
    localStorage.removeItem('user');
};

export default {
    register,
    login,
    logout,
};
