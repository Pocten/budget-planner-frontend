import '../../assets/css/nucleo-icons.css'
import '../../assets/css/nucleo-svg.css'
import '../../assets/css/soft-ui-dashboard.css?v=1.0.3'
import * as React from "react";
import {useState} from "react";
import emailjs from '@emailjs/browser';
import {CircularProgress} from "@mui/material";

export const ContactMe = () => {
    const [userMessage, setUserMessage] = useState({
        from_name: null,
        from_email: null,
        message: null
    })
    const [isLoading, setIsLoading] = useState(false)
    // const [disabled, setDisabled] = useState(false)

    const sendEmail = (e) => {
        e.preventDefault();
        setIsLoading(true)
        emailjs.send('service_xgnlwal', 'template_a6dbukm', {
            from_name: userMessage.from_name,
            from_email: userMessage.from_email,
            message: userMessage.message,
        }, "cZt_pnJ63NjO0AsBg").then(r => {
            setIsLoading(false)
            setUserMessage({
                from_name: null,
                from_email: null,
                message: null
            })
        }).catch(err => {
            setIsLoading(false)
            console.log(err)
        });
    };
    const handleFieldsChange = (e) => {
        let value = e.target.value
        setUserMessage({...userMessage, [e.target.name]: value});

    }
    return (
        <main className="mt-7">
            <div className="container position-sticky z-index-sticky top-0">
                <div className="row">
                    <div className="col-12">
                        <div className="card background">
                            <div className="card-body">
                                <form>
                                    <div className="row font">
                                        <h4>Hello! Welcome please enter some details to contact me</h4>
                                        <div className="col-md-12 col-lg-6 col-sm-12">
                                            <div className="mb-3">
                                                <label for="subject">Your Nice Name</label>
                                                <input value={userMessage.from_name} name={'from_name'}
                                                       type="text" className="form-control font"
                                                       onChange={e => handleFieldsChange(e)}
                                                       placeholder="Please enter your nice name"
                                                       aria-label="from_name"
                                                       aria-describedby="from_name-addon"/>
                                            </div>
                                            <div className="mb-3 font">
                                                <label htmlFor="from_email">Your Email</label>
                                                <input value={userMessage.from_email} name={'from_email'}
                                                       type="text" className="form-control font"
                                                       onChange={e => handleFieldsChange(e)}
                                                       placeholder="Your Email Address"
                                                       aria-label="from_email"
                                                       aria-describedby="from_email-addon"/>
                                            </div>
                                        </div>
                                        <div className="col-md-12 font col-lg-6 col-sm-12">
                                            <div className="mb-3">
                                                <label htmlFor="message">Message Body</label>
                                                <textarea style={{height: '120px'}}
                                                          onChange={e => handleFieldsChange(e)}
                                                          value={userMessage.message} name={'message'}
                                                          className="form-control font"
                                                          placeholder="Message Body"
                                                          aria-label="Body" aria-describedby="body-addon"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center font">
                                        <button onClick={sendEmail} type="button"
                                                className="btn bg-gradient-dark font w-100 my-4 mb-2">
                                            {isLoading ? <CircularProgress/> : <>Send Email Now</>}                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}