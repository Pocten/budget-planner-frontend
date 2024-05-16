import axios from 'axios';
import { jwtDecode } from "jwt-decode";

// Retrieve the token from sessionStorage
export function getToken() {
    const sessionData = sessionStorage.getItem('budgetPlanner-login');
    return sessionData ? JSON.parse(sessionData).jwt : null;
}

// Function to check if the token is expired
export function isTokenExpired(token) {
    try {
        const decoded = jwtDecode(token);
        return decoded.exp < Date.now() / 1000; // Check if token expiration time is less than current time
    } catch (error) {
        return true; // Assume token is invalid or expired if there's an error decoding it
    }
}

// Axios interceptor to handle token expiration on any response
axios.interceptors.response.use(response => response, error => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
        // 401 Unauthorized response
        const token = getToken();
        if (token && isTokenExpired(token)) {
            originalRequest._retry = true;
            sessionStorage.removeItem('budgetPlanner-login'); // Optional: Clear session storage or specific token
            alert('Your session has expired. Please log in again.');
            window.location.href = '/login'; // Redirect to login page
            return Promise.reject(error);
        }
    }

    return Promise.reject(error);
});

// Function to set the header with token for all axios requests
export function setAuthToken(token) {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
}

// Initialize token on app load
const token = getToken();
if (token && !isTokenExpired(token)) {
    setAuthToken(token);
} else if (token) {
    alert('Your session has expired. Please log in again.');
    sessionStorage.removeItem('budgetPlanner-login');
    window.location.href = '/login';
}