import React from 'react';
import '../../assets/css/nucleo-icons.css'
import '../../assets/css/nucleo-svg.css'
import '../../assets/css/soft-ui-dashboard.css?v=1.0.3'
import {Link} from "react-router-dom";
import { useParams } from 'react-router-dom';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import EqualizerIcon from '@mui/icons-material/Equalizer';
export const DashboardNavbar = () => {
    const { dashboardId } = useParams();

  return (
    <>
      <div className="container background position-sticky z-index-sticky top-7">
                <div className="row" id="secondNavbar">
                    <div className="col-12">
                        <nav
                            className="navbar background navbar-expand-lg blur blur-rounded top-0 z-index-1020 shadow position-absolute my-3 py-2 start-1 end-0 mx-3" id="secondNavbar">
                            <div className="container-fluid font text-bold">
                                
                            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#secondNavbarCollapse" aria-controls="secondNavbarCollapse" aria-expanded="false" aria-label="Toggle navigation" id="secondNavbar">

                                  <span className="navbar-toggler-icon mt-2">
                                    <span className="navbar-toggler-bar bar1"/>
                                    <span className="navbar-toggler-bar bar2"/>
                                    <span className="navbar-toggler-bar bar3"/>
                                  </span>
                                </button>
                                <div class="collapse navbar-collapse" id="secondNavbarCollapse">
                                    <ul className="navbar-nav mx-auto">

                                    <li className="nav-item">
                                            <span className="nav-link me-2 font-weight-bolder">
                                                <i className="fa fa-user opacity-6 text-dark me-1"/>
                                                <Link to={`/dashboard/${dashboardId}/categories`}><EqualizerIcon/> My Categories </Link>
                                            </span>
                                        </li>
                                        <li className="nav-item">
                                            <span className="nav-link me-2 font-weight-bolder">
                                                <i className="fa fa-user opacity-6 text-dark me-1"/>
                                                <Link to={`/dashboard/${dashboardId}/tags`}><EqualizerIcon/> My Tags </Link>
                                            </span>
                                        </li>
                                        <li className="nav-item">
                                            <span
                                                className="nav-link font-weight-bolder d-flex align-items-center me-2 active"
                                                aria-current="page">
                                                <i className="fa fa-chart-pie opacity-6 text-dark me-1"/>
                                                <Link to={`/dashboard/${dashboardId}`}><AttachMoneyIcon/>My expenses</Link>
                                            </span>
                                        </li>
                                        <li className="nav-item">
                                            <span className="nav-link me-2 font-weight-bolder">
                                                <i className="fa fa-user opacity-6 text-dark me-1"/>
                                                <Link to={`/dashboard/${dashboardId}/my-budgets`}><StackedLineChartIcon/> My Budgets </Link>
                                            </span>
                                        </li>
                                        <li className="nav-item">
                                            <span className="nav-link me-2 font-weight-bolder">
                                                <i className="fa fa-user opacity-6 text-dark me-1"/>
                                                <Link to={`/dashboard/${dashboardId}/my-financial-goals`}><EqualizerIcon/> My Financial Goals </Link>
                                            </span>
                                        </li>
                                        <li className="nav-item">
                                            <span className="nav-link me-2 font-weight-bolder">
                                                <i className="fa fa-user opacity-6 text-dark me-1"/>
                                                <Link to={`/dashboard/${dashboardId}/users-access`}><EqualizerIcon/> Users Access </Link>
                                            </span>
                                        </li>
                                        
                                        
                                    </ul>
                                    
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
    </>
  );
};

