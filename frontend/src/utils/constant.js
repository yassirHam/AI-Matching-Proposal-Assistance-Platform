const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export const USER_API_END_POINT = `${API_BASE}/api/v1/users`;
export const JOB_API_END_POINT = `${API_BASE}/api/v1/jobs`;
export const APPLICATION_API_END_POINT = `${API_BASE}/api/v1/applications`;
export const COMPANY_API_END_POINT = `${API_BASE}/api/v1/companies`;