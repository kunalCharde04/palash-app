import { BookingData } from '../@types/interface';
import api from './config';

export const fetchMembershipPlans = async () => {
    const response = await api.get('/memberships/fetch-membership-plans');
    return response.data;
};


export const createMembershipOrder = async (params: any) => {
  const response = await api.post('/memberships/create-membership-order', params);
  return response.data;
};


export const verifyMembershipOrder = async (params: any) => {
  const response = await api.post('/memberships/verify-membership-order', params);
  return response.data;
};


export const subscribeToMembership = async (params: any) => {
  const response = await api.post('/memberships/subscribe-to-membership', params);
  return response.data;
};


export const isAlreadySubscribed = async (params: any) => {
  const response = await api.post('/memberships/is-already-subscribed', params);
  return response.data;
};


export const getUserMembership = async (params: any) => {
  const response = await api.post('/memberships/get-user-membership', params);
  return response.data;
};


export const getUserMemberships = async () => {
  const response = await api.get('/memberships/fetch-user-membership');
  return response.data;
};

export const cancelUserMembership = async (membershipId: string) => {
  const response = await api.post('/memberships/cancel-membership', { membershipId });
  return response.data;
};

export const submitMembershipInterest = async (data: {
  name: string;
  email: string;
  phone: string;
  planName: string;
  planCost: number;
  message?: string;
}) => {
  const response = await api.post('/memberships/submit-interest', data);
  return response.data;
};

export const getMembershipInterests = async (status?: string) => {
  const url = status ? `/memberships/interests?status=${status}` : '/memberships/interests';
  const response = await api.get(url);
  return response.data.interests; // Return the interests array from the response
};

export const updateMembershipInterestStatus = async (id: string, status: string) => {
  const response = await api.patch(`/memberships/interests/${id}/status`, { status });
  return response.data;
};
