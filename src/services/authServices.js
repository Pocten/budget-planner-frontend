import axios from 'axios';
import { jwtDecode } from "jwt-decode";

// Retrieve the token from sessionStorage
export function getToken() {
    const sessionData = sessionStorage.getItem('budgetPlanner-login');
    return sessionData ? JSON.parse(sessionData).jwt : null;
}

export function isTokenExpired(token) {
    try {
        const decoded = jwtDecode(token);
        return decoded.exp < Date.now() / 1000;
    } catch (error) {
        return true;
    }
}


axios.interceptors.response.use(response => response, error => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
        const token = getToken();
        if (token && isTokenExpired(token)) {
            originalRequest._retry = true;
            sessionStorage.removeItem('budgetPlanner-login');
            alert('Your session has expired. Please log in again.');
            window.location.href = '/login';
            return Promise.reject(error);
        }
    }

    return Promise.reject(error);
});

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