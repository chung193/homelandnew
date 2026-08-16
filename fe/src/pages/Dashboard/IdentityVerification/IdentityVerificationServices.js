import { authInstance } from '@services/axios';

export const getIdentityVerifications = (params = {}) => authInstance.get('admin/identity-verifications', { params });
export const reviewIdentityVerification = (id, data) => authInstance.patch(`admin/identity-verifications/${id}`, data);
export const getIdentityVerificationDocument = (id, side) => authInstance.get(`admin/identity-verifications/${id}/documents/${side}`, { responseType: 'blob' });
