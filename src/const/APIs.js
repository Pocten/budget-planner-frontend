// Mess Menu APIs
import { BASE_URL } from "./const";

export const UserAPIs = {
    register: `${BASE_URL}/auth/register`,
    login: `${BASE_URL}/auth/login`,
    update: `${BASE_URL}/v1/users`,
}

export const DashboardAPIs = {
    create: (userId) => `${BASE_URL}/v1/users/${userId}/dashboards`,
    getAllDashboardsByUserId: (userId) => `${BASE_URL}/v1/users/${userId}/dashboards`,
    getUserDashboardById: (userId, dashboardId) => `${BASE_URL}/v1/users/${userId}/dashboards/${dashboardId}`,
    update: (userId, dashboardId) => `${BASE_URL}/v1/users/${userId}/dashboards/${dashboardId}`,
    delete: () => `${BASE_URL}/v1/dashboards`,
    getUserFinancialRecordsByDashboardId: (dashboardId) => `${BASE_URL}/v1/dashboards/${dashboardId}/financial-records`,
    getFinancialRecordById: (dashboardId, id) => `${BASE_URL}/v1/dashboards/${dashboardId}/financial-records/${id}`,
    getDashboardCategoriesByDashboardId: (dashboardId) => `${BASE_URL}/v1/dashboards/${dashboardId}/categories`,
    getDashboardCategoryByCategoryId: (dashboardId, id) => `${BASE_URL}/v1/dashboards/${dashboardId}/categories/${id}`,

}