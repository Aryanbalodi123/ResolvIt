import { apiRequest } from "./apiClient";

export async function sendComplaint(complaintPayload) {
    return apiRequest("/complaints", {
        method: "POST",
        body: JSON.stringify(complaintPayload),
    });
}

export async function retrieveComplaint() {
    return apiRequest("/complaints");
}