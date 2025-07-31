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
  lastScanTime: string;
  counter: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
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