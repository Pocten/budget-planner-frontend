import '../../assets/css/nucleo-icons.css'
import '../../assets/css/nucleo-svg.css'
import '../../assets/css/soft-ui-dashboard.css?v=1.0.3'
import {Link} from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import LockIcon from '@mui/icons-material/Lock';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import WidgetsIcon from '@mui/icons-material/Widgets';
import PersonIcon from '@mui/icons-material/Person';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { DashboardAPIs } from '../../const/APIs';

export const Navbar = () => {
    const navigate = useNavigate();
    const { dashboardId } = useParams();
    const [userName, setUserName] = useState('');
    const jwtToken = sessionStorage.getItem('budgetPlanner-login')
    ? JSON.parse(sessionStorage.getItem('budgetPlanner-login')).jwt
    : null;
    const userId = sessionStorage.getItem('budgetPlanner-login') ? JSON.parse(window.atob(jwtToken.split('.')[1])).userId : null;
    const [isLoading, setIsLoading] = useState(true);


    const handleLogout = () => {
        sessionStorage.removeItem("budgetPlanner-login")
        navigate("/")
        window.location.reload()
    }
    const fetchUserDetails = useCallback(async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(
            DashboardAPIs.getUserById(userId),
            { headers: { Authorization: `Bearer ${jwtToken}` } }
          );
          setUserName(response.data.userName);
        } catch (error) {
          console.error("Error fetching username ", error);
        } finally {
          setIsLoading(false);
        }
      }, [dashboardId, jwtToken]);
      useEffect(() => {
        fetchUserDetails();
    }, [fetchUserDetails]);

    return (
        <>
            <div className="container background position-sticky z-index-sticky top-0">
                <div className="row">
                    <div className="col-12">
                        <nav
                            className="navbar background navbar-expand-lg blur blur-rounded top-1 z-index-4 shadow position-absolute my-3 py-2 start-1 end-0 mx-3" id="firstNavbar">
                            <div className="container-fluid font text-bold">
                                <span className="navbar-brand font-weight-bolder ms-lg-0 ms-3 ">
                                    <Link to={"/"}><PersonPinIcon/> Hello, {userName} </Link>
                                </span>

                                <button className="navbar-toggler font-weight-bolder shadow-none ms-2" type="button"
                                        data-bs-toggle="collapse" data-bs-target="#mainNavbarCollapse"
                                        aria-controls="mainNavbarCollapse" aria-expanded="false" aria-label="Toggle navigation" id="firstNavbar">
                                  <span className="navbar-toggler-icon mt-2">
                                    <span className="navbar-toggler-bar bar1"/>
                                    <span className="navbar-toggler-bar bar2"/>
                                    <span className="navbar-toggler-bar bar3"/>
                                  </span>
                                </button>
                                <div className="collapse navbar-collapse" id="mainNavbarCollapse">
                                    <ul className="navbar-nav mx-auto">
                                       
                                        <li className="nav-item">
                                            <span className="nav-link me-2 font-weight-bolder">
                                                <i className="fa fa-user opacity-6 text-dark me-1"/>
                                                <Link to={"/dashboards"}><WidgetsIcon/> My Dashboards </Link>
                                            </span>
                                        </li>
                                        <li className="nav-item">
                                            <span className="nav-link me-2 font-weight-bolder">
                                                <i className="fa fa-user opacity-6 text-dark me-1"/>
                                                <Link to={"/profile"}><PersonIcon/> My Profile </Link>
                                            </span>
                                        </li>
                                       
                                    </ul>
                                    {
                                        sessionStorage.getItem("budgetPlanner-login") === null ?
                                            <ul className="navbar-nav d-lg-block">
                                                <li className="nav-item">
                                                    <Link to={"/login"}>
                                                        <span
                                                            className="btn font-weight-bolder btn-sm btn-round mb-0 me-1 bg-gradient-dark"><LoginIcon/>  Login</span>
                                                    </Link>
                                                </li>
                                            </ul>
                                            :
                                            <ul className="navbar-nav d-lg-block">
                                                <li className="nav-item">
                                                    <button onClick={() => handleLogout()}  className="btn font-weight-bolder btn-sm btn-round mb-0 me-1 bg-gradient-dark"><LockIcon/> Logout</button>
                                                </li>
                                            </ul>
                                    }
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    )
}
