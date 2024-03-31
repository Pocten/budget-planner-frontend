import {Route, Routes} from "react-router-dom";
import {SignIn} from "../public/login/SignIn";
import {Register} from "../public/Register";
import {Welcome} from "../home/Welcome";
import {ErrorPage} from "../public/error/404";
import {AboutUs} from "../public/AboutUs";
import {ContactMe} from "../contact/ContactMe";
import EditProfile from "../public/EditProfile";
import Dashboard from "../dashboards/Dashboard";
import ListDashboards from "../dashboards/ListDashboards";
import {DashboardNavbar} from '../navbar/DashboardNavbar';
import MyStatistics from "../dashboards/MyStatistics";
import Categories from "../dashboards/Categories";
export const routesBeforeLogin = () => {
    return <Routes>
        <Route path={"/"} element={<SignIn/>}/>
        <Route path={"/login"} element={<SignIn/>}/>
        <Route path={"/register"} element={<Register/>}/>
    </Routes>;
}

export const routesAfterLogin = () => {
    return <Routes>
        <Route path={"/"} element={<Welcome/>}/>
        <Route path={"/home"} element={<Welcome/>}/>
        <Route path={"*"} element={<ErrorPage/>}/>
        <Route path={"/profile"} element={<EditProfile/>}/>
        <Route path={"/dashboards"} element={<ListDashboards/>}/>
        <Route path="/dashboard/:dashboardId" element={<Dashboard />} />
        <Route path="/dashboard/:dashboardId" element={<DashboardNavbar />} />
        <Route path="/dashboard/:dashboardId/categories" element={<Categories />} />
        <Route path={"/contact"} element={<ContactMe/>}/>
        <Route path={"/about-us"} element={<AboutUs/>}/>
        <Route path={"/edit-profile"} element={<EditProfile/>}/>
        <Route path="/dashboard/:dashboardId/my-statistics" element={<MyStatistics />} />
    </Routes>;
}
