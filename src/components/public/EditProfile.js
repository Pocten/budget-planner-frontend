import * as React from "react";
import {Link, useNavigate} from "react-router-dom";
import {CircularProgress} from "@mui/material";
import {useState} from "react";
import axios from "axios";
import { useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';


export default function EditProfile() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [userDetails, setUserDetails] = useState({
        userName: '',
        userEmail: '',
        userPassword: '',
    });
    const [userId, setUserId] = useState(null); 
    const [isLoading, setIsLoading] = useState(false);
    const [jwtToken, setJwtToken] = useState(null); 
    const [updateSuccess, setUpdateSuccess] = useState(false); 
    const [openDialog, setOpenDialog] = useState(false);


    useEffect(() => {
        const fetchUserDetails = async () => {
            const storedData = sessionStorage.getItem('budgetPlanner-login');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                const jwtToken = parsedData.jwt;
                setJwtToken(jwtToken); 
                if (jwtToken) {
                    const base64Url = jwtToken.split('.')[1];
                    const base64 = base64Url.replace('-', '+').replace('_', '/');
                    const payload = JSON.parse(window.atob(base64));
                    const fetchedUserId = payload.userId; 

                    setUserId(fetchedUserId); 

                    try {
                        const response = await axios.get(`https://budget-planner-backend-c5122df5a273.herokuapp.com/api/v1/users/${fetchedUserId}`, {
                            headers: {
                                Authorization: `Bearer ${jwtToken}`,
                            },
                        });
                        setUserDetails(response.data);
                    } catch (error) {
                        console.error('Error fetching user details', error);
                    }
                } else {
                    console.log("No JWT Token found");
                }
            }
        };

        fetchUserDetails();
    }, []);

    const handleUserDetailsChange = (event) => {
        setUserDetails({
            ...userDetails,
            [event.target.name]: event.target.value,
        });
    };

    const handleUpdateProfile = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setUpdateSuccess(false); 
        setErrorMessage('');

        if (!jwtToken || !userId) {
            setErrorMessage('Authentication error: No JWT Token or User ID found.');
            return;
        }
        
        const updatePayload = {
            userEmail: userDetails.userEmail,
            userPassword: userDetails.userPassword, 
        };

        setIsLoading(true);
        try {
            await axios.put(`https://budget-planner-backend-c5122df5a273.herokuapp.com/api/v1/users/${userId}`, updatePayload, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });
            setUpdateSuccess(true);
            navigate('/profile');
        } catch (error) {
            console.error('Failed to update profile', error);
            setErrorMessage('Failed to update profile.');
            setUpdateSuccess(false); 

        }
        setIsLoading(false);
    };

    const handleDeleteAccount = async () => {
        const storedData = sessionStorage.getItem('budgetPlanner-login');
        if (!storedData) {
            alert('Authentication error. Please log in again.');
            return;
        }
    
        const parsedData = JSON.parse(storedData);
        const jwtToken = parsedData.jwt; 
    
        try {
            await axios.delete(`https://budget-planner-backend-c5122df5a273.herokuapp.com/api/v1/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}` 
                }
            });
            alert('Your account has been successfully deleted.');
            sessionStorage.clear();            
            window.location.href = '/';
        } catch (error) {
            console.error('There was an error deleting the account', error);
            alert('Failed to delete the account. Please try again.');
        }
    };
    
      const openConfirmationDialog = () => {
        setOpenDialog(true);
      };
    
      const closeConfirmationDialog = () => {
        setOpenDialog(false);
      };
    
      const handleDialogConfirm = () => {
        handleDeleteAccount();
        closeConfirmationDialog();
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
                                                                       aria-describedby="username-addon"
                                                                       readOnly/>
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
                                                                       
                                                                       name={"userPassword"}
                                                                       type="password" className="form-control"
                                                                       placeholder="Password"
                                                                       aria-label="Password"
                                                                       aria-describedby="password-addon"/>
                                                            </div>
                                                        </div>
            <div className="text-center">
                <button onClick={openConfirmationDialog} type="button"
                        className="btn btn-danger w-100 my-4 mb-2">
                    Delete Account
                </button>
            </div>
 
            <Dialog
                open={openDialog}
                onClose={closeConfirmationDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Account Deletion"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete your account? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirmationDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDialogConfirm} color="secondary" autoFocus>
                        Delete Account
                    </Button>
                </DialogActions>
            </Dialog>
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
                                                    {/* Dialog for confirming account deletion */}
           
                                                </form>
                                                {updateSuccess && (
                <div className="alert alert-success" role="alert">
                    You successfully updated your profile!
                </div>
            )}
            {errorMessage && (
                <div className="alert alert-danger" role="alert">
                    {errorMessage}
                </div>
            )}
            
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