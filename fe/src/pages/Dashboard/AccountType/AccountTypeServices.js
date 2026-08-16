import {authInstance} from '@services/axios';
export const getAccountTypes=()=>authInstance.get('admin/account-types');
export const createAccountType=data=>authInstance.post('admin/account-types',data);
export const updateAccountType=(id,data)=>authInstance.put(`admin/account-types/${id}`,data);
