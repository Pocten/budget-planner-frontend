import * as React from "react";
import {Link, useNavigate} from "react-router-dom";
import {CircularProgress} from "@mui/material";
import {useState} from "react";
import axios from "axios";
import {UserAPIs} from "../../const/APIs";
import { useEffect } from "react";

export default function EditProfile() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [userDetails, setUserDetails] = useState({
        userName: '',
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const fetchUserDetails = async () => {
            const storedData = sessionStorage.getItem('budgetPlanner-login');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                const jwtToken = parsedData.jwt; // assuming the JWT token is stored with the key 'jwt'
                if (jwtToken) {
                    const base64Url = jwtToken.split('.')[1];
                    const base64 = base64Url.replace('-', '+').replace('_', '/');
                    const payload = JSON.parse(window.atob(base64));

                    const userId = payload.user_id; // This key depends on how the payload is structured

                    try {
                        const response = await axios.get('https://budget-planner-backend-c5122df5a273.herokuapp.com/api/v1/users/8', {
                            headers: {
                                Authorization: `Bearer ${jwtToken}`,
                            },
                        });
                        setUserDetails(response.data); // Assuming you have a state or function to set user details
                    } catch (error) {
                        console.error('Error fetching user details', error);
                        // Handle error (e.g., showing an error message)
                    }
                } else {
                    console.log("No JWT Token found");
                    // Handle the absence of a token (e.g., redirect to login page)
                }
            }
        };

        fetchUserDetails();
    }, []); // Empty dependency array means this effect will only run once, similar to componentDidMount


    const handleUserDetailsChange = (event) => {
        setUserDetails({
            ...userDetails,
            [event.target.name]: event.target.value,
        });
    };

    const handleUpdateProfile = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            // Update user profile details
            await axios.put(UserAPIs.updateProfile, userDetails);
            navigate('/profile'); // Redirect to the profile page after successful update
        } catch (error) {
            setErrorMessage('Failed to update profile.');
        }
        setIsLoading(false);
    };

    return (
        <>
            <br/><br/><br/>
            <main className="main-content mt-3">
                <section>
                    <div className="page-header min-vh-25">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-lg-12">
                                    <div className="card-header">
                                        <span className={"text-bold me-4"}>You may update your Profile info.</span>
                                        <button className="btn btn-dark  btn-rounded-full text-bold"><Link
                                            className={"text-white"} to={"/"}> Cancel</Link></button>
                                        <hr/>

                                    </div>
                                    <div className="card card-body">
                                        <div className="card">
                                            <div className="card-body">
                                                <form>
                                                    <div className="row">

                                                        <div className="col-md-12 col-lg-12 col-sm-12">
                                                            <div className="mb-3">
                                                                <label>Username</label>
                                                                <input onChange={e => handleUserDetailsChange(e)}
                                                                       value={userDetails.userName} name={'userName'}
                                                                       type="text" className="form-control"
                                                                       placeholder="Username"
                                                                       aria-label="Username"
                                                                       aria-describedby="username-addon"/>
                                                            </div>
                                                            <div className="mb-3">
                                                                <label>Email</label>

                                                                <input onChange={e => handleUserDetailsChange(e)}
                                                                       value={userDetails.userEmail} name={'userEmail'}
                                                                       type="userEmail"
                                                                       className="form-control"
                                                                       placeholder="Email"
                                                                       aria-label="Email"
                                                                       aria-describedby="email-addon"/>
                                                            </div>

                                                        </div>
                                                        <div className="col-md-12 col-lg-12 col-sm-12">
                                                            <div className="mb-3">
                                                                <label>Password</label>

                                                                <input onChange={e => handleUserDetailsChange(e)}
                                                                       value={userDetails.userPassword}
                                                                       name={"userPassword"}
                                                                       type="password" className="form-control"
                                                                       placeholder="Password"
                                                                       aria-label="Password"
                                                                       aria-describedby="password-addon"/>
                                                            </div>

                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-center">
                                                            {errorMessage !== '' &&
                                                                <b style={{color: 'red'}}>{errorMessage}</b>}
                                                        </div>
                                                        <button onClick={handleUpdateProfile} type="button"
                                                                className="btn bg-gradient-dark w-100 my-4 mb-2">
                                                            {isLoading ? <CircularProgress/> : <b>Update Info</b>}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>

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