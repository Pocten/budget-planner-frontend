import React, { useEffect } from 'react'; // Import useEffect
import {Navbar} from "./components/navbar/Navbar";
import {routesAfterLogin, routesBeforeLogin} from "./components/routes/routes";
import {Footer} from "./components/footer/Footer";
import { useNavigate } from 'react-router-dom';
import './services/authServices';

export const App = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const onTokenExpired = () => {
            alert('Your session has expired, please log in again.');
            navigate('/login'); 
            sessionStorage.clear(); 
        };

        window.handleSessionTimeout = onTokenExpired; 
    }, [navigate]);

    return (
        <>
            {
                sessionStorage.getItem("budgetPlanner-login") !== null ? <>
                    <Navbar/>
                    {routesAfterLogin()}
                    <Footer/>
                </> : routesBeforeLogin()
            }
        </>
    )
}
