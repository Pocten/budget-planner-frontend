import '../../assets/css/nucleo-icons.css'
import '../../assets/css/nucleo-svg.css'
import '../../assets/css/soft-ui-dashboard.css?v=1.0.3'
import {Link} from "react-router-dom";

export const Footer = () => {
    return (
        <>
            <footer style={{marginTop: '15%'}} className="footer py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 mb-4 mx-auto text-center">
                            <span className="text-secondary me-xl-5 me-3 mb-sm-0 mb-2">
                                 <Link to={"/about-us"}><strong>About Us</strong></Link>
                            </span>
                            <span className="text-secondary me-xl-5 me-3 mb-sm-0 mb-2">
                                <Link to={"/"}><strong>Our Services</strong></Link>

                            </span>
                            <span className="text-secondary me-xl-5 me-3 mb-sm-0 mb-2">
                                <Link to={"/contact"}><strong>Customer Support</strong></Link>

                            </span>
                        </div>
                    </div>
                </div>
            </footer>
            <div className="row">
                <div className="col-8 mx-auto text-center mt-1">
                    <p className="mb-0 text-secondary">
                        Copyright © <script>
                        document.write(new Date().getFullYear())
                    </script> Flash Card App
                    </p>
                </div>
            </div>
        </>
    )
}
