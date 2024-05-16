import '../../../assets/css/nucleo-icons.css'
import '../../../assets/css/nucleo-svg.css'
import '../../../assets/css/soft-ui-dashboard.css?v=1.0.3'
import backgroundImage from '../../../assets/img/curved-images/curved.jpg'
import {Link, useNavigate} from "react-router-dom";
import * as React from "react";
import {useState} from "react";
import {CircularProgress} from "@mui/material";
import axios from "axios";
import {UserAPIs} from "../../../const/APIs";

export const SignIn = () => {

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [userDetails, setUserDetails] = useState({
        userName: "",
        userPassword: ""
    });
    const [loginFailed, setLoginFailed] = useState(false);

    const handleUserDetails = (event) => {
        let value = ''
        if (event.target.name === 'userPassword') {
            value = event.target.value;
        } else {
            value = event.target.value
        }
        setUserDetails({...userDetails, [event.target.name]: value});
        console.log(value)
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault()

        await axios.post(UserAPIs.login, userDetails).then(res=> {
            console.log("Login Success", res)
            sessionStorage.setItem("budgetPlanner-login",JSON.stringify(res.data))
            navigate("/dashboards")
            window.location.reload()
        }).catch(err=> {
            setLoginFailed(true)
            console.error('Error during login:', err.response || err);
        })
    }

    return (
        <>
            <main className="main-content  mt-0">
                <section>
                    <div className="page-header min-vh-75">
                        <div className="container">
                            <div className="row">
                                <div className="col-xl-4 col-lg-5 col-md-6 d-flex flex-column mx-auto">
                                    <div className="card card-plain mt-8">
                                        <div className="card-header pb-0 text-left bg-transparent">
                                            <h3 className="font-weight-bolder text-info text-gradient">Welcome back to Budget Planner</h3>
                                            <p className="mb-0">Please enter correct username and password to Login</p>
                                        </div>
                                        <div className="card-body">
                                            <form>
                                                <label>Username</label>
                                                <div className="mb-3">
                                                    <input name={"userName"} onChange={(e) => handleUserDetails(e)}
                                                           type="text" className="form-control" placeholder="Username"
                                                           aria-label="Username" aria-describedby="Username-addon" required={'required'}/>
                                                </div>
                                                <label>Password</label>
                                                <div className="mb-3">
                                                    <input name={"userPassword"}
                                                           onChange={(e) => handleUserDetails(e)}
                                                           type="password" className="form-control"
                                                           placeholder="Password"
                                                           aria-label="Password" aria-describedby="password-addon" required={'required'}/>
                                                </div>
                                                <div className="text-center">
                                                    {loginFailed === true ? <b style={{color: 'red'}}>INVALID USERNAME OR PASSWORD</b> : ""}
                                                </div>
                                                <div className="text-center">
                                                    <button type="button" onClick={(e)=> handleRegisterSubmit(e)}
                                                            className="btn bg-gradient-info w-100 mt-4 mb-0">
                                                        {isLoading ? <CircularProgress/> : <b>Sign in</b>}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="card-footer text-center pt-0 px-lg-2 px-1">
                                            <p className="mb-4 text-sm mx-auto">
                                                Don't have an account?
                                                <Link to="/register"
                                                      className="text-info text-gradient font-weight-bold">Sign
                                                    up</Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="oblique position-absolute top-0 h-100 d-md-block d-none me-n8">
                                        <div
                                            className="oblique-image bg-cover position-absolute fixed-top ms-auto h-100 z-index-0 ms-n6"
                                            style={{backgroundImage: `url(${backgroundImage})`}}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
