import '../../../assets/css/nucleo-icons.css'
import '../../../assets/css/nucleo-svg.css'
import '../../../assets/css/soft-ui-dashboard.css?v=1.0.3'
import {Link} from "react-router-dom";
import PageNotFoundImage from '../../../assets/img/404.gif'

export const ErrorPage = () => {
    return (
        <>
            <div style={{marginTop: '20%', alignContent: 'center', marginBottom: '50% '}}
                 className="container ms-5 card">
                <img style={{width: '20%', marginLeft: '40%'}} src={PageNotFoundImage} alt="404"/>
                <Link style={{color: 'white'}} to={"/"}>
                    <button className="btn btn-lg btn-round mb-0 me-1 bg-gradient-dark">Go to Home Screen</button>
                </Link>

            </div>
        </>
    )
}
