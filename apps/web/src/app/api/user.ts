import api from "./config";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  phone_or_email: string;
  date_of_birth: string;
  avatar?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * {
    "id": "b10f5464-a13b-4744-8704-02ebd247c60d",
    "phone_or_email": "priyanshu-kun101@outlook.com",
    "avatar": null,
    "name": "kun",
    "username": "kun",
    "date_of_birth": "5666-05-02T00:00:00.000Z",
    "role": "USER",
    "created_at": "2025-04-18T12:12:17.322Z",
    "updated_at": "2025-04-18T12:12:17.322Z"
}
 */

interface UpdateUserProfile {
  name?: string;
  username?: string;
  bio?: string;
  profilePicture?: string;
}

/**
 * Fetch the current user's profile
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get('/users/profile/me');
  return response.data;
};

/**
 * Update the current user's profile
 */
export const updateUserProfile = async (data: UpdateUserProfile): Promise<UserProfile> => {
  const response = await api.patch('/users/profile', data);
  return response.data;
};

/**
 * Fetch another user's public profile by username
 */
export const getUserByUsername = async (username: string): Promise<UserProfile> => {
  const response = await api.get(`/users/${username}`);
  return response.data;
};

export const fetchUsers = async (): Promise<any> => {
  const response = await api.get('/admin/users/fetch-users');
  return response.data;
};

export const deleteUser = async (id: string): Promise<any> => {
  console.log(id)
  const response = await api.delete(`/admin/users/delete-user/${id}`);
  return response.data;
};

