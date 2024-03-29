// Mess Menu APIs
import {BASE_URL} from "./const";

export const UserAPIs = {
    register: `${BASE_URL}/auth/register`,
    login: `${BASE_URL}/auth/login`,
    update: `${BASE_URL}/v1/users`,
}

export const DashboardAPIs = {
    create: `${BASE_URL}/v1/users/{userId}/dashboards`,
    getAllDashboardsByUserId: `${BASE_URL}/v1/users/{userId}/dashboards`,
    getUserDashboardById: `${BASE_URL}/v1/users/{userId}/dashboards/{dashboardId}`,
    update: `${BASE_URL}/v1/users/{userId}/dashboards/{dashboardId}`,
    delete: `${BASE_URL}/v1/dashboards`,
}