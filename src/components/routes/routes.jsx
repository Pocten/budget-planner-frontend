import {Route, Routes} from "react-router-dom";
import {SignIn} from "../public/login/SignIn";
import {Register} from "../public/Register";
import EditProfile from "../public/EditProfile";
import Dashboard from "../dashboards/Dashboard";
import ListDashboards from "../dashboards/ListDashboards";
import {DashboardNavbar} from '../navbar/DashboardNavbar';
import Categories from "../dashboards/Categories";
import Budgets from "../dashboards/Budgets";
import FinancialGoals from "../dashboards/FinancialGoals"
import UsersAccess from "../dashboards/UsersAccess";
export const routesBeforeLogin = () => {
    return <Routes>
        <Route path={"/"} element={<SignIn/>}/>
        <Route path={"/login"} element={<SignIn/>}/>
        <Route path={"/register"} element={<Register/>}/>
    </Routes>;
}

export const routesAfterLogin = () => {
    return <Routes>
        <Route path={"*"} element={<ListDashboards/>}/>
        <Route path={"/profile"} element={<EditProfile/>}/>
        <Route path={"/dashboards"} element={<ListDashboards/>}/>
        <Route path="/dashboard/:dashboardId" element={<Dashboard />} />
        <Route path="/dashboard/:dashboardId" element={<DashboardNavbar />} />
        <Route path="/dashboard/:dashboardId/categories" element={<Categories />} />
        <Route path={"/edit-profile"} element={<EditProfile/>}/>
        <Route path="/dashboard/:dashboardId/my-budgets" element={<Budgets />} />
        <Route path="/dashboard/:dashboardId/my-financial-goals" element={<FinancialGoals />} />
        <Route path="/dashboard/:dashboardId/users-access" element={<UsersAccess />} />
    </Routes>;
}


