import { apiRequest } from "./apiClient";

export async function registerAdmin(registerAdminPayload) {
  return apiRequest("/auth/register/admin", {
    method: "POST",
    body: JSON.stringify(registerAdminPayload),
  });
}

export async function registerUser(registerUserPayload) {
  return apiRequest("/auth/register/user", {
    method: "POST",
    body: JSON.stringify(registerUserPayload),
  });
}

export async function loginUser(rollNumber, password) {
  return apiRequest("/auth/login/user", {
    method: "POST",
    body: JSON.stringify({ rollNumber, password }),
  });
}

export async function loginAdmin(rollNumber, password) {
  return apiRequest("/auth/login/admin", {
    method: "POST",
    body: JSON.stringify({ rollNumber, password }),
  });
}