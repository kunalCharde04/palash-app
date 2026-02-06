import { apiClient as api } from ".";

export interface MembershipGroup {
  primaryUser: {
    id: string;
    name: string;
    isActive: boolean;
    email: string;
  };
  rfidCardId: string | null;
  totalGroupMembers: number;
  beneficiaries: Array<{
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  }>;
}

export const fetchMembershipGroups = async (): Promise<MembershipGroup[]> => {
  try {
    const response = await api.get('/admin/users/membership-groups');
    return response.data;
  } catch (error) {
    console.error('Error fetching membership groups:', error);
    throw error;
  }
};

export const assignRfidToGroup = async (userId: string, email: string, rfidCardId: string): Promise<any> => {
  try {
    const response = await api.post('/admin/users/assign-rfid', {
      userId,
      email,
      rfidCardId
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning RFID:', error);
    throw error;
  }
};

export const removeRfidFromGroup = async (userId: string, email: string): Promise<any> => {
  try {
    const response = await api.delete(`/admin/users/unassign-rfid`, {
      data: { userId, email }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing RFID:', error);
    throw error;
  }
};

export interface RfidScan {
  userId: string | null;
  rfidCardId: string;
  lastScanTime: string;
  scanTimestamp: string;
}

export interface RfidUsageMembership {
  membershipId: string;
  rfidCardId: string;
  rfidScanHistory: RfidScan[];
  lastScanTime: string | null;
  counter: number;
  isPrimary: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  plan?: {
    name: string;
    cost: number;
  } | null;
}

/**
 * Fetch RFID usage analytics for memberships
 */
export const fetchRfidUsageAnalytics = async (): Promise<RfidUsageMembership[]> => {
  try {
    const response = await api.get('/admin/attendance/rfid-usage');
    return response.data;
  } catch (error) {
    console.error('Error fetching RFID usage analytics:', error);
    throw error;
  }
};

export interface SubscribedMembership {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  isPrimary: boolean;
  isActive: boolean;
  parentMembershipId: string | null;
  lastScanTime: string;
  counter: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    phone_or_email: string;
  };
}

export const fetchAllSubscribedMemberships = async (): Promise<SubscribedMembership[]> => {
  try {
    const response = await api.get('/admin/fetch-all-subscribed-memberships');
    return response.data;
  } catch (error) {
    console.error('Error fetching all subscribed memberships:', error);
    throw error;
  }
};

export interface AdminCreateUserDTO {
  name: string;
  phoneOrEmail: string;
  planId?: string;
  memberEmails?: string[]; // For backward compatibility
  beneficiaries?: Array<{ name: string; email: string }>; // New format with names
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
}

export interface AdminCreateUserResponse {
  message: string;
}

export interface VerifyAdminCreateUserOtpDTO {
  phoneOrEmail: string;
  otp: string;
}

export interface AdminCreateUserVerifyResponse {
  message: string;
  user: {
    id: string;
    name: string;
    phone_or_email: string;
    is_verified: boolean;
  };
  membership?: {
    primaryMembership: any;
    totalMembers: number;
    memberships: any[];
  };
}

export const adminCreateUser = async (data: AdminCreateUserDTO): Promise<AdminCreateUserResponse> => {
  try {
    const response = await api.post('/admin/users/admin-create-user', data);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const verifyAdminCreateUserOtp = async (data: VerifyAdminCreateUserOtpDTO): Promise<AdminCreateUserVerifyResponse> => {
  try {
    const response = await api.post('/admin/users/verify-admin-create-user-otp', data);
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export interface SendBeneficiaryOtpDTO {
  beneficiaryEmail: string;
  beneficiaryName: string;
  primaryUserEmail: string;
}

export interface VerifyBeneficiaryOtpDTO {
  beneficiaryEmail: string;
  otp: string;
  primaryMembershipId: string;
}

export const sendBeneficiaryOtp = async (data: SendBeneficiaryOtpDTO) => {
  try {
    const response = await api.post('/admin/users/send-beneficiary-otp', data);
    return response.data;
  } catch (error) {
    console.error('Error sending beneficiary OTP:', error);
    throw error;
  }
};

export const verifyBeneficiaryOtp = async (data: VerifyBeneficiaryOtpDTO) => {
  try {
    const response = await api.post('/admin/users/verify-beneficiary-otp', data);
    return response.data;
  } catch (error) {
    console.error('Error verifying beneficiary OTP:', error);
    throw error;
  }
};

/**
 * Remove a specific membership from a user
 */
export const removeMembershipFromUser = async (userId: string, membershipId: string) => {
  try {
    const response = await api.post('/admin/users/remove-membership', { userId, membershipId });
    return response.data;
  } catch (error) {
    console.error('Error removing membership:', error);
    throw error;
  }
};

/**
 * Deactivate all memberships for a user
 */
export const deactivateUserMemberships = async (userId: string) => {
  try {
    const response = await api.post('/admin/users/deactivate-memberships', { userId });
    return response.data;
  } catch (error) {
    console.error('Error deactivating memberships:', error);
    throw error;
  }
};

/**
 * Cancel a booking (service) for a user
 */
export const cancelUserBooking = async (userId: string, bookingId: string) => {
  try {
    const response = await api.post('/admin/users/cancel-booking', { userId, bookingId });
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

/**
 * Update payment status for a membership
 */
export const updateMembershipPaymentStatus = async (
  membershipId: string,
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'
) => {
  try {
    const response = await api.post('/admin/users/update-payment-status', { membershipId, paymentStatus });
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

/**
 * Assign a membership plan to a user
 */
export const assignMembershipToUser = async (
  userId: string,
  planId: string,
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'
) => {
  try {
    const response = await api.post('/admin/users/assign-membership', { userId, planId, paymentStatus });
    return response.data;
  } catch (error) {
    console.error('Error assigning membership:', error);
    throw error;
  }
}; 