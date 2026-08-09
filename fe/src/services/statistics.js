import { authInstance } from './axios';

export const getStatisticsDashboard = async () => {
    try {
        const response = await authInstance.get('/statistics/dashboard');
        return response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        throw error;
    }
};

export const getMonthlyTrends = async () => {
    try {
        const response = await authInstance.get('/statistics/monthly-trends');
        return response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching monthly trends:', error);
        throw error;
    }
};
