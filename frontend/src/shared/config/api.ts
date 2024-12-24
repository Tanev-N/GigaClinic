export const API_BASE_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    },
    PROFILE: {
        DOCTOR: `${API_BASE_URL}/api/profile/doctor`,
        PATIENT: `${API_BASE_URL}/api/profile/patient`,
        APPOINTMENTS: `${API_BASE_URL}/api/profile/appointments`,
        DELETE_APPOINTMENT: (id: number) => `${API_BASE_URL}/api/profile/appointments/${id}`,
    },
    DOCTOR: {
        APPOINTMENTS: `${API_BASE_URL}/api/doctor/appointments`,
        ADD_DIAGNOSIS: `${API_BASE_URL}/api/doctor/add-diagnosis`,
    },
    SCHEDULE: {
        DOCTORS: `${API_BASE_URL}/api/schedule/doctors`,
        DEPARTMENTS: `${API_BASE_URL}/api/schedule/departments`,
        DOCTORS_BY_DEPARTMENT: (id: number) => `${API_BASE_URL}/api/schedule/doctors/${id}`,
    },
    APPOINTMENT: {
        CREATE: `${API_BASE_URL}/api/appointment/create`,
        AVAILABLE_SLOTS: (doctorId: number, date: string) => 
            `${API_BASE_URL}/api/appointment/available-slots?doctor_id=${doctorId}&date=${date}`,
    },
    REPORTS: {
        TYPES: `${API_BASE_URL}/api/reports/types`,
        AVAILABLE_DOCTORS: `${API_BASE_URL}/api/reports/available-doctors`,
        AVAILABLE_DIAGNOSES: `${API_BASE_URL}/api/reports/available-diagnoses`,
        HISTORY: `${API_BASE_URL}/api/reports/history`,
        AVAILABLE_MONTHS: `${API_BASE_URL}/api/reports/available-months`,
        AVAILABLE_MONTHS_BY_DOCTOR: (doctorId: string) => 
            `${API_BASE_URL}/api/reports/available-months/${doctorId}`,
        GENERATE: `${API_BASE_URL}/api/reports/generate`,
        DETAILS: (reportId: number) => `${API_BASE_URL}/api/reports/details/${reportId}`,
        DELETE: (reportId: number) => `${API_BASE_URL}/api/reports/${reportId}`,
    },
    ADMIN: {
        PROFILE: `${API_BASE_URL}/api/admin/profile`,
        TABLES: `${API_BASE_URL}/api/admin/tables`,
        TABLE_DATA: (table: string) => `${API_BASE_URL}/api/admin/table/${table}`,
        TABLE_SCHEMA: (table: string) => `${API_BASE_URL}/api/admin/table/${table}/schema`,
    },
}; 