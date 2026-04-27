import { apiRequest } from "./apiClient";

export const getUserDetails = async (userId) => {
  try {
    return await apiRequest(`/users/${String(userId).trim()}`);
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    throw error;
  }
};

export const updateUserDetails = async (userId, updates) => {
  try {
    return await apiRequest(`/users/${String(userId).trim()}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error('Error updating user details:', error.message);
    throw error;
  }
};

export const getUserComplaints = async (userId) => {
  try {
    return await apiRequest(`/users/${String(userId).trim()}/complaints`);
  } catch (error) {
    console.error('Error fetching user complaints:', error.message);
    throw error;
  }
};

export const getUserLostItems = async (userId) => {
  try {
    return await apiRequest(`/users/${String(userId).trim()}/lost-items`);
  } catch (error) {
    console.error('Error fetching lost items:', error.message);
    throw error;
  }
};