import { apiRequest } from "./apiClient";

export async function getAllComplaints() {
  return apiRequest("/admin/complaints");
}


export async function updateComplaint(complaintId, updates) {
  return apiRequest(`/admin/complaints/${complaintId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}