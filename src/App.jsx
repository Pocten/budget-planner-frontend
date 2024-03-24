import {Navbar} from "./components/navbar/Navbar";
import {routesAfterLogin, routesBeforeLogin} from "./components/routes/routes";
import {Footer} from "./components/footer/Footer";


export const App = () => {

    return (
        <>
            {
                sessionStorage.getItem("flipcard-login") !== null ? <>
                    <Navbar/>
                    {routesAfterLogin()}
                    <Footer/>
                </> : routesBeforeLogin()
            }
        </>
    )
}
