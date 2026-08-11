import { authInstance } from '@services/axios';

export const getOwnerApplications = (params = {}) => authInstance.get('admin/owner-applications', { params });
export const getOwnerApplication = (id) => authInstance.get(`admin/owner-applications/${id}`);
export const reviewOwnerApplication = (id, data) => authInstance.patch(`admin/owner-applications/${id}`, data);
export const setTestPostingCredits = (id, credits) => authInstance.patch(`admin/owner-applications/${id}/test-posting-credits`, { credits });
export const getOwnerDocument = (id, type) => authInstance.get(`admin/owner-applications/${id}/documents/${type}`, { responseType: 'blob' });
