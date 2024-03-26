import '../../assets/css/nucleo-icons.css'
import '../../assets/css/nucleo-svg.css'
import '../../assets/css/soft-ui-dashboard.css?v=1.0.3'
import backgroundImage from '../../assets/img/curved-images/curved12.jpg'
import * as React from 'react';
import {useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {CircularProgress} from "@mui/material";
import Snackbar from '@mui/material/Snackbar';
import axios from "axios";
import {UserAPIs} from "../../const/APIs";

export const Register = () => {
    const [userDetails, setUserDetails] = useState({
        userName:"",
        userEmail:"",
        userPassword:''
    });
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [errors, setError] = useState({});
    const [confirmPassword, setConfirmPassword] = useState('');


    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowToast(false);
    };

    const validate = () => {
        let tempErrors = {};
        tempErrors.userName = userDetails.userName.length > 3 ? "" : "Username must be at least 4 characters long.";
        tempErrors.userEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(userDetails.userEmail) ? "" : "Email is not valid.";
        tempErrors.userPassword = userDetails.userPassword.length > 5 ? "" : "Password must be at least 6 characters long.";
        tempErrors.confirmPassword = userDetails.userPassword === confirmPassword ? "" : "Passwords do not match.";
        setError({...tempErrors});
        return Object.values(tempErrors).every(x => x === "");
    }

    const handleUserDetails = (event) => {
        let value = event.target.value
        setUserDetails({...userDetails, [event.target.name]: value});
    }
    const handleRegisterSubmit = async (e) => {
        e.preventDefault()
        if(validate()) {
        setIsLoading(true)
        await axios.post(UserAPIs.register, userDetails).then(res => {
            setShowToast(true)
            setUserDetails({
                userName:"",
                userEmail:"",
                userPassword:''
            })
            setIsLoading(false)
            navigate("/")
        }).catch(error => {
            setIsLoading(false);
            if (error.response && (error.response.status === 400 || error.response.status === 409)) {
                console.error("Registration failed:", error.response.data.message);
                setError({ form: error.response.data.message });
            } else {
                console.error("Registration error:", error);
                setError({ form: "Username or Email already exists" });
            }
        })}
    }

   


    return (
        <>
            <div className="main-content  mt-0">
                <div className="container ms-40">
                    <div>
                        <section className="min-vh-100 mb-8">
                            <div className="page-header align-items-start min-vh-50 pt-5 pb-11 m-3 border-radius-lg"
                                 style={{backgroundImage: `url(${backgroundImage})`}}>
                                <span className="mask bg-gradient-dark opacity-6"/>
                                <div className="container">
                                    <div className="row justify-content-center">
                                        <div className="col-md-6 col-lg-4 text-center mx-auto">
                                            <h1 className="text-white mb-2 mt-5">Welcome!</h1>
                                            <p className="text-lead text-white">Please Enter your details to signup for
                                                Budget Planner</p>
                                        </div>
                                    </div>
                                    <div className="card">
                                        {errors.form && <div className="alert alert-danger" role="alert">{errors.form}</div>}

                                        <div className="card-body">
                                            <form>
                                            <div className="row">
    <div className="col-12 mb-3">
        <input onChange={e => handleUserDetails(e)}
               value={userDetails.userName} name={'userName'}
               type="text" className="form-control"
               placeholder="User Name"
               aria-label="User name"
               aria-describedby="user-name-addon"/>
        {errors.userName && <div className="error-message">{errors.userName}</div>}
    </div>

    <div className="col-12 mb-3">
        <input onChange={e => handleUserDetails(e)}
               value={userDetails.userEmail}
               name={"userEmail"}
               type="email" className="form-control"
               placeholder="Email"
               aria-label="Email"
               aria-describedby="email-addon"/>
        {errors.userEmail && <div className="error-message">{errors.userEmail}</div>}
    </div>

    <div className="col-12 mb-3">
        <input onChange={e => handleUserDetails(e)}
               value={userDetails.userPassword}
               name={"userPassword"}
               type="password" className="form-control"
               placeholder="Password"
               aria-label="Password"
               aria-describedby="password-addon"/>
        {errors.userPassword && <div className="error-message">{errors.userPassword}</div>}
    </div>

    <div className="col-12 mb-3">
        <input onChange={e => setConfirmPassword(e.target.value)}
               value={confirmPassword}
               type="password" className="form-control"
               placeholder="Confirm Password"
               aria-label="Confirm Password"
               aria-describedby="confirm-password-addon"/>
        {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
    </div>
</div>
                                                <div className="text-center">
                                                    <button onClick={(e) => handleRegisterSubmit(e)} type="button"
                                                            className="btn bg-gradient-dark w-100 my-4 mb-2">
                                                        {isLoading ? <CircularProgress/> : <b>Sign Up</b>}
                                                    </button>

                                                </div>
                                                <p className="text-sm mt-3 mb-0">Already have an account? <Link
                                                    to={"/login"} className="text-dark font-weight-bolder">Sign
                                                    in</Link>
                                                </p>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {
                                showToast &&
                                <Snackbar
                                    open={showToast}
                                    autoHideDuration={6000}
                                    onClose={handleClose}
                                    message="Request to Admin for Approval"
                                />
                            }
                        </section>
                    </div>
                </div>
            </div>
        </>
    )
}
